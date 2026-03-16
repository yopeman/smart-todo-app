import jwt, { JwtPayload } from 'jsonwebtoken'
import User from '../models/User'
import type { Request, Response, NextFunction } from 'express'

interface TokenPayload extends JwtPayload {
    id: string;
}

export const createUserToken = (user: User) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export const getUserFromToken = async (token: string) => {
    const decode = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    const user = await User.findOne({ where: { id: decode.id, isDeleted: false } })

    if (!user) {
        throw new Error('User not found')
    }

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