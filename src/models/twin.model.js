const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TwinSchema = new Schema({
  twinId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false
  },
  type: {
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
  }
});

module.exports = mongoose.model('Twin', TwinSchema)