const mongoose = require('mongoose');

var blogCatSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true
    }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("BCategory", blogCatSchema);