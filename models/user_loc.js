var mongoose = require('mongoose');
var schema = mongoose.Schema;
var userLoc = new schema({
    "email":{
        type:String,
        unique:true,
        required:true
    },
    "latitude":{
        type:Number,
        required:true
    },
    "longitude":{
        type:Number,
        required:true
    }
},{collection:'location'});

module.exports = mongoose.model('userLocation',userLoc);