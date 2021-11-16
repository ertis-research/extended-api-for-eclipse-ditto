const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ThingListSchema = new Schema({
  thingTypeId: {
    type: String,
    required: true,
    unique: true
  },
  number: {
    type: Number,
    required: true
  }
})

const TwinTypeSchema = new Schema({
  twinTypeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  things: {
    type: [ThingListSchema],
    required: false
  }
});

module.exports = mongoose.model('TwinType', TwinTypeSchema)