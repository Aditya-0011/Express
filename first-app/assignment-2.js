const express = require('express')

const app = express()

// app.use((req, res, next) => {
//     console.log('1st middleware')
//     next()
// })
// app.use((req, res, next) => {
//     console.log('2nd middleware')
//     res.send('<h1>Hello</h1>')
//     next()
// })

app.use('/users', (req, res, next) => {
    console.log('users middleware')
    res.send('<h1>Users Middleware</h1>')
})
app.use('/', (req, res, next) => {
    console.log('/ middleware')
    res.send('<h1>/ Middleware</h1>')
})

app.listen(3000)