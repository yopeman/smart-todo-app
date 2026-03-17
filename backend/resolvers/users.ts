import { Project, User, ProjectMember, AIInteraction, ProjectHistory } from '../models'

export const user = async (id: string) => {
    const user = await User.findOne({ where: { id, isDeleted: false }, raw: true })
    if (!user) throw new Error('User not found')
    return user
}

export const users = async () => {
    return await User.findAll({ where: { isDeleted: false }, raw: true })
}

export const me = async (context: any) => {
    return context.user
}

export const deleteMe = async (context: any) => {
    const user = await User.findByPk(context.user.id)

    if (!user) throw new Error('User not found')

    await user.update({
        isDeleted: true,
        deletedAt: new Date(),
    })

    return true
}

export const userType = {
    id: (user: any) => user.id,
    email: (user: any) => user.email,
    name: (user: any) => user.name,
    avatar: (user: any) => user.avatar,
    provider: (user: any) => user.provider,
    created_at: (user: any) => user.createdAt,
    updated_at: (user: any) => user.updatedAt,
    is_deleted: (user: any) => user.isDeleted,
    deleted_at: (user: any) => user.deletedAt,
    // Relationships
    owned_projects: async (user: any) => await Project.findAll({ where: { ownerId: user.id, isDeleted: false }, raw: true }),
    member_projects: async (user: any) => await ProjectMember.findAll({ where: { userId: user.id, isDeleted: false }, raw: true }),
    ai_interactions: async (user: any) => await AIInteraction.findAll({ where: { userId: user.id, isDeleted: false }, raw: true }),
    project_histories: async (user: any) => await ProjectHistory.findAll({ where: { changedBy: user.id, isDeleted: false }, raw: true }),
    
}