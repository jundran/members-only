import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import User from './models/user.js'

passport.use(
	new LocalStrategy(
		// Unless changed here, PassportJS expects form input name="username"
		{ usernameField: 'email' },
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email })
				if (!user) return done(null, false, { message: 'Incorrect email' })

				bcrypt.compare(password, user.password, (err, res) => {
					if (res) return done(null, user)
					else return done(null, false, { message: 'Incorrect password' })
				})
			} catch (err) {
				return done(err)
			}
		})
)

passport.serializeUser(function (user, done) {
	done(null, user.id)
})

passport.deserializeUser(async function (id, done) {
	try {
		const user = await User.findById(id).exec()
		done(null, user)
	} catch (err) {
		done(err)
	}
})

export default passport
