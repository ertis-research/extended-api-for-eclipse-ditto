const mongoose = require('mongoose')
const dbPolicies = require('../dbPolicies.js')
const Schema = mongoose.Schema

const s2_Schema = new Schema({
    __lifecycle : {
        type: String,
        required: false
    },
    policyId: {
        type: String,
        required: true,
        unique: true
    },
    entries: {
        type: Schema.Types.Mixed,
        required: false
    }
}, { strict: false })

const PolicySchema = new Schema({
    pid: {
        type: String,
        required: true
    },
    s2: {
        type: s2_Schema,
        required: true
    }
}, { strict: false })

module.exports = dbPolicies.model('Policies_snaps', PolicySchema, 'policies_snaps')