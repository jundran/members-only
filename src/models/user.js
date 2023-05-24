import mongoose from 'mongoose'
const Schema = mongoose.Schema

const UserSchema = new Schema({
	firstname: {
		type: String,
		required: true
	},
	surname: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	membershipStatus: {
		type: String,
		default: 'Regular'
	},
	isAdmin: {
		type: Boolean,
		default: false
	}
},
{
	timestamps: true
})

UserSchema.pre('save', function (next) {
	formatFields(this)
	next()
})

UserSchema.pre('findOneAndUpdate', function (next) {
	formatFields(this._update)
	next()
})

function formatFields (document) {
	document.firstname = document.firstname.charAt(0).toUpperCase() + document.firstname.slice(1)
	document.surname = document.surname.charAt(0).toUpperCase() + document.surname.slice(1)
	if (document.isAdmin) document.membershipStatus = 'Premium'
}

UserSchema.index({ email: 1 }, {
	unique: true
})

UserSchema.virtual('fullname').get(function () {
	return this.firstname + ' ' + this.surname
})

export default mongoose.model('User', UserSchema)
