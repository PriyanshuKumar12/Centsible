function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500
  if (status >= 500) {
    console.error('[centsible]', err)
  }
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
  })
}

module.exports = errorHandler
