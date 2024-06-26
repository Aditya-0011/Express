const express = require('express')
const path = require('path')

const rootDir = require('../utils/path')


const router = express.Router()

const products = []

router.get('/add-product', (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))

    // res.render('add-product', { pageTitle: "Add Product", path: '/admin/add-product' }) for Pug

    // res.render('add-product', {
    //     pageTitle: "Add Product",
    //     path: '/admin/add-product',
    //     productCSS: true,
    //     activeAddProduct: true
    // }) For Handlebars

    res.render('add-product', { pageTitle: "Add Product", path: '/admin/add-product' })
})

router.post('/add-product', (req, res, next) => {
    products.push({ title: req.body.title })
    res.redirect('/')
})

exports.routes = router
exports.products = products