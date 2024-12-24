/**
 * Created by 유희찬 on 2017-11-01.
 */

var sql = require('mysql');
var SqlTemplate = require('../../MysqlTemplate');

// 등록
exports.insert = function(server, id, method, path, header, params, query, payload, response, status_code) {


    var query1 = " INSERT INTO t_nf_log_error SET ? ";
    var params = {
        'server' : server,
        'id' : id,
        'method' : method,
        'path' : path,
        'header' : header,
        'params' : params,
        'query' : query,
        'payload' : payload,
        'response' : response,
        'status_code' : status_code,
    };

    SqlTemplate.exec(query1, params,function(result) {

    });
};


var log = function (logType, tag, message) {
    var query1 = " INSERT INTO t_nf_log SET ? ";
    var params = {
        'log_type': logType,
        'tag': tag,
        'message': message
    };

    SqlTemplate.exec(query1, params, function (result) {
    });
};


/*
 LogErrorDao.debug('test', 'adsfasdf');
 */
exports.debug = function(tag, message) {
    log("DEBUG", tag, message);
};

exports.error = function(tag, message) {
    log("ERROR", tag, message);
};

exports.info = function(tag, message) {
    log("INFO", tag, message);
};
