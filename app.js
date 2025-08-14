const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config.js')
const logger = require('./utils/logger.js')
const blogsRouter = require('./controllers/blogs.js')
const middleware = require('./utils/middleware.js')

const app = express()

logger.info('connecting to', config.MONGO_URI)

mongoose
	.connect(config.MONGO_URI)
	.then(() => {
		console.log('connected to mongodb')
	})
	.catch((error) =>
		console.log('error connection to MongoDB:', error.message)
	)

app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
