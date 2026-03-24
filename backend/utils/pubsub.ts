import { PubSub } from 'graphql-subscriptions'

// Subscription event name constants
export const EVENTS = {
    PROJECT_UPDATED:        'PROJECT_UPDATED',
    PROJECT_HISTORY_ADDED:  'PROJECT_HISTORY_ADDED',
} as const

// Define types for each event payload
export type PubSubEvents = {
    [EVENTS.PROJECT_UPDATED]:        { projectUpdated: any },
    [EVENTS.PROJECT_HISTORY_ADDED]:  { projectHistoryAdded: any },
}

// Singleton PubSub instance shared across the entire backend
export const pubsub = new PubSub<PubSubEvents>()
