export interface UptimeEvent {
    id: string;
    type: 'ADD_SERVICE' | 'REMOVE_SERVICE' | 'UPDATE_SERVICE';
    payload: any;
    timestamp: number;
    user?: string; // Admin email or ID
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
    error?: string;
}

export const EVENT_TYPES = {
    ADD_SERVICE: 'ADD_SERVICE',
    REMOVE_SERVICE: 'REMOVE_SERVICE',
    UPDATE_SERVICE: 'UPDATE_SERVICE',
} as const;
