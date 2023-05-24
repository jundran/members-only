import { body } from 'express-validator'
import asyncHandler from '../asyncHandler.js'
import { addErrorsToRequestObject, sendErrorPage } from '../utils.js'
import Message from '../models/message.js'

export const messageBoard = asyncHandler(async (req, res, next) => {
	const fetchedMessages = await Message.find().populate('user').exec()

	// Add message permissions
	const messages = fetchedMessages.map(message => {
		if (!req.user) return message

		const userOwnsPost = req.user.id === message.user.id

		if (req.user.membershipStatus === 'Premium' || userOwnsPost) {
			message.showInfo = true
		}

		if (req.user.isAdmin || userOwnsPost) {
			message.hasAdmin = true
		}

		return message
	})

	res.render('message_board', {
		title: 'Message Board',
		messages
	})
})

export const messageCreateGet = asyncHandler(async (req, res, next) => {
	if (!req.user) {
		return sendErrorPage(res, 'You must be signed in to post a message', 401, 'Not signed in')
	}

	res.render('message_form', {
		title: 'Compose a new message',
		errorMessage: 'Unable to post the message.',
		errors: req.errors || [],
		message: {
			title: req.body.title,
			text: req.body.text
		}
	})
})

export const messageUpdateGet = asyncHandler(async (req, res, next) => {
	// Get message and check authorization to update
	const message = await Message.findOne({ _id: req.params.id }).populate('user').exec()
	if (!message) return sendErrorPage(res, 'Message not found', 404)
	if (isNotAuthorized(req, res, message)) return

	const localsMessage = Object.keys(req.body).length > 0 ? req.body : message
	res.render('message_form', {
		title: 'Edit message',
		errorMessage: 'Unable to post the message.',
		errors: req.errors || [],
		message: localsMessage
	})
})

export const messageCreatePost = middlewareWithHandler(messageCreateGet)

export const messageUpdatePost = middlewareWithHandler(messageUpdateGet)

function middlewareWithHandler (handler) {
	return [
		body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
		body('text', 'Message must not be empty.').trim().isLength({ min: 1 }),
		(req, res, next) => addErrorsToRequestObject(req, next),

		asyncHandler(async (req, res, next) => {
			// Return form if it has errors
			if (req.errors.length) return handler(req, res, next)

			// UPDATE EXISTING MESSAGE
			if (req.params.id) {
				// Check authorization to update message
				const existingMessage = await Message.findOne({ _id: req.params.id }).populate('user').exec()
				if (isNotAuthorized(req, res, existingMessage)) return

				// Save update to database
				await existingMessage.updateOne({
					title: req.body.title,
					text: req.body.text
				}).exec()
			}
			// CREATE NEW MESSAGE
			else {
				if (!req.user) {
					return sendErrorPage(res, 'You must be signed in to post a message', 401, 'Not signed in')
				}
				// Construct message from form body and save
				await new Message({
					title: req.body.title,
					text: req.body.text,
					user: req.user._id
				}).save()
			}

			// Finally redirect back to message board
			res.redirect('/message/board')
		})
	]
}

export const messageDeleteGet = asyncHandler(async (req, res, next) => {
	const message = await Message.findOne({ _id: req.params.id }).populate('user').exec()
	if (!message) return sendErrorPage(res, 'Message not found', 404)
	if (isNotAuthorized(req, res, message)) return

	res.render('delete_confirm', { title: 'Delete message', message })
})

export const messageDeletePost = asyncHandler(async (req, res, next) => {
	const message = await Message.findOne({ _id: req.params.id }).populate('user').exec()
	if (isNotAuthorized(req, res, message)) return
	await message.deleteOne()

	res.redirect('/message/board')
})

function isNotAuthorized (req, res, message) {
	if (!req.user || (!req.user.isAdmin && message.user.id !== req.user.id)) {
		sendErrorPage(res, 'This message does not belong to you', 401)
		return true
	}
}
