import { Project, Task, ProjectHistory, ProjectMember, AIInteraction, User } from "../models";
import { ChatOllama } from '@langchain/ollama'
import * as z from 'zod'
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const reportProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    return await AIInteraction.create({
        ...input,
        userId: context.user.id,
        actionType: 'report',
    })
}

export default reportProject