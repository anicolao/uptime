export const EVENT_TYPES = {
  ADD_SERVICE: "ADD_SERVICE",
  REMOVE_SERVICE: "REMOVE_SERVICE",
  UPDATE_SERVICE: "UPDATE_SERVICE",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export interface UptimeEvent {
  type: EventType;
  payload: unknown;
  timestamp: number;
  user?: string;
}

export interface Service {
  id: string;
  url: string;
  name: string;
  createdAt: number;
  createdBy?: string;
}

export interface ServiceStatus {
  id: string;
  up: boolean;
  latency: number;
  lastChecked: number;
  statusCode?: number;
  error?: string;
}

export interface ComponentVersions {
  functions: string;
  databaseRules: string;
}
