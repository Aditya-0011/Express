const express = require('express')

const router = express.Router()
router.get('/a3', (req, res, next) => {
    res.send("<h1>Assignment-3</h1>")
})

router.get('/a3/users', (req, res, next) => {
    res.send("<h1>Assignment-3</h1>")
})

module.exports = router