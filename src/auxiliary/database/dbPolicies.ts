import mongoose, { ConnectOptions, Mongoose } from 'mongoose'
import { getAllpolicies_enabled, mongodb_uri } from '../../static'

const m = new mongoose.Mongoose()
m.set('strictQuery', false)

m.Promise = global.Promise
if(getAllpolicies_enabled && mongodb_uri) {
    console.log("Trying to connect to " + mongodb_uri)
    m.connect(mongodb_uri)
    .then(function () {
        console.log("Conectado a MongoDB")
    })
    .catch(function (err) {
        if(getAllpolicies_enabled) console.error(err)
    })
}

export default m