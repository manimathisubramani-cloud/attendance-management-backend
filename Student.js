const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  registerNumber: {
    type: String,
    required: true
  },

  totalClasses: {
    type: Number,
    default: 0
  },

  present: {
    type: Number,
    default: 0
  },

  absent: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model('Student', studentSchema)