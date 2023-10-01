const mongodb = require('mongodb')

const getDB = require('../utils/database').getDb

class Product {
    constructor(title, price, imageUrl, description, productId, userId) {
        this.title = title
        this.price = price
        this.imageUrl = imageUrl
        this.description = description
        this._id = productId ? new mongodb.ObjectId(productId) : null
        this.userId = userId
    }

    save(){
        const db = getDB()
        let dbOp
        if(this._id){
            dbOp = db
                .collection('products')
                .updateOne({ _id: this._id }, { $set: this })
        }
        else{
            dbOp = db
                .collection('products')
                .insertOne(this)
        }
        return dbOp
            .then(result => console.log(result))
            .catch(err => console.log(err))
    }

    static fetchAll(){
        const db = getDB()
        return db
            .collection('products')
            .find()
            .toArray()
            .then(products => {
                console.log(products)
                return products
            })
            .catch(err => console.log(err))
    }

    static findById(productId){
        const db = getDB()
        return db
            .collection('products')
            .find({ _id: new mongodb.ObjectId(productId) })
            .next()
            .then(product => {
                console.log(product)
                return product
            })
            .catch(err => console.log(err))
    }

    static deleteById(productId){
        const db = getDB()
        return db
            .collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(productId) })
            .then(result => console.log(result))
            .catch(err => console.log(err))
    }
}

module.exports = Product