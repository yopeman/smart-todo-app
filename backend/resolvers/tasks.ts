import { Task, Subtask, Project, ProjectMember, ProjectHistory } from '../models'
import { Op } from 'sequelize'
import PERMISSIONS from '../utils/projectPermissions'
import addProjectHistory from '../utils/addProjectHistory'

type ProjectAction = 'create' | 'read' | 'update' | 'delete' | 'manage_members'

const mapStatusToEnum = (status: unknown) => {
    if (!status) throw new Error('Invalid task status: empty')
    const normalized = String(status).trim().toLowerCase()
    if (normalized === 'todo') return 'TODO'
    if (normalized === 'in progress' || normalized === 'in_progress') return 'IN_PROGRESS'
    if (normalized === 'done') return 'DONE'

    const asEnum = String(status).trim().toUpperCase()
    if (asEnum === 'TODO' || asEnum === 'IN_PROGRESS' || asEnum === 'DONE') return asEnum
    throw new Error(`Invalid task status: ${String(status)}`)
}

const backMapEnumToStatus = (status: string) => {
    if (status === 'TODO') return 'todo'
    if (status === 'IN_PROGRESS') return 'in progress'
    if (status === 'DONE') return 'done'
    return status
}

const resolveProjectId = (input: any): string | undefined =>
    input?.projectId ?? input?.project_id ?? input?.projectID ?? input?.projectID

const normalizeTaskInput = (input: any) => {
    const normalized: any = {
        title: input?.title,
        description: input?.description,
        status: input?.status,
        orderWeight: input?.orderWeight ?? input?.order_weight,
        dueDate: input?.dueDate ?? input?.due_date,
    }

    for (const key of Object.keys(normalized)) {
        if (normalized[key] === undefined) delete normalized[key]
    }

    return normalized
}

const assertProjectPermission = async (params: {
    projectId: string
    context: any
    action: ProjectAction
}) => {
    const { projectId, context, action } = params

    const project = await Project.findOne({ where: { id: projectId, isDeleted: false }, raw: true })
    if (!project) throw new Error('Project not found or unauthorized')

    // Anonymous users can only read public projects.
    if (!context?.user) {
        if (action === 'read' && project.isPublic) return { project, role: 'viewer' as const }
        throw new Error('Unauthorized')
    }

    const userId = context.user.id
    const member = await ProjectMember.findOne({
        where: { projectId, userId, isDeleted: false },
        raw: true
    })

    const role = project.ownerId === userId ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes(action) : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    return { project, role }
}

export const task = async (id: string, context: any) => {
    const found = await Task.findOne({ where: { id, isDeleted: false }, raw: true })
    if (!found) throw new Error('Task not found')

    await assertProjectPermission({ projectId: found.projectId, context, action: 'read' })
    return found
}

export const tasks = async (project_id: string | undefined, status: string | undefined, context: any) => {
    const where: any = { isDeleted: false }
    if (status) where.status = status

    if (project_id) {
        await assertProjectPermission({ projectId: project_id, context, action: 'read' })
        where.projectId = project_id
    } else {
        // Only return tasks from projects the caller can read.
        const userId = context?.user?.id
        const visibilityConditions: any[] = [{ isPublic: true }]
        if (userId) {
            visibilityConditions.push({ ownerId: userId })
            visibilityConditions.push({
                id: {
                    [Op.in]: Project.sequelize?.literal(
                        `(SELECT project_id FROM project_members WHERE user_id = '${userId}' AND is_deleted = false)`
                    )
                }
            })
        }

        const visibleProjects = await Project.findAll({
            attributes: ['id'],
            where: {
                isDeleted: false,
                [Op.or]: visibilityConditions
            },
            raw: true
        })

        where.projectId = { [Op.in]: visibleProjects.map((p: any) => p.id) }
    }

    return await Task.findAll({ 
        where, 
        order: [['orderWeight', 'ASC'], ['createdAt', 'ASC']],
        raw: true 
    })
}

export const createTask = async (input: any, context: any) => {
    const projectId = resolveProjectId(input)
    if (!projectId) throw new Error('Project not found')

    await assertProjectPermission({ projectId, context, action: 'create' })

    const task = await Task.create({
        projectId,
        ...normalizeTaskInput(input),
    })
    const row = task.toJSON()
    await addProjectHistory(
        projectId,
        'task',
        row.id,
        'create',
        `Task "${row.title}" created`,
        context.user.id,
    )
    return row
}

