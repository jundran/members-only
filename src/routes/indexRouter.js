import express from 'express'
import { index } from '../controllers/indexController.js'
import {
	userCreateGet,
	userCreatePost,
	userUpdateGet,
	userUpdatePost
} from '../controllers/userController.js'
import {
	loginGet,
	loginPost,
	logout,
	handleAlreadySignedInUser
} from '../controllers/authenticationController.js'

import {
	messageBoard,
	messageCreateGet,
	messageCreatePost,
	messageUpdateGet,
	messageUpdatePost,
	messageDeleteGet,
	messageDeletePost
} from '../controllers/messageController.js'

const router = express.Router()

router.get('/', index)

router.get('/login', handleAlreadySignedInUser, loginGet)
router.post('/login', handleAlreadySignedInUser, loginPost)

router.get('/signup', handleAlreadySignedInUser, userCreateGet)
router.post('/signup', handleAlreadySignedInUser, userCreatePost)

router.get('/logout', logout)

router.get('/user/update', userUpdateGet)
router.post('/user/update', userUpdatePost)

router.get('/message/board', messageBoard)

router.get('/message/create', messageCreateGet)
router.post('/message/create', messageCreatePost)

router.get('/message/:id/update', messageUpdateGet)
router.post('/message/:id/update', messageUpdatePost)

router.get('/message/:id/delete', messageDeleteGet)
router.post('/message/:id/delete', messageDeletePost)

export default router
