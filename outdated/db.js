var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var record = new Schema({
    ids: Array,
    record: {
        date: Date,
        dispel: [{
            name: String,
            link: String,
            points: Number,
            days: Number,
            rate: Number,
            check0: String,
            check1: String
        }]
    }
});

module.exports = mongoose.model('Record', record);
