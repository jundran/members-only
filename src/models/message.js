import mongoose from 'mongoose'
const Schema = mongoose.Schema

const MessageSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	text: {
		type: String,
		required: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: true
	}
},
{
	timestamps: true
})

MessageSchema.pre('save', function (next) {
	formatFields(this)
	next()
})

MessageSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
	formatFields(this._update)
	next()
})

function formatFields (document) {
	document.title = document.title.charAt(0).toUpperCase() + document.title.slice(1)
}

export default mongoose.model('Message', MessageSchema)
