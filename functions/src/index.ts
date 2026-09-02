import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getDatabase} from "firebase-admin/database";
import {logger, setGlobalOptions} from "firebase-functions/v2";
import {onValueCreated} from "firebase-functions/v2/database";
import {onRequest, type Request} from "firebase-functions/v2/https";
import {defineString} from "firebase-functions/params";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {
  ComponentVersions,
  EVENT_TYPES,
  Service,
  ServiceStatus,
  UptimeEvent,
} from "./types";

const emulatorDatabaseHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
const emulatorProjectId = process.env.GCLOUD_PROJECT;
initializeApp(
  emulatorDatabaseHost && emulatorProjectId ? {
    projectId: emulatorProjectId,
    databaseURL: `http://${emulatorDatabaseHost}?ns=${emulatorProjectId}`,
  } : undefined,
);
setGlobalOptions({region: "us-central1", maxInstances: 1});

const db = getDatabase();
const buildGitSha = defineString("BUILD_GIT_SHA", {default: "development"});
const databaseRulesGitSha = defineString("DATABASE_RULES_GIT_SHA", {
  default: "development",
});
const alertWebhookUrl = defineString("ALERT_WEBHOOK_URL", {default: ""});

const checkTimeoutMs = 10_000;
const historyRetentionMs = 24 * 60 * 60 * 1000;
const checkLockTtlMs = 55_000;

export const processEvent = onValueCreated("/events/{eventId}", async (event) => {
  const uptimeEvent = event.data.val() as UptimeEvent;

  if (!isValidEvent(uptimeEvent)) {
    logger.error("Rejected invalid event", {eventId: event.params.eventId});
    return;
  }

  switch (uptimeEvent.type) {
  case EVENT_TYPES.ADD_SERVICE:
  case EVENT_TYPES.UPDATE_SERVICE: {
    const service = uptimeEvent.payload as Service;
    await db.ref(`services/${service.id}`).set(service);
    logger.info("Projected service event", {
      eventId: event.params.eventId,
      serviceId: service.id,
      type: uptimeEvent.type,
    });
    return;
  }
  case EVENT_TYPES.REMOVE_SERVICE: {
    const {id} = uptimeEvent.payload as {id: string};
    await db.ref().update({
      [`services/${id}`]: null,
      [`status/${id}`]: null,
      [`history/${id}`]: null,
    });
    logger.info("Removed service projection", {
      eventId: event.params.eventId,
      serviceId: id,
    });
  }
  }
});

export const checkServices = onSchedule("every 1 minutes", async () => {
  const result = await performChecks();
  if (!result.started) logger.warn("Skipped overlapping scheduled check");
});

export const manualCheck = onRequest(
  {cors: true, timeoutSeconds: 60},
  async (request, response) => {
    const uid = await authenticate(request);
    if (!uid) {
      response.status(401).json({error: "Authentication required"});
      return;
    }

    const adminSnapshot = await db.ref(`admins/${uid}`).get();
    if (adminSnapshot.val() !== true) {
      response.status(403).json({error: "Administrator access required"});
      return;
    }

    const result = await performChecks();
    if (!result.started) {
      response.status(409).json({error: "A service check is already running"});
      return;
    }

    response.json({checked: result.checked});
  },
);

export const version = onRequest({cors: true}, async (request, response) => {
  const uid = await authenticate(request);
  if (!uid) {
    response.status(401).json({error: "Authentication required"});
    return;
  }

  const versions: ComponentVersions = {
    functions: buildGitSha.value(),
    databaseRules: databaseRulesGitSha.value(),
  };
  response.set("Cache-Control", "private, no-store").json(versions);
});

async function authenticate(request: Request): Promise<string | null> {
  const authorization = request.header("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  try {
    const token = authorization.slice("Bearer ".length);
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    logger.warn("ID token verification failed", {error});
    return null;
  }
}

async function performChecks(): Promise<{started: boolean; checked: number}> {
  const lockRef = db.ref("system/checkLock");
  const now = Date.now();
  const lock = await lockRef.transaction((current: unknown) => {
    if (typeof current === "number" && current > now - checkLockTtlMs) return;
    return now;
  });

  if (!lock.committed) return {started: false, checked: 0};

  try {
    const servicesSnapshot = await db.ref("services").get();
    const services = servicesSnapshot.val() as Record<string, Service> | null;
    if (!services) return {started: true, checked: 0};

    const statuses = await Promise.all(Object.values(services).map(checkService));
    logger.info("Completed uptime checks", {count: statuses.length});
    return {started: true, checked: statuses.length};
  } finally {
    await lockRef.remove();
  }
}

async function checkService(service: Service): Promise<ServiceStatus> {
  const statusRef = db.ref(`status/${service.id}`);
  const previous = (await statusRef.get()).val() as ServiceStatus | null;
  const startedAt = Date.now();
  let statusCode: number | undefined;
  let error: string | undefined;

  try {
    const response = await fetch(service.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(checkTimeoutMs),
    });
    statusCode = response.status;
    await response.body?.cancel();
    if (!response.ok) error = `HTTP ${response.status}`;
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Request failed";
  }

  const lastChecked = Date.now();
  const status: ServiceStatus = {
    id: service.id,
    up: error === undefined,
    latency: lastChecked - startedAt,
    lastChecked,
    ...(statusCode === undefined ? {} : {statusCode}),
    ...(error === undefined ? {} : {error}),
  };

  await db.ref().update({
    [`status/${service.id}`]: status,
    [`history/${service.id}/${lastChecked}`]: status,
  });
  await pruneHistory(service.id, lastChecked - historyRetentionMs);

  if ((!previous && !status.up) || (previous && previous.up !== status.up)) {
    await sendAlert(service, status);
  }
  return status;
}

async function pruneHistory(serviceId: string, cutoff: number): Promise<void> {
  const historyRef = db.ref(`history/${serviceId}`);
  const expired = await historyRef.orderByChild("lastChecked").endAt(cutoff).get();
  if (!expired.exists()) return;

  const removals: Record<string, null> = {};
  expired.forEach((snapshot) => {
    removals[snapshot.key as string] = null;
  });
  await historyRef.update(removals);
}

async function sendAlert(service: Service, status: ServiceStatus): Promise<void> {
  const webhookUrl = alertWebhookUrl.value();
  if (!webhookUrl) return;

  const text = `${service.name} is ${status.up ? "operational" : "down"}`;
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({text, content: text, service, status}),
      signal: AbortSignal.timeout(checkTimeoutMs),
    });
    if (!response.ok) {
      logger.error("Alert webhook rejected notification", {
        serviceId: service.id,
        status: response.status,
      });
    }
  } catch (error) {
    logger.error("Alert webhook failed", {serviceId: service.id, error});
  }
}

function isValidEvent(event: UptimeEvent): boolean {
  if (!event || typeof event !== "object" || !Number.isFinite(event.timestamp)) return false;

  if (event.type === EVENT_TYPES.REMOVE_SERVICE) {
    const payload = event.payload as {id?: unknown} | null;
    return Boolean(payload && isValidId(payload.id));
  }

  if (event.type !== EVENT_TYPES.ADD_SERVICE && event.type !== EVENT_TYPES.UPDATE_SERVICE) {
    return false;
  }

  const service = event.payload as Partial<Service> | null;
  if (!service || !isValidId(service.id)) return false;
  if (typeof service.name !== "string" || !service.name.trim() || service.name.length > 100) {
    return false;
  }
  if (typeof service.createdAt !== "number" || !Number.isFinite(service.createdAt)) {
    return false;
  }

  try {
    const url = new URL(service.url as string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}
