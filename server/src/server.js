import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDatabase } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import earningsRoutes from './routes/earningsRoutes.js'
import gigRoutes from './routes/gigRoutes.js'
import portfolioRoutes from './routes/portfolioRoutes.js'

dotenv.config()

const app = express()

app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5175',
                'http://localhost:8080',
                process.env.CLIENT_ORIGIN
            ].filter(Boolean)

            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true)
            } else {
                callback(new Error('CORS not allowed'))
            }
        },
        credentials: true,
    })
)
app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/earnings', earningsRoutes)
app.use('/api/gigs', gigRoutes)
app.use('/api/portfolio', portfolioRoutes)

const port = process.env.PORT || 4000

connectDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`API running on http://localhost:${port}`)
        })
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB', error)
        process.exit(1)
    })
