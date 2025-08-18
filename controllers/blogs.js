const blogsRouter = require('express').Router()
const { update } = require('lodash')
const Blog = require('../models/blog.js')

blogsRouter.get('/', (request, response) => {
	Blog.find({}).then((blogs) => {
		response.json(blogs)
	})
})

blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id)
	if (blog) {
		response.json(blog)
	} else {
		response.status(404).end()
	}
})

blogsRouter.post('/', async (request, response) => {
	const blog = new Blog(request.body)
	if (!blog.title || !blog.url) {
		response.status(400).end()
	} else {
		const newBlog = new Blog({
			title: blog.title,
			author: blog.author,
			url: blog.url,
			likes: blog.likes || 0,
		})

		const savedBlog = await newBlog.save()
		response.status(201).json(savedBlog)
	}
})

blogsRouter.delete('/:id', async (request, response) => {
	await Blog.findByIdAndDelete(request.params.id)
	response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
	const body = request.body

	if (!body.title || !body.url) {
		return response.status(400).end()
	}

	const updatedBlog = await Blog.findByIdAndUpdate(
		request.params.id,
		{
			title: body.title,
			author: body.author,
			url: body.url,
			likes: body.likes || 0,
		},
		{ new: true, runValidators: true, context: 'query' }
	)

	if (updatedBlog) {
		response.json(updatedBlog)
	} else {
		response.status(404).end()
	}
})

module.exports = blogsRouter
