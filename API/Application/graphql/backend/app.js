const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const { createHandler } = require('graphql-http/lib/use/express')
const expressPlayground = require('graphql-playground-middleware-express').default
const path = require('path')
const fs = require('fs')

const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolver')
const auth = require('./middleware/auth')

const clearImage = filePath => {
    filePath = path.join(__dirname, filePath)
    fs.unlink(filePath, err => {if(err){console.log(`${err}`)}})
}

const app = express()
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        file.originalname.replaceAll("#", "_")
        file.originalname.replaceAll(" ", "_")
        cb(null, new Date().getTime() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'images/jfif'
    ) {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

app.use(bodyParser.json())
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200)
    }
    next()
})

app.use(auth)

app.put('/post-image', (req, res, next) => {
    if(!req.isAuth){
        throw new Error('Not Authenticated!')
    }
    if(!req.file){
        return res.status(200).json({ message: 'No File Provided!' })
    }
    if(req.body.oldPath){
        clearImage(req.body.oldPath)
    }
    return res.status(201).json({ message: 'File Stored.', filePath: req.file.path })
})

app.all('/graphql', (req, res) =>
    createHandler({
        schema: graphqlSchema,
        rootValue: {
            createUser: args => graphqlResolver.createUser(args, req),
            login: args => graphqlResolver.login(args, req),
            createPost: args => graphqlResolver.createPost(args, req),
            posts: args => graphqlResolver.posts(args, req),
            post: args => graphqlResolver.post(args, req),
            updatePost: args => graphqlResolver.updatePost(args, req),
            deletePost: args => graphqlResolver.deletePost(args, req),
            user: args => graphqlResolver.user(args, req),
            updateStatus: args => graphqlResolver.updateStatus(args, req),
        },
    })(req, res)
)

app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res
        .status(status)
        .json({
            message: message,
            data: data
        })
})

mongoose
    .connect('mongodb+srv://aditya-0011:UaKTgAjKESgT0pMk@cluster0.gdrorud.mongodb.net/social-media')
    .then(result => {
        app.listen(1010)
    })
    .catch(e => console.log(`Db Connection Error${e}`))