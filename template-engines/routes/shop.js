const express = require('express')
const path = require('path')

const adminData = require('./admin')
const rootDir = require('../utils/path')

const router = express.Router()

router.get('/', (req, res, next) => {
    const products = adminData.products
    // res.sendFile(path.join(rootDir, 'views', 'shop.html'))

    // res.render('shop', { products: products, pageTitle: 'Shop', path: '/' }) for Pug

    // res.render('shop', {
    //     products: products,
    //     pageTitle: 'Shop',
    //     path: '/',
    //     hasProducts: products.length > 0,
    //     activeShop: true,
    //     productCSS: false
    // }) For Handlebars

    res.render('shop', { products: products, pageTitle: 'Shop', path: '/' })
})

module.exports = router