const mongoose = require("mongoose");

const allcontactssss = new mongoose.Schema({}, { strict: false, timestamps: true, versionKey: false });

module.exports = allcontacts = mongoose.model("allcontacts", allcontactssss);