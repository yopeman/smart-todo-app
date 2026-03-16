import express from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import cors from 'cors'
import dotenv from 'dotenv'
import User from './models/User'
import { createUserToken } from './utils/auth'

dotenv.config()
const app = express()
app.use(cors())

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOne({ where: { providerId: profile.id } })
            if (user) {
                return done(null, user)
            }

            const newUser = await User.create({
                name: profile.displayName,
                email: profile.emails?.[0].value,
                avatar: profile.photos?.[0].value,
                provider: 'google',
                providerId: profile.id,
            })
            return done(null, newUser)
        }
    )
)

app.use(passport.initialize())
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication failed' })
    }
    return res.status(201).json({
        token: createUserToken(req.user as User)
    })
})

const PORT = process.env.PORT || 7000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. \nSee http://localhost:${PORT}`)
})