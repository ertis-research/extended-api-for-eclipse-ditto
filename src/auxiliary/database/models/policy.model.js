const mongoose = require('mongoose')
const dbPolicies = require('../dbPolicies.js')
const Schema = mongoose.Schema

const eventSchema = new Schema({
    pid: {
        type: String,
        required: true
    },
    manifest: {
        type: String,
        required: true
    }
}, { strict: false })

const journalSchema = new Schema({
    to: {
        type: Number,
        required: true
    },
    events: {
        type: [eventSchema],
        required: true
    }
}, { strict: false })

const s2Schema = new Schema({
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
        type: s2Schema,
        required: true
    }
}, { strict: false })

//module.exports = dbPolicies.model('Policies_snaps', PolicySchema, 'policies_snaps')
module.exports = dbPolicies.model('Policies_journal', journalSchema, 'policies_journal')