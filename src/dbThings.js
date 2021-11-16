const mongoose = require('mongoose')
const m = new mongoose.Mongoose()

const uri = process.env.MONGO_URI_THINGS
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

m.Promise = global.Promise
m
    .connect(uri, options)
    .then(function () {
        console.log("Conectado a MongoDB")
    })
    .catch(function (err) {
        console.error(err)
    })

module.exports = m