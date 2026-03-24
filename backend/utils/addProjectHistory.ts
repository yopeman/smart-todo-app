import { ProjectHistory, User, Project } from "../models";
import { pubsub, EVENTS } from "./pubsub";

const addProjectHistory = async (
    projectId: string,
    entityType: 'project' | 'task' | 'subtask' | 'member',
    entityId: string,
    changeType: 'create' | 'update' | 'delete' | 'status change' | 'role change',
    changeSummary: string,
    changedBy: string,
) => {
    
    const project = await Project.findByPk(projectId)
    if (!project) throw new Error('Project not found')

    const user = await User.findByPk(changedBy)
    if (!user) throw new Error('User not found')

    const history = await ProjectHistory.create({
        projectId,
        entityType,
        entityId,
        changeType,
        changeSummary,
        changedBy,
    })

    const row = history.get({ plain: true })
    pubsub.publish(EVENTS.PROJECT_HISTORY_ADDED, { projectHistoryAdded: row })

    if (['project', 'task', 'subtask'].includes(entityType)) {
        pubsub.publish(EVENTS.PROJECT_UPDATED, { projectUpdated: project })
    }
    
    return row
}

export default addProjectHistory