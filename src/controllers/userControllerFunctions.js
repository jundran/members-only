import bcrypt from 'bcrypt'
import { body } from 'express-validator'
import User from '../models/user.js'
import { userCreateGet } from './userController.js'

export const validateFields = [
	body('firstname', 'First name must not be empty.').trim().isLength({ min: 1 }),
	body('surname', 'Surname must not be empty.').trim().isLength({ min: 1 }),
	body('email', 'Email is not formatted correctly.').trim().isEmail()
]

export const validatePassword = (req, res, next) => {
	// Password is unchanged for existing user
	if (req.user && !req.body.password && !req.body.passwordConfirm) {
		return next()
	}

	// Setup errors array
	if (!req.errors) req.errors = []

	// Verify password does not contain whitespace
	if (/\s/g.test(req.body.password)) {
		req.errors.push('Password cannot contain empty spaces.')
	}

	// Verify length
	if (req.body.password.length < 8) {
		req.errors.push('Password must be at least 8 characters.')
	}

	// Verify passwords match
	if (req.body.password !== req.body.passwordConfirm) {
		req.errors.push('Passwords do not match.')
	}

	next()
}


export function validateMembershipCode (req, res, next) {
	const code = req.body.membershipCode.trim().toLowerCase()
	if (code) {
		if (code === 'premium') {
			req.membershipStatus = 'Premium'
		} else {
			if (!req.errors) req.errors = []
			req.errors.push('Membership code is not valid. Please try another code or submit the form without one.')
		}
	} else {
		req.membershipStatus = req.user ? req.user.membershipStatus : 'Regular'
	}
	next()
}

export function validateAdminCode (req, res, next) {
	const adminPassword = req.body.adminPassword.trim().toLowerCase()
	if (adminPassword) {
		if (adminPassword === 'admin') {
			req.isAdmin = true
		} else {
			if (!req.errors) req.errors = []
			req.errors.push('Admin password is not correct. Please try another password or submit the form without one.')
		}
	} else {
		req.isAdmin = req.user ? req.user.isAdmin : false
	}
	next()
}

export async function saveDocument (req, res, next) {
	const user = new User({
		firstname: req.body.firstname,
		surname: req.body.surname,
		email: req.body.email,
		membershipStatus: req.membershipStatus,
		isAdmin: req.isAdmin
	})
	if (req.body.password) {
		user.password = await bcrypt.hash(req.body.password, 10)
	}

	if (req.user) {
		user._id = req.user._id
		User.findByIdAndUpdate(req.user._id, user).exec()
			.then(() => res.redirect('/'))
			.catch(err => handleErrorOnSave(err, req, res, next))
	} else {
		user.save()
			.then(() => loginAndRedirect(req, res, next, user))
			.catch(err => handleErrorOnSave(err, req, res, next))
	}
}

function loginAndRedirect (req, res, next, user) {
	req.login(user, err => {
		if (err) return next(err)
		else res.redirect('/')
	})
}

function handleErrorOnSave (err, req, res, next) {
	if (err.code === 11000) {
		req.errors.push('An account with this email already exists')
		userCreateGet(req, res, next)
	} else {
		next(err)
	}
}
