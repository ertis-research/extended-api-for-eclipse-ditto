const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ThingTypeSchema = new Schema({
  thingTypeId: {
    type: String,
    required: true,
    unique: true
  },
  policyId: {
    type: String,
    required: true
  },
  definition: {
    type: String,
    required: false
  },
  attributes: {
    type: Schema.Types.Mixed,
    required: false
  },
  features: {
    type: Schema.Types.Mixed,
    required: false
  }
});

module.exports = mongoose.model('ThingType', ThingTypeSchema)