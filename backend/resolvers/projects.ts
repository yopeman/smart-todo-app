import { Project, User, ProjectMember, Task, ProjectHistory, AIInteraction } from '../models'
import { Op } from 'sequelize'
import PERMISSIONS from '../utils/projectPermissions'

const mapPriorityToEnum = (priority: unknown) => {
    if (!priority) return null
    const normalized = String(priority).trim().toUpperCase()
    if (normalized === 'HIGH' || normalized === 'MEDIUM' || normalized === 'LOW') return normalized
    return null
}

const mapUrgentImportantMatrixToEnum = (value: unknown) => {
    if (!value) return null
    const normalized = String(value).trim().toLowerCase()
    if (normalized === 'urgent_important' || normalized === 'urgent_important_matrix') return 'URGENT_IMPORTANT'
    if (normalized === 'urgent_not_important') return 'URGENT_NOT_IMPORTANT'
    if (normalized === 'not_urgent_important') return 'NOT_URGENT_IMPORTANT'
    if (normalized === 'not_urgent_not_important') return 'NOT_URGENT_NOT_IMPORTANT'

    if (normalized === 'urgent & important') return 'URGENT_IMPORTANT'
    if (normalized === 'urgent & not important') return 'URGENT_NOT_IMPORTANT'
    if (normalized === 'not urgent & important') return 'NOT_URGENT_IMPORTANT'
    if (normalized === 'not urgent & not important') return 'NOT_URGENT_NOT_IMPORTANT'

    const asEnum = String(value).trim().toUpperCase()
    if (
        asEnum === 'URGENT_IMPORTANT' ||
        asEnum === 'URGENT_NOT_IMPORTANT' ||
        asEnum === 'NOT_URGENT_IMPORTANT' ||
        asEnum === 'NOT_URGENT_NOT_IMPORTANT'
    ) return asEnum
    return null
}

const mapStatusToEnum = (status: unknown) => {
    if (!status) throw new Error('Invalid project status: empty')
    const normalized = String(status).trim().toLowerCase()
    if (normalized === 'todo') return 'TODO'
    if (normalized === 'in progress' || normalized === 'in_progress') return 'IN_PROGRESS'
    if (normalized === 'done') return 'DONE'

    const asEnum = String(status).trim().toUpperCase()
    if (asEnum === 'TODO' || asEnum === 'IN_PROGRESS' || asEnum === 'DONE') return asEnum
    throw new Error(`Invalid project status: ${String(status)}`)
}

export const project = async (id: string, context: any) => {
    const userId = context.user.id
    const visibilityConditions: any[] = [{ isPublic: true }]
    if (userId) {
        visibilityConditions.push({ ownerId: userId })
        visibilityConditions.push({
            id: {
                [Op.in]: Project.sequelize?.literal(`(SELECT project_id FROM project_members WHERE user_id = '${userId}' AND is_deleted = false)`)
            }
        })
    }

    const project = await Project.findOne({
        where: {
            id,
            isDeleted: false,
            [Op.or]: visibilityConditions
        },
        raw: true
    })

    if (!project) throw new Error('Project not found or you do not have access')
    return project
}

export const projects = async (context: any, status?: string, is_public?: boolean, owner_id?: string) => {
    const userId = context.user.id
    const where: any = { isDeleted: false }
    if (status) where.status = status
    if (is_public !== undefined) where.isPublic = is_public
    if (owner_id) where.ownerId = owner_id

    const visibilityConditions: any[] = [{ isPublic: true }]
    if (userId) {
        visibilityConditions.push({ ownerId: userId })
        visibilityConditions.push({
            id: {
                [Op.in]: Project.sequelize?.literal(`(SELECT project_id FROM project_members WHERE user_id = '${userId}' AND is_deleted = false)`)
            }
        })
    }

    where[Op.and] = [
        { [Op.or]: visibilityConditions }
    ]

    return await Project.findAll({ where, raw: true })
}

export const my_projects = async (context: any) => {
    return await Project.findAll({ where: { ownerId: context.user.id, isDeleted: false }, raw: true })
}

export const shared_projects = async (context: any) => {
    return await Project.findAll({
        include: [{
            model: ProjectMember,
            as: 'projectMemberDetails',
            where: { userId: context.user.id, isDeleted: false }
        }],
        where: {
            ownerId: { [Op.ne]: context.user.id },
            isDeleted: false
        },
        raw: true
    })
}

export const createProject = async (input: any, context: any) => {
    const project = await Project.create({
        ...input,
        ownerId: context.user.id,
    })
    return project.toJSON()
}

export const updateProject = async (id: string, input: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const project = await Project.findOne({ where: { id, isDeleted: false } })
    if (!project) throw new Error('Project not found')

    const member = await ProjectMember.findOne({
        where: { projectId: id, userId: context.user.id, isDeleted: false }
    })

    const role = project.ownerId === context.user.id ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes('update') : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    await project.update(input)
    return project.toJSON()
}

export const updateProjectStatus = async (id: string, status: unknown, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const project = await Project.findOne({ where: { id, isDeleted: false } })
    if (!project) throw new Error('Project not found')

    const member = await ProjectMember.findOne({
        where: { projectId: id, userId: context.user.id, isDeleted: false }
    })

    const role = project.ownerId === context.user.id ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes('update') : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    const nextStatus = mapStatusToEnum(status)
    const completedAt = nextStatus === 'DONE' ? new Date() : null

    await project.update({ status: nextStatus, completedAt })
    return project.toJSON()
}

export const deleteProject = async (id: string, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const project = await Project.findOne({ where: { id, isDeleted: false } })
    if (!project) throw new Error('Project not found')

    const member = await ProjectMember.findOne({
        where: { projectId: id, userId: context.user.id, isDeleted: false }
    })

    const role = project.ownerId === context.user.id ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes('delete') : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    await project.update({
        isDeleted: true,
        deletedAt: new Date()
    })
    return true
}

export const projectType = {
    id: (project: any) => project.id,
    title: (project: any) => project.title,
    owner_id: (project: any) => project.ownerId,
    description: (project: any) => project.description,
    priority: (project: any) => mapPriorityToEnum(project.priority),
    urgent_important_matrix: (project: any) => mapUrgentImportantMatrixToEnum(project.urgentImportantMatrix),
    success_criteria: (project: any) => project.successCriteria,
    is_public: (project: any) => project.isPublic,
    start_date: (project: any) => project.startDate,
    end_date: (project: any) => project.endDate,
    status: (project: any) => mapStatusToEnum(project.status),
    completed_at: (project: any) => project.completedAt,
    created_at: (project: any) => project.createdAt,
    updated_at: (project: any) => project.updatedAt,
    is_deleted: (project: any) => project.isDeleted,
    deleted_at: (project: any) => project.deletedAt,
    // Relationships
    owner: async (project: any) => await User.findByPk(project.ownerId, { raw: true }),
    tasks: async (project: any) => await Task.findAll({ where: { projectId: project.id, isDeleted: false }, raw: true }),
    members: async (project: any) => {
        return await ProjectMember.findAll({
            where: { projectId: project.id, isDeleted: false },
            raw: true
        })
    },
    histories: async (project: any) => await ProjectHistory.findAll({ where: { projectId: project.id, isDeleted: false }, raw: true }),
    ai_interactions: async (project: any) => await AIInteraction.findAll({ where: { projectId: project.id, isDeleted: false }, raw: true })
}