/**
 * Created by 유희찬 on 2020-04-23.
 */

const jwt = require('jsonwebtoken');

const ServerConfig = require('../../ServerConfig');
let globalConfig = ServerConfig.globalConfig;
let serverConfig = ServerConfig.serverConfig;

exports.jwtModel = (userType) => {
    let retList;

    if(userType === 'USER')
        retList = [
            'userId', 'sessionId', 'userType', 'clientType'
        ];

    else if(userType === 'ADMIN')
        retList = [
            'adminId', 'userType'
        ];

    return retList;
};

exports.makeJwt = (partObj, expiresIn) => {
    let makeObj = exports.jwtModel(partObj.userType);
    let tokenObj = {};

    for(let item of makeObj)
        tokenObj[item] = partObj[item];

    return jwt.sign(tokenObj, globalConfig.JWT_SECRET, {algorithm: 'HS256', expiresIn: expiresIn});
};

exports.validate = function (request, decodedToken, callback) {

    let error = null;
    let credentials = {};

    if(decodedToken.userType == 'ADMIN'){
        credentials = {
            adminId: decodedToken.adminId,
            userType: decodedToken.userType
        }
    } else {
        credentials = {
            userId: decodedToken.userId,
            sessionId: decodedToken.sessionId,
            userType: decodedToken.userType,
            clientType: decodedToken.clientType
        }
    }

    if (!credentials) {
        return callback(error, false, credentials);
    }

    return callback(error, true, credentials)
};

exports.validateAdmin = function (request, decodedToken, callback) {

    let error = null;
    let credentials = {};

    if(decodedToken.userType == 'ADMIN'){
        credentials = {
            adminId: decodedToken.adminId,
            userType: decodedToken.userType
        }
    }

    if (!credentials) {
        return callback(error, false, credentials);
    }

    return callback(error, true, credentials)
};