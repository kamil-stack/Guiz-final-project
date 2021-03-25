const mongoose = require("mongoose");


const GameSchma = new mongoose.Schema({
    code: {type: String, required: true, unique: true},
    user: {type: String, required: true},
    quizid: {type: String, required: true},
    createdAt: { type: Date, expires: 1200, default: Date.now },
})

module.exports = GameSchma;
