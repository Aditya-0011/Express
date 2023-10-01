const express = require('express')
const { body } = require('express-validator')

const adminController = require('../controllers/admin')

const router = express.Router()

router.get('/add-product', adminController.getAddProduct)
router.get('/products', adminController.getProducts)
router.post(
    '/add-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('imageUrl')
            .isURL(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    adminController.postAddProduct
)

router.get('/edit-product/:productId', adminController.getEditProduct)
router.post(
    '/edit-product',
    [
        body('title')
            .isLength({ min: 3 })
            .isString()
            .trim(),
        body('imageUrl')
            .isURL(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    adminController.postEditProduct)

router.post('/delete-product', adminController.postDeleteProduct)

module.exports = router