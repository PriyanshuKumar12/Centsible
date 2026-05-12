const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.warn('[centsible] MONGO_URI not set — skipping DB connection (dev mode).')
    return
  }
  try {
    await mongoose.connect(uri)
    console.log('[centsible] MongoDB connected')
  } catch (err) {
    console.error('[centsible] MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
