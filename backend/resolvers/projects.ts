import { Project, User, ProjectMember, Task, ProjectHistory, AIInteraction } from '../models'
import { Op } from 'sequelize'
import PERMISSIONS from '../utils/projectPermissions'
import addProjectHistory from '../utils/addProjectHistory'
import sendEmail from '../utils/emailService'

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

const backMapEnumToStatus = (status: string) => {
    if (status === 'TODO') return 'todo'
    if (status === 'IN_PROGRESS') return 'in progress'
    if (status === 'DONE') return 'done'
    return status
}

const notifyProjectAction = async (project: any, context: any, subject: string, text: string) => {
    const recipients = new Set<string>()
    if (context.user?.email) recipients.add(context.user.email)

    if (project.ownerId !== context.user?.id) {
        const owner = await User.findByPk(project.ownerId, { raw: true })
        if (owner?.email) recipients.add(owner.email)
    }

    for (const email of recipients) {
        try {
            await sendEmail(email, subject, text)
        } catch (error) {
            console.error(`Failed to send email to ${email}:`, error)
        }
    }
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

export const projects = async (context: any, status?: string, is_public?: boolean, owner_id?: string, title?: string) => {
    const userId = context.user.id
    const where: any = { isDeleted: false }
    if (status) where.status = status
    if (is_public !== undefined) where.isPublic = is_public
    if (owner_id) where.ownerId = owner_id
    if (title) {
        where.title = {
            [Op.iLike]: `%${title}%`
        }
    }

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

export const public_projects = async (context: any) => {
    return await Project.findAll({ where: { isDeleted: false, isPublic: true }, raw: true })
}

export const createProject = async (input: any, context: any) => {
    const project = await Project.create({
        ...input,
        ownerId: context.user.id,
    })
    const row = project.toJSON()
    await addProjectHistory(
        row.id,
        'project',
        row.id,
        'create',
        `Project "${row.title}" created`,
        context.user.id,
    )

    // Notify user on project creation
    if (context.user && context.user.email) {
        try {
            await sendEmail(
                context.user.email,
                'Project Created',
                `Your project "${row.title}" has been successfully created. Happy productivity!`
            )
        } catch (error) {
            console.error('Failed to send project creation email:', error)
        }
    }

    return row
}

export const updateProject = async (id: string, input: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const project = await Project.findOne({ where: { id, isDeleted: false } })
    if (!project) throw new Error('Project not found')

    const member = await ProjectMember.findOne({
        where: { projectId: id, userId: context.user.id, isDeleted: false }
    })

    const role = project.toJSON().ownerId === context.user.id ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes('update') : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    const prevStatus = project.status
    await project.update(input)
    const updated = project.toJSON()
    const statusChanged = prevStatus !== updated.status
    const otherKeys = Object.keys(input ?? {}).filter((k) => k !== 'status')

    if (!statusChanged && otherKeys.length === 0) return updated

    if (statusChanged && !otherKeys.length) {
        await addProjectHistory(
            id,
            'project',
            id,
            'status change',
            `Status changed from ${prevStatus} to ${updated.status}`,
            context.user.id,
        )
    } else {
        const parts: string[] = []
        if (statusChanged) parts.push(`status ${prevStatus} → ${updated.status}`)
        if (otherKeys.length) parts.push(`fields: ${otherKeys.join(', ')}`)
        await addProjectHistory(
            id,
            'project',
            id,
            'update',
            parts.length ? parts.join('; ') : 'Project updated',
            context.user.id,
        )
    }

    // Notify user on project completion
    if (updated.status === 'done' && prevStatus !== 'done') {
        await notifyProjectAction(
            project,
            context,
            'Project Completed!',
            `Congratulations! The project "${updated.title}" has been completed.`
        )
    }

    return updated
}

export const updateProjectStatus = async (id: string, status: unknown, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const project = await Project.findOne({ where: { id, isDeleted: false } })
    if (!project) throw new Error('Project not found')

    const member = await ProjectMember.findOne({
        where: { projectId: id, userId: context.user.id, isDeleted: false }
    })

    const role = project.toJSON().ownerId === context.user.id ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes('update') : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    const prevStatus = project.status
    const nextStatus = mapStatusToEnum(status)
    const completedAt = nextStatus === 'DONE' ? new Date() : null

    await project.update({ status: backMapEnumToStatus(nextStatus), completedAt })    
    const updated = project.toJSON()
    if (prevStatus !== updated.status) {
        await addProjectHistory(
            id,
            'project',
            id,
            'status change',
            `Status changed from ${prevStatus} to ${updated.status}`,
            context.user.id,
        )
    }

    // Notify user on project completion
    if (updated.status === 'done' && prevStatus !== 'done') {
        await notifyProjectAction(
            project,
            context,
            'Project Completed!',
            `Congratulations! The project "${updated.title}" has been completed.`
        )
    }

    return updated
}

export const deleteProject = async (id: string, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const project = await Project.findOne({ where: { id, isDeleted: false } })
    if (!project) throw new Error('Project not found')

    const member = await ProjectMember.findOne({
        where: { projectId: id, userId: context.user.id, isDeleted: false }
    })

    const role = project.toJSON().ownerId === context.user.id ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes('delete') : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    await project.update({
        isDeleted: true,
        deletedAt: new Date()
    })
    await addProjectHistory(
        id,
        'project',
        id,
        'delete',
        `Project "${project.title}" deleted`,
        context.user.id,
    )

    // Notify user on project deletion
    await notifyProjectAction(
        project,
        context,
        'Project Deleted',
        `The project "${project.title}" has been deleted.`
    )

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