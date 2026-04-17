import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDatabase } from './config/db.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        credentials: true,
    })
)
app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)

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
