const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')

const Product = require('../models/product')
const Order = require('../models/order')

const ITEMS_PER_PAGE = 1

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1
    let totalProducts

    Product
        .find()
        .countDocuments()
        .then(numProducts => {
            totalProducts = numProducts
            return Product
                .find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then((products) => {
            res.render('shop/product-list', {
                products: products,
                pageTitle: 'All Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
    // Product
    //     .find()
    //     .then((products) => {
    //         res.render('shop/product-list', {
    //             products: products,
    //             pageTitle: 'All Products',
    //             path: '/products',
    //         })
    //     })
    //     .catch(err => {
    //         const error = new Error(err)
    //         error.httpStatusCode = 500
    //         return next(error)
    //     })
}
exports.getProduct = (req, res, next) => {
    const {productId} = req.params
    Product
        .findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products',
            })
        })
}

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1
    let totalProducts

    Product
        .find()
        .countDocuments()
        .then(numProducts => {
            totalProducts = numProducts
            return Product
                .find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then((products) => {
            res.render('shop/index', {
                products: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products,
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.postCart = (req, res, next) => {
    const {productId} = req.body
    Product
        .findById(productId)
        .then(product => req.user.addToCart(product))
        .then(result => res.redirect('/cart'))
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout'
//     })
// }

exports.postCartDeleteItem = (req, res, next) => {
    const {productId} = req.body
    req.user
        .deleteCartItem(productId)
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return {
                    quantity: i.quantity,
                    product: { ...i.productId._doc }
                }
            })
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            })
            return order.save()
        })
        .then(result => {
            return req.user.clearCart()
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getInvoice  = (req, res, next) => {
    const {orderId} = req.params

    Order
        .findById(orderId)
        .then(order => {
            if(!order){
                return next(new Error("No order found!!!"))
            }
            if(order.user.userId.toString() !== req.user._id.toString()){
                return next(new Error("Unauthorized"))
            }
            const invoiceName = 'invoice-'+ orderId + '.pdf'
            const invoicePath = path.join('data', 'invoices', invoiceName)

            const pdfDoc = new PDFDocument()
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
            pdfDoc.pipe(fs.createWriteStream(invoicePath))
            pdfDoc.pipe(res)

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            })
            pdfDoc.text('______________________________')
            let totalPrice = 0
            order.products.forEach(product => {
                totalPrice+= product.quantity * product.product.price
                pdfDoc.fontSize(16).text(`${product.product.title} - ${product.quantity} X $${product.product.price}`)
            })
            pdfDoc.text('____')
            pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`)

            pdfDoc.end()

            // fs.readFile(invoicePath, (err, data) => {
            //     if(err) {
            //         return next(err)
            //     }
            //     // res.download(invoicePath)
            //     res.setHeader('Content-Type', 'application/pdf')
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
            //     res.send(data)
            // })
            // const file = fs.createReadStream(invoicePath)
            // res.setHeader('Content-Type', 'application/pdf')
            // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
            // file.pipe(res)
        })
        .catch(err => next(err))
}
