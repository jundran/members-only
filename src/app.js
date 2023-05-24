import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import path from 'path'
import passport from './passport.js'
import indexRouter from './routes/indexRouter.js'
import User from './models/user.js'
import asyncHandler from './asyncHandler.js'
import { sendErrorPage } from './utils.js'

dotenv.config()

// EXPRESS SETUP
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.resolve('src', 'public')))

// VIEWS SETUP
app.set('views', path.resolve('src', 'views'))
app.set('view engine', 'ejs')

// EXPRESS SESSION
app.use(session({
	secret: process.env.EXPRESS_SESSION_SECRET,
	resave: false,
	saveUninitialized: true })
)

// INITIALIZE PASSPORT
app.use(passport.initialize())
app.use(passport.session())

// DEVELOPMENT ONLY - automatically login a user
app.use(asyncHandler(async (req, res, next) => {
	console.log(process.env)
	if (process.env.GET_USER) req.user = await User.findOne().exec()
	next()
}))

// Make user available to views without passing to render
app.use(function (req, res, next) {
	res.locals.user = req.user
	next()
})

// ROUTES
app.use('/', indexRouter)

// CATCH 404
app.use((req, res, next) => {
	sendErrorPage(res, 'Page not found - 404', 404)
})

// ERROR HANDLER
app.use(async (err, req, res, next) => {
	console.log('ERROR HANDLER - Status code:', err.status)

	// Handle badly formatted id - will not be caught as a 404 but treat as such
	if (err.name === 'CastError') {
		return sendErrorPage(res, 'Page not found - cast error', 404)
	}
	else {
		console.error(err)
		sendErrorPage(res, 'Something went wrong with your request', err.status || 500)
	}
})

const port = 5000
export default () => app.listen(port, () => console.log(`App listening on port ${port}`))
