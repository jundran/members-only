import asyncHandler from '../asyncHandler.js'

export const index = asyncHandler(async (req, res, next) => {
	res.render('index', {
		title: 'Members Only'
	})
})
