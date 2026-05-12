require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'centsible-api', time: new Date().toISOString() })
})

app.use('/api/auth', require('./routes/authRoutes'))
// Route mounts — populated on Day 5+.
// app.use('/api/transactions', require('./routes/transactionRoutes'))
// app.use('/api/budgets', require('./routes/budgetRoutes'))
// app.use('/api/analytics', require('./routes/analyticsRoutes'))
// app.use('/api/user', require('./routes/userRoutes'))

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

app.use(errorHandler)

;(async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`[centsible] API listening on http://localhost:${PORT}`)
  })
})()
