const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient
let _db

const connectionUrl = "mongodb+srv://aditya-0011:UaKTgAjKESgT0pMk@cluster0.gdrorud.mongodb.net/shop?retryWrites=true&w=majority"
const mongoConnect = (callback) => {
    MongoClient
        .connect(connectionUrl)
        .then(client => {
            console.log("Connected")
            _db = client.db('shop')
            callback()
        })
        .catch(error => {
            console.log(error)
            throw error
        })
}

const getDb = () => {
    if(_db){
        return _db
    }
    throw 'No Database Found'
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb