const { test, describe, beforeEach, after } = require('node:test')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const helper = require('./test-helper')

const api = supertest(app)

beforeEach(async () => {
	console.log('delete blogs')
	await Blog.deleteMany({})
	console.log('insert blogs')
	await Blog.insertMany(helper.blogs)
	console.log('done')
})

describe('get requests', () => {
	test('all blogs are returned in json', async () => {
		const response = await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)

		assert.strictEqual(response.body.length, helper.blogs.length)
	})

	test('unique identifier must be id not _id', async () => {
		const blogs = await helper.blogsInDb()
		const firstBlogId = blogs[0].id
		const response = await api.get(`/api/blogs/${firstBlogId}`).expect(200)

		assert.deepStrictEqual(response.body, blogs[0])
	})
})

describe('post requests', () => {
	test('add a new blog post', async () => {
		const newBlog = {
			title: 'Type wars',
			author: 'Robert C. Martin',
			url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
			likes: 2,
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()

		assert.strictEqual(blogsAtEnd.length, helper.blogs.length + 1)

		const titles = blogsAtEnd.map((blog) => blog.title)
		assert(titles.includes('Type wars'))
	})

	test('likes should default to zero', async () => {
		const newBlog = {
			title: 'Type wars',
			author: 'Robert C. Martin',
			url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()

		const titles = blogsAtEnd.map((blog) => blog.title)
		assert(titles.includes('Type wars'))
	})

	test('title and url are mandatory', async () => {
		const newBlog = {
			author: 'David Goggins',
		}

		await api.post('/api/blogs').send(newBlog).expect(400)

		const blogsAtEnd = await helper.blogsInDb()

		assert.strictEqual(blogsAtEnd.length, helper.blogs.length)
	})
})

describe('delete requests', () => {
	test('delete a blog', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToDelete = blogsAtStart[0].id

		await api.delete(`/api/blogs/${blogToDelete}`).expect(204)

		const blogsAtEnd = await helper.blogsInDb()

		const titles = blogsAtEnd.map((blog) => blog.title)
		assert(!titles.includes(blogToDelete.title))

		assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
	})
})

describe('update/put requests', () => {
	test.only('update contents of a blog', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const filteredBlog = blogsAtStart.filter(
			(blog) => blog.title === 'Go To Statement Considered Harmful'
		)[0]

		const blogToUpdate = {
			title: 'Go To Statement Considered Harmful',
			author: 'Edsger',
			url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
			likes: 25,
		}

		await api
			.put(`/api/blogs/${filteredBlog.id}`)
			.send(blogToUpdate)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()
		assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
	})
})

after(async () => {
	await mongoose.connection.close()
})
