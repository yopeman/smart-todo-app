import { PubSub } from 'graphql-subscriptions'

// Subscription event name constants
export const EVENTS = {
    PROJECT_UPDATED:        'PROJECT_UPDATED',
    TASK_UPDATED:           'TASK_UPDATED',
    SUBTASK_UPDATED:        'SUBTASK_UPDATED',
    PROJECT_HISTORY_ADDED:  'PROJECT_HISTORY_ADDED',
    AI_RESPONSE_RECEIVED:   'AI_RESPONSE_RECEIVED',
} as const

// Define types for each event payload
export type PubSubEvents = {
    [EVENTS.PROJECT_UPDATED]:        { projectUpdated: any },
    [EVENTS.TASK_UPDATED]:           { taskUpdated: any },
    [EVENTS.SUBTASK_UPDATED]:        { subtaskUpdated: any },
    [EVENTS.PROJECT_HISTORY_ADDED]:  { projectHistoryAdded: any },
    [EVENTS.AI_RESPONSE_RECEIVED]:   { aiResponseReceived: any },
}

// Singleton PubSub instance shared across the entire backend
export const pubsub = new PubSub<PubSubEvents>()