export const updateTask = async (id: string, input: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized')
    
    const task = await Task.findOne({ where: { id, isDeleted: false } })
    if (!task) throw new Error('Task not found')

    await assertProjectPermission({ projectId: task.toJSON().projectId, context, action: 'update' })

    const prev = task.toJSON()
    const normalized = normalizeTaskInput(input)
    await task.update(normalized)
    const updated = task.toJSON()

    const statusChanged = prev.status !== updated.status
    const otherKeys = Object.keys(normalized).filter((k) => k !== 'status')

    if (!statusChanged && otherKeys.length === 0) return updated

    if (statusChanged && !otherKeys.length) {
        await addProjectHistory(
            task.toJSON().projectId,
            'task',
            id,
            'status change',
            `Status changed from ${prev.status} to ${updated.status}`,
            context.user.id,
        )
    } else {
        const parts: string[] = []
        if (statusChanged) parts.push(`status ${prev.status} → ${updated.status}`)
        if (otherKeys.length) parts.push(`fields: ${otherKeys.join(', ')}`)
        await addProjectHistory(
            task.toJSON().projectId,
            'task',
            id,
            'update',
            parts.length ? parts.join('; ') : 'Task updated',
            context.user.id,
        )
    }

    return updated
}

export const updateTaskStatus = async (id: string, status: unknown, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const task = await Task.findOne({ where: { id, isDeleted: false } })
    if (!task) throw new Error('Task not found')

    await assertProjectPermission({ projectId: task.toJSON().projectId, context, action: 'update' })

    const prevStatus = task.status
    const nextStatus = mapStatusToEnum(status)
    const completedAt = nextStatus === 'DONE' ? new Date() : null

    await task.update({ status: backMapEnumToStatus(nextStatus), completedAt })
    const updated = task.toJSON()
    if (prevStatus !== updated.status) {
        await addProjectHistory(
            task.toJSON().projectId,
            'task',
            id,
            'status change',
            `Status changed from ${prevStatus} to ${updated.status}`,
            context.user.id,
        )
    }
    return updated
}

export const deleteTask = async (id: string, context: any) => {
    if (!context.user) throw new Error('Unauthorized')
    
    const task = await Task.findOne({ where: { id, isDeleted: false } })
    if (!task) throw new Error('Task not found')

    await assertProjectPermission({ projectId: task.toJSON().projectId, context, action: 'delete' })

    await task.update({ 
        isDeleted: true,
        deletedAt: new Date()
    })
    await addProjectHistory(
        task.toJSON().projectId,
        'task',
        id,
        'delete',
        `Task "${task.title}" deleted`,
        context.user.id,
    )
    return true
}

export const reorderTasks = async (task_order: string[], context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    if (!task_order?.length) return []

    const tasks = await Task.findAll({
        where: { id: { [Op.in]: task_order }, isDeleted: false },
        raw: true
    })
    if (tasks.length !== task_order.length) throw new Error('One or more tasks not found')

    const projectId = tasks[0].projectId
    if (tasks.some((t: any) => t.projectId !== projectId)) {
        throw new Error('All tasks must belong to the same project')
    }

    await assertProjectPermission({ projectId, context, action: 'update' })

    // Update each task's orderWeight based on index.
    for (let i = 0; i < task_order.length; i++) {
        await Task.update({ orderWeight: i }, { where: { id: task_order[i], isDeleted: false } })
    }

    const updated = await Task.findAll({
        where: { id: { [Op.in]: task_order }, isDeleted: false },
        order: [['orderWeight', 'ASC'], ['createdAt', 'ASC']],
        raw: true
    })

    await addProjectHistory(
        projectId,
        'project',
        projectId,
        'update',
        'Task order updated',
        context.user.id,
    )

    return updated
}

export const taskType = {
    id: (task: any) => task.id,
    project_id: (task: any) => task.projectId,
    title: (task: any) => task.title,
    description: (task: any) => task.description,
    status: (task: any) => mapStatusToEnum(task.status),
    order_weight: (task: any) => task.orderWeight,
    due_date: (task: any) => task.dueDate,
    completed_at: (task: any) => task.completedAt,
    created_at: (task: any) => task.createdAt,
    updated_at: (task: any) => task.updatedAt,
    is_deleted: (task: any) => task.isDeleted,
    deleted_at: (task: any) => task.deletedAt,

    project: async (task: any) => await Project.findByPk(task.projectId, { raw: true }),
    subtasks: async (task: any) =>
        await Subtask.findAll({
            where: { taskId: task.id, isDeleted: false },
            order: [['orderWeight', 'ASC'], ['createdAt', 'ASC']],
            raw: true,
        }),
    histories: async (task: any) => await ProjectHistory.findAll({ 
        where: { 
            entityId: task.id, 
            entityType: 'task',
            isDeleted: false 
        }, 
        raw: true 
    })
}