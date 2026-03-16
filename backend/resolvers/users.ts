import { Project, User, ProjectMember, AIInteraction, ProjectHistory } from '../models'

const user = async (id: string) => {
    return await User.findOne({ where: { id, isDeleted: false } })
}

const users = async () => {
    return await User.findAll({ where: { isDeleted: false } })
}

const me = async (context: any) => {
    return context.user
}

const deleteUser = async (id: string) => {
    const user = await User.findByPk(id)
    if (!user) {
        throw new Error('User not found')
    }
    user.isDeleted = true
    await user.save()
    return true
}

const owned_projects = async (user: any) => {
    return await Project.findAll({ where: { ownerId: user.id, isDeleted: false } })
}

const member_projects = async (user: any) => {
    return await ProjectMember.findAll({ where: { userId: user.id, isDeleted: false } })
}

const ai_interactions = async (user: any) => {
    return await AIInteraction.findAll({ where: { userId: user.id, isDeleted: false } })
}

const project_histories = async (user: any) => {
    return await ProjectHistory.findAll({ where: { changedBy: user.id, isDeleted: false } })
}