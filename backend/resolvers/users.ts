import { Project, User, ProjectMember, AIInteraction, ProjectHistory } from '../models'

export const user = async (id: string) => {
    const user = await User.findOne({ where: { id, isDeleted: false } })
    if (!user) throw new Error('User not found')
    return user
}

export const users = async () => {
    return await User.findAll({ where: { isDeleted: false } })
}

export const me = async (context: any) => {
    return context.user
}

export const deleteMe = async (context: any) => {
    const user = await User.findOne({ where: { id: context.user.id || context.user.dataValues.id } })
    if (!user) throw new Error('User not found')

    user.isDeleted = true
    await user.save()
    return true
}

export const userType = {
    id: (user: User) => user.id || user.dataValues.id,
    email: (user: User) => user.email || user.dataValues.email,
    name: (user: User) => user.name || user.dataValues.name,
    avatar: (user: User) => user.avatar || user.dataValues.avatar,
    provider: (user: User) => user.provider || user.dataValues.provider,
    created_at: (user: User) => user.createdAt || user.dataValues.createdAt,
    updated_at: (user: User) => user.updatedAt || user.dataValues.updatedAt,
    is_deleted: (user: User) => user.isDeleted || user.dataValues.isDeleted,
    deleted_at: (user: User) => user.deletedAt || user.dataValues.deletedAt,
    // Relationships
    owned_projects: async (user: User) => await Project.findAll({ where: { ownerId: user.id, isDeleted: false } }),
    member_projects: async (user: User) => await ProjectMember.findAll({ where: { userId: user.id, isDeleted: false } }),
    ai_interactions: async (user: User) => await AIInteraction.findAll({ where: { userId: user.id, isDeleted: false } }),
    project_histories: async (user: User) => await ProjectHistory.findAll({ where: { changedBy: user.id, isDeleted: false } }),
    
}