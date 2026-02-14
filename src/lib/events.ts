import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Event Types
export type EventType =
    | 'SERVICE_ADDED'
    | 'SERVICE_REMOVED'
    | 'SERVICE_UPDATED'
    | 'CHECK_PASSED'
    | 'CHECK_FAILED';

export interface BaseEvent {
    type: EventType;
    timestamp: any; // Firestore Timestamp
    payload: any;
}

export interface ServiceAddedEvent extends BaseEvent {
    type: 'SERVICE_ADDED';
    payload: {
        id: string;
        name: string;
        url: string;
        interval: number;
    };
}

export interface CheckResultEvent extends BaseEvent {
    type: 'CHECK_PASSED' | 'CHECK_FAILED';
    payload: {
        serviceId: string;
        latency: number;
        statusCode: number;
        error?: string;
    };
}

// Logger
export const logEvent = async (type: EventType, payload: any) => {
    try {
        await addDoc(collection(db, "events"), {
            type,
            payload,
            timestamp: serverTimestamp()
        });
        console.log(`[EVENT LOGGED] ${type}`, payload);
    } catch (e) {
        console.error("Error logging event:", e);
        throw e;
    }
};
