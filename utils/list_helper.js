const _ = require('lodash')

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	const reducer = blogs.reduce((sum, blog) => {
		return sum + Number(blog.likes)
	}, 0)

	return reducer
}

const favoriteBlog = (blogs) => {
	const likes = blogs.map((blog) => blog.likes)
	return blogs.filter((blog) => blog.likes === Math.max(...likes))[0]
}

const mostBlogs = (blogs) => {
	const authors = blogs.map((blog) => blog.author)
	const authorCount = _.countBy(authors)
	const maxBlogsAuthor = _.maxBy(_.entries(authorCount), ([, value]) => value)
	return {
		name: maxBlogsAuthor[0],
		blogs: maxBlogsAuthor[1],
	}
}

const mostLikes = (blogs) => {
	const mostLikedBlog = _.maxBy(blogs, function (o) {
		return o.likes
	})
	return {
		author: mostLikedBlog.author,
		likes: mostLikedBlog.likes,
	}
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
