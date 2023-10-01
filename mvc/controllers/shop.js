const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            products: products,
            pageTitle: 'All Products',
            path: '/products'
        })
    })
}
exports.getProduct = (req, res, next) => {
    const productId = req.params.productId
    Product.findById(productId, product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        })
    })
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', {
            products: products,
            pageTitle: 'Shop',
            path: '/'
        })
    })
}

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts =[]
            for(product of products){
                const cartProductData = cart.products.find(prod => prod.id === product.id)
                if(cartProductData){
                    cartProducts.push({ productData: product, qty: cartProductData.qty })
                }
            }
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts
            })
        })
    })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId
    Product.findById(productId, product => {
        Cart.addProduct(productId, product.price)
    })
    res.redirect('/cart')

    // res.render('shop/cart', {
    //     path: '/cart',
    //     pageTitle: 'Your Cart'
    // })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders'
    })
}

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId
    Product.findById(productId, product => {
        Cart.deleteProduct(productId, product.price)
        res.redirect('/cart')
    })
}


//To use when only controller is used

// const products = []
//
// exports.getAddProduct = (req, res, next) => {
//     res.render('add-product', {
//         pageTitle: "Add Product",
//         path: '/admin/add-product',
//     })
// }
//
// exports.postAddProduct = (req, res, next) => {
//     products.push({
//         title: req.body.title
//     })
//     res.redirect('/')
// }
//
// exports.getProducts = (req, res, next) => {
//     res.render('shop', {
//         products: products,
//         pageTitle: 'Shop',
//         path: '/',
//     })
// }