import { Project, Task, ProjectHistory, ProjectMember, AIInteraction, User } from "../models";

export const createProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    return await AIInteraction.create({
        ...input,
        userId: context.user.id,
        actionType: 'create',
    })
}

export const editProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    return await AIInteraction.create({
        ...input,
        userId: context.user.id,
        actionType: 'edit',
    })
}

export const reportProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    return await AIInteraction.create({
        ...input,
        userId: context.user.id,
        actionType: 'report',
    })
}