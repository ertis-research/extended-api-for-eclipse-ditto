const mongoose = require('mongoose')

const uri = process.env.MONGO_URI
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.Promise = global.Promise
mongoose
    .connect(uri, options)
    .then(function () {
        console.log("Conectado a MongoDB")
    })
    .catch(function (err) {
        console.error(err)
    })