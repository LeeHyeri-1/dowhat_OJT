
const moment = require('moment');


exports.e = function(path, exception, subPath = null) {
    let date = moment().format('YYYY-MM-DD HH:mm:ss');
    if(subPath != null){
        console.log(date, path, subPath, exception.stack);
    } else {
        console.log(date, path, exception.stack);
    }
}


exports.i = function(path, message, subPath = null) {
    let date = moment().format('YYYY-MM-DD HH:mm:ss');
    if(subPath != null){
        console.log(date, path, subPath, message);
    } else {
        console.log(date, path, message);
    }
}

exports.m = function(message) {
    let date = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(date, message);
}