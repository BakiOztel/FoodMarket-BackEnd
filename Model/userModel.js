const mongoose = require("mongoose");

const userModel = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true
    },
    refreshToken: {
        type: String
    }
});

module.exports = mongoose.model("users", userModel);