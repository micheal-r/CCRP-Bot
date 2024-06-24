const { Schema, model} = require('mongoose');

const Moderations = new Schema({
    target: String,
    reason: String,
    moderator: String,
    case: Number,
    type: String,
})

module.exports = model('Moderations', Moderations);