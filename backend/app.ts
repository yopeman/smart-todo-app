import express from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import cors from 'cors'
import dotenv from 'dotenv'
import User from './models/User'
import { createUserToken, getUserFromToken } from './utils/auth'
import syncDB from './utils/sync-db'
import sendEmail from './utils/emailService'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/use/ws'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { createServer } from 'http'
import resolvers from './resolvers/index'
import getSystemAnalytics from './utils/systemAnalytics'
import { writeFile } from 'fs/promises'

dotenv.config()
const app = express()
const httpServer = createServer(app)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
syncDB()

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOne({ where: { providerId: profile.id }, raw: true })
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

            // Notify user on account creation
            if (newUser.email) {
                try {
                    await sendEmail(
                        newUser.email,
                        'Welcome to Smart Todo App!',
                        `Hi ${newUser.name},\n\nYour account has been successfully created. Welcome aboard!`
                    )
                } catch (error) {
                    console.error('Failed to send welcome email:', error)
                }
            }

            return done(null, newUser)
        }
    )
)

app.use(passport.initialize())
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth/google/failure',
    failureMessage: true,
    // successRedirect: '/auth/google/success',
    // successMessage: true,
    session: false
}), (req, res) => {

    if (!req.user) {
        return res.status(401).json({ error: 'Authentication failed' })
    }

    const token = createUserToken(req.user as User)

    return res.redirect(`http://localhost:5173?token=${token}`)
    // return res.status(200).json({ token: createUserToken(req.user as User) })
})

app.get('/auth/google/success', (req, res) => {
    return res.status(200).json({ message: 'Authentication successful', user: req.user, data: req.query })
})
app.get('/auth/google/failure', (req, res) => {
    return res.status(401).json({ error: 'Authentication failed', data: req.query })
})

// Setup Apollo Server
const schemaPath = join(process.cwd(), 'schemas')
const typeDefs = readdirSync(schemaPath)
    .filter((file) => file.endsWith('.gql'))
    .map((file) => readFileSync(join(schemaPath, file), 'utf-8'))
    .join('\n')
await writeFile('./schemas/schema.graphql', typeDefs)

// Create WebSocket server
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
})

// Set up WebSocket server for GraphQL subscriptions
const serverCleanup = useServer({ schema: makeExecutableSchema({ typeDefs, resolvers }) }, wsServer)

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose()
                    },
                }
            },
        },
    ],
})

await server.start()

app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req, res }) => {
            try {
                const auth = req.headers.authorization
                console.log({auth});
                
                const token = auth?.split(' ')[1]
                const user = await getUserFromToken(token!)
                return { user, req, res }
            } catch (error) {
                return res.status(401).json({ error: 'Unauthorized' })
            }
        },
    }) as any
)

app.get('/api/analytics', async (req, res) => {
    try {
        const analytics = await getSystemAnalytics()
        res.json(analytics)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve analytics' })
    }
})

const PORT = process.env.PORT || 7000
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Analytics endpoint: http://localhost:${PORT}/api/analytics`)
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
    console.log(`GraphQL subscriptions endpoint: ws://localhost:${PORT}/graphql`)
})