import { ProjectHistory, User, Project } from "../models";

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

    await ProjectHistory.create({
        projectId,
        entityType,
        entityId,
        changeType,
        changeSummary,
        changedBy,
    })
}

export default addProjectHistory