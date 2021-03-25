const mongoose = require("mongoose");


const QuizSchema = new mongoose.Schema({
    title: {type: String, required: true},
    desc: {type: String, required: true},
    noq: {type: Number, required: true},
    questions: {type: Array, required: true},
    createdBy: {type: String, required: false},
    createdAt: {type: Date, default: Date.now},
})

module.exports = QuizSchema;
