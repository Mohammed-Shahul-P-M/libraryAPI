const { MongoClient } = require('mongodb')

const mongoUri = process.env.DB
let db = null

module.exports.connect = function (callback) {


    MongoClient.connect(mongoUri, { useUnifiedTopology: true }, (err, data) => {
        if (err) {

            return callback(' error at atlas')
        }
        db = data.db()

        callback()
    })
}

module.exports.get = function () {
    return db
}
