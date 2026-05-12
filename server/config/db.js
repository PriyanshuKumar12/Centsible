const mongoose = require('mongoose')
const dns = require('node:dns')

// Force Node to use public DNS resolvers for SRV lookups.
// Some ISP / college / corporate DNS servers refuse SRV queries,
// which breaks `mongodb+srv://` connection strings (Atlas).
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

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
