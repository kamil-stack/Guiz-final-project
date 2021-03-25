const { Int32 } = require("mongodb");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    USERNAME: {type: String, required: true, index: {unique: true} },
    PASSWORD: {type: String, required: true},
    CREATED: {type: Date, default: Date.now},
});


module.exports = UserSchema;
