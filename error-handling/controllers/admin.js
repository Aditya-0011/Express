const Product = require('../models/product')
const { validationResult } = require('express-validator')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddProduct = (req, res, next) => {
    const {title, imageUrl, price, description} = req.body;
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
            pageTitle: "Add Product",
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }

    const product = new Product({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user
        }
    )
    product
        .save()
        .then(result => {
            res.redirect('/admin/products')
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
    }

exports.getProducts = (req, res, next) => {
    Product
        .find({userId: req.user._id})
        .then(products => {
            res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if(!editMode){
       return res.redirect('/')
    }
    const {productId} = req.params

    Product
        .findById(productId)
        .then(product => {
            if(!product){
                return res.redirect('/')
            }
            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: true,
                errorMessage: null,
                validationErrors: []
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })

}

exports.postEditProduct =  (req, res, next) => {
    const {productId} = req.body
    const updatedTitle = req.body.title
    const updatedImageUrl = req.body.imageUrl
    const updatedPrice = req.body.price
    const updatedDescription = req.body.description
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
            pageTitle: "Edit Product",
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                imageUrl: updatedImageUrl,
                price: updatedPrice,
                description: updatedDescription,
                _id: productId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
    Product
        .findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
              res.redirect('/')
            }
            product.title = updatedTitle
            product.price = updatedPrice
            product.imageUrl = updatedImageUrl
            product.description = updatedDescription
            return product
                .save()
                .then(result => {
                    res.redirect('/admin/products')
                })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.postDeleteProduct =  (req, res, next) => {
    const {productId} = req.body
     Product
         .deleteOne({ _id: productId, userId: req.user._id })
         .then(() => res.redirect('/admin/products'))
         .catch(err => {
             const error = new Error(err)
             error.httpStatusCode = 500
             return next(error)
         })
}