import { validationResult } from 'express-validator'

export async function sendErrorPage (res, message, statusCode, title) {
	res.statusCode = statusCode
	res.render('error', { message, title })
}

export function addErrorsToRequestObject (req, next) {
	const errors = validationResult(req).array().map(err => err.msg)
	if (!req.errors) req.errors = []
	req.errors = [...errors, ...req.errors]
	next()
}
