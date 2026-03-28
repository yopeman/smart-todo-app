import jwt, { JwtPayload } from 'jsonwebtoken'
import User from '../models/User'
import type { Request, Response, NextFunction } from 'express'

export const createUserToken = (user: User) => {
    delete (user as any).providerId
    return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '180d' })
}

export const getUserFromToken = async (token: string) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const id = decoded.id

    if (!id) throw new Error('Invalid token')

    const user = await User.findOne({ where: { id, isDeleted: false }, raw: true })

    if (!user) throw new Error('User not found')
    return user
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const user = await getUserFromToken(token)
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
}