const express = require('express')

const route = require('./routes/index')

const app = express()

app.use('/a3', route)

app.listen(3000)