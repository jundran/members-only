import asyncHandler from '../asyncHandler.js'
import { addErrorsToRequestObject, sendErrorPage } from '../utils.js'
import {
	validateFields,
	validatePassword,
	validateMembershipCode,
	validateAdminCode,
	saveDocument
} from './userControllerFunctions.js'

export const userCreateGet = asyncHandler(async (req, res, next) => {
	res.render('user_form', {
		title: 'Create an account',
		errorMessage: 'Unable to create an account.',
		errors: req.errors || [],
		passwordPlaceholder: '',
		// Request body expected to be empty on first render
		userDoc: {
			firstname: req.body.firstname,
			surname: req.body.surname,
			email: req.body.email,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
			membershipCode: req.body.membershipCode,
			adminPassword: req.body.adminPassword
		}
	})
})

export const userUpdateGet = asyncHandler(async (req, res, next) => {
	if (!req.user) return sendErrorPage(res, 'User not found', 404)

	const localsUser = Object.keys(req.body).length > 0 ? req.body :
		{
			...req.user._doc,
			password: '',
			passwordConfirm: ''
		}

	res.render('user_form', {
		title: 'Update user profile',
		errorMessage: 'Unable to create an account.',
		errors: req.errors || [],
		passwordPlaceholder: 'Leave blank to keep existing password',
		userDoc: localsUser
	})
})

export const userCreatePost = middlewareWithHandler(userCreateGet)

export const userUpdatePost = middlewareWithHandler(userUpdateGet)

function middlewareWithHandler (handler) {
	return [
		...validateFields,
		validatePassword,
		validateMembershipCode,
		validateAdminCode,
		(req, res, next) => addErrorsToRequestObject(req, next),
		(req, res, next) => {
			if (req.errors.length) handler(req, res, next) // Rerender form with errors
			else saveDocument(req, res, next)
		}
	]
}
