const mongoose = require('mongoose');
const validator = require('validator');

const MessageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      validator: {
        validator(title) {
          return validator.isAlphanumeric(title);
        },
      },
    },
    description: {
      type: String,
      required: true,
      validator: {
        validator(description) {
          return validator.isAlphanumeric(description);
        },
      },
    },
    reminder: {
      type: Boolean,
      require: false,
      default: false,
    },
    status: {
      type: String,
      enum: ['completo', 'novo'],
      default: 'novo',
    },
    category: {
      type: String,
      enum: ['work', 'todos', 'tech', 'pessoal'],
      default: 'todos',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', MessageSchema);