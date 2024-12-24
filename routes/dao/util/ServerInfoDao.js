/**
 * Created by bestist on 2016-06-13.
 */
/**
 * Created by bestist on 2016-05-31.
 */
// Load required packages
let sql = require('mysql');
let CommonDao = require('../CommonDao');

// 서버 정보 로드.
exports.getServerInitData = function (serverType, serverId, next) {
    let query = [];

    let query1 =
        "   SELECT * " +
        "   FROM t_nf_server_info " +
        "   WHERE server_type = " + sql.escape(serverType) + " AND server_id = " + sql.escape(serverId);

    let query2 =
        "   SELECT * " +
        "   FROM t_nf_server_config " +
        "   WHERE config_type IN (" + sql.escape(serverType) + ", 'GLOBAL')";

    query.push(query1);
    query.push(query2);

    CommonDao.get(query, function (recordSet) {
        next(recordSet[0][0], recordSet[1]);
    });
};

// 서버 정보 로드.
exports.getServerInfo = function (serverType, serverId, next) {

    let query = "" +
        "   SELECT * " +
        "   FROM t_nf_server_info " +
        "   WHERE server_type = " + sql.escape(serverType) + " AND server_id = " + sql.escape(serverId);

    CommonDao.getOne(query, function (record) {
        next(record);
    });
};

// 서버 설정 정보 로드.
exports.getServerInfo = function (configType, configId, next) {
    let query = "" +
        "   SELECT * " +
        "   FROM t_nf_server_config " +
        "   WHERE config_type = " + sql.escape(configType) + " AND config_id = " + sql.escape(configId);

    CommonDao.getOne(query, function (record) {
        next(record);
    });
};

