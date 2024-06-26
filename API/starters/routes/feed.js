const express = require('express')

const feedController= require("../contollers/feed")

const router = express.Router()

router.get('/posts', feedController.getPosts)
router.post('/post', feedController.postPosts)

module.exports = router