const mongoose = require('mongoose')
const dbThings = require('../dbThings.js')
const Schema = mongoose.Schema

const s2_Schema = new Schema({
    __lifecycle : {
        type: String,
        required: true
    },
    _namespace: {
        type: String,
        required: true
    },
    thingId: {
        type: String,
        required: false
    }
}, { strict: false })

const ThingSchema = new Schema({
    pid: {
        type: String,
        required: true
    },
    s2: {
        type: s2_Schema,
        required: true
    }
}, { strict: false })

module.exports = dbThings.model('Things_snaps', ThingSchema, 'things_snaps')