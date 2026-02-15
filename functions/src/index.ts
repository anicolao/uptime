import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { UptimeEvent, EVENT_TYPES, Service, ServiceStatus } from "./types";

admin.initializeApp();
const db = admin.database();

// Event Sourcing Projection: Events -> Services
export const processEvent = functions.database.ref('/events/{eventId}').onCreate(async (snapshot, context) => {
    const event = snapshot.val() as UptimeEvent;
    // const eventId = context.params.eventId;

    // Validate event structure
    if (!event.type || !event.payload) {
        console.error("Invalid event structure", event);
        return;
    }

    const servicesRef = db.ref('services');

    switch (event.type) {
        case EVENT_TYPES.ADD_SERVICE:
            const newService = event.payload as Service;
            await servicesRef.child(newService.id).set(newService);
            console.log(`Added service: ${newService.name}`);
            break;

        case EVENT_TYPES.REMOVE_SERVICE:
            const serviceIdToRemove = event.payload.id;
            await servicesRef.child(serviceIdToRemove).remove();
            // Also remove status and history? Maybe keep history?
            await db.ref(`status/${serviceIdToRemove}`).remove();
            console.log(`Removed service: ${serviceIdToRemove}`);
            break;

        case EVENT_TYPES.UPDATE_SERVICE:
            const updatedService = event.payload as Service;
            await servicesRef.child(updatedService.id).update(updatedService);
            console.log(`Updated service: ${updatedService.name}`);
            break;

        default:
            console.warn("Unknown event type", event.type);
    }
});

// 1-Minute Monitor: Services -> Status & History
export const checkServices = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
    await performChecks();
});

export const manualCheck = functions.https.onRequest(async (req, res) => {
    // Re-use logic or just call the internal function if possible? 
    // Cloud Functions doesn't easily allow calling triggers.
    // I'll just copy-paste the body logic to a shared function or...
    // For MVP, just duplicating the logic call or refactoring.
    // Let's refactor `performChecks` to a separate async function.
    await performChecks();
    res.send("Checks completed.");
});

async function performChecks() {
    const servicesSnapshot = await db.ref('services').once('value');
    const services = servicesSnapshot.val() as Record<string, Service> | null;

    if (!services) {
        console.log("No services to check.");
        return;
    }

    const checks = Object.values(services).map(async (service) => {
        const start = Date.now();
        let up = false;
        let error = "";

        try {
            const response = await fetch(service.url, { method: 'HEAD' });
            if (response.ok) {
                up = true;
            } else {
                up = false;
                error = `HTTP ${response.status}`;
            }
        } catch (e: any) {
            up = false;
            error = e.message;
        }

        const latency = Date.now() - start;
        const status: ServiceStatus = {
            id: service.id,
            up,
            latency,
            lastChecked: Date.now(),
            error: up ? undefined : error
        };

        await db.ref(`status/${service.id}`).set(status);
        await db.ref(`history/${service.id}`).push(status);

        return status;
    });

    await Promise.all(checks);
    console.log(`Checked ${checks.length} services.`);
}
