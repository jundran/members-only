import asyncHandler from '../asyncHandler.js'
import passport from '../passport.js'
import { sendErrorPage } from '../utils.js'

// TODO - keep email when password is wrong
export const loginGet = asyncHandler(async (req, res, next) => {
	const messages = req.session.messages // from Passport JS
	res.render('login', {
		title: 'Log in',
		errorMessage: 'Unable to login.',
		errors: messages ? [messages[messages.length - 1]] : [],
		email: req.body.email,
		password: req.body.password
	})
})

export const loginPost = passport.authenticate(
	'local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureMessage: true // req.session.messages
	}
)

export const logout = (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err)
		res.redirect('/')
	})
}

export function handleAlreadySignedInUser (req, res, next) {
	if (req.user) return sendErrorPage(res, 'You are already signed in', 200)
	next()
}
