/**
 * Created by anbaksa on 2016-06-21.
 */
const UserDao = require('../dao/user/UserDao');

var refreshTockenUpdate = function (globalConfig, userSession, clientId, sessionId, accessToken, refreshToken, redisClient) {

    var client_id = clientId;//request.session.clientId;
    var gAccessToken = accessToken;//request.session.accessToken;
    var gARefreshToken = refreshToken; //request.session.refreshToken;

    var rkey = "session:" + gAccessToken;
    var rkeyId = "session:" + sessionId;


    var expiresRefresh = new Date();
    expiresRefresh.setSeconds( expiresRefresh.getSeconds() + globalConfig.REDIS_REFRESH_LIFE * 86400 );   //30일 갱신됨.

    var expires = new Date();
    expires.setSeconds(expires.getSeconds() + globalConfig.REDIS_ACCESS_LIFE);  //2시간 갱신됨. 7200

    var milli = expires.getTime();
    var refreshMilli = expiresRefresh.getTime();

    var gExpires = milli;
    var gRefreshExpires = refreshMilli;


    //var redisClient = server.plugins['hapi-redis'].client;

    redisClient.hmset(rkeyId, {
        accessToken: gAccessToken,
        refreshToken: gARefreshToken,
        clientId: client_id,
        sessionId:sessionId,
        expires: gExpires,
        refreshExpires: gRefreshExpires
    });

    if(globalConfig.REDIS_REFRESH_LIFE != 0) {
        redisClient.expire(rkey, globalConfig.REDIS_REFRESH_LIFE * 86400);   //세션 소멸 시간 기록.
    } else {
        redisClient.persist(rkey);
    }


    redisClient.hmset(rkey, {
        accessToken: gAccessToken,
        refreshToken: gARefreshToken,
        clientId: client_id,
        sessionId:sessionId,
        expires: gExpires,
        refreshExpires: gRefreshExpires
    });

    if(globalConfig.REDIS_REFRESH_LIFE != 0) {
        redisClient.expire(rkey, globalConfig.REDIS_REFRESH_LIFE * 86400);   //세션 소멸 시간 기록.
    } else {
        redisClient.persist(rkey);
    }



    userSession.sessionId = sessionId;
    userSession.clientId = client_id;
    userSession.accessToken = gAccessToken;
    userSession.refreshToken = gARefreshToken;
    userSession.expires = milli;
    userSession.refreshExpires = refreshMilli;
}

exports.register = function(server, options, next) {

    var AuthBearer = require('./auth_bearer.js');//require('hapi-auth-bearer-token');
    const ServerConfig = require('../../ServerConfig.js');
    var globalConfig = ServerConfig.globalConfig;

    server.register(AuthBearer, function (err)  {
        server.auth.strategy('simple', 'bearer-access-token', {
            allowQueryToken: true,              // optional, true by default
            allowMultipleHeaders: false,        // optional, false by default
            accessTokenName: 'access_token',    // optional, 'access_token' by default
            validateFunc: function (token, callback) {

                // For convenience, the request object can be accessed
                // from `this` within validateFunc.
                var request = this;
                var checkRedis = false;
                /*
                    1  단계 세션 체크, expire 체크.  세션에서는 주기적으로 redis로 부터 인증정보를 받아 업데이트 해야한다.
                    2. 단계 1단계 실패시 Redis 체크.
                    3. expire 시간 업데이트.
                 */
                var now = new Date();
                var nMili = now.getTime();

                var authResult = false;
                var isExpire = false;
                var hasTocken = false;

                var accessToken = request.session.accessToken;
                if(accessToken != null) {
                    //세션 인증 말료 체크.
                    hasTocken = true;
                    var expires = request.session.expires;
                    if(nMili > expires) {
                        //세션 만료.
                        //레디스 업데이트.
                        authResult = false;
                        isExpire = true;
                    } else {
                        //세션 내에 있음.
                        if(token == accessToken ) {
                            //같음.
                            //세션 expire 업데이트.
                            authResult = true;

                            //세션 갱신후 일정시간 지났다면. (한시간)
                            //기존 세션과 비교하여 갱신 해주어야한다.
                            if(nMili - expires >  globalConfig.REDIS_UPDATE_LIFE) {
                                checkRedis = true;
                                var rkey = "session:" + token;
                                var redisClient = server.plugins['hapi-redis'].client;
                                redisClient.hgetall(rkey, function (err, sessionValue) {

                                    if (err)  {
                                        isExpire = true;
                                        return callback(null, false, { token: token }, { }, isExpire);
                                    }

                                    if (!sessionValue) {
                                        isExpire = true;
                                        return callback(null, false, { token: token }, { }, isExpire);
                                    }

                                    var sessionAccessToken = sessionValue.accessToken;

                                    if(sessionAccessToken == token ) {
                                        refreshTockenUpdate(globalConfig, request.session, request.session.clientId, request.session.sessionId,
                                            token, request.session.refreshToken, redisClient );
                                        isExpire = false;
                                        return callback(null, true, {token: token}, {}, isExpire);
                                    } else {
                                        return callback(null, false, { token: token }, { }, isExpire);
                                    }
                                });

                            }
                        } else {
                            //다름
                            authResult = false;
                        }
                    }
                } else {
                    hasTocken = false;
                }

                /*
                    세션이 없거나.
                    다르다면 Redis 에서 최신 세션 정보를 불러온후.
                    비교 한다.
                 */

                //if(authResult == false && isExpire == false && hasTocken == false ) {

                if(checkRedis == false) {
                    if (authResult == false) {
                        var rkey = "session:" + token;
                        var redisClient = server.plugins['hapi-redis'].client;
                        redisClient.hgetall(rkey, function (err, sessionValue) {
                            if (err) {
                                isExpire = true;
                                return callback(null, false, {token: token}, {}, isExpire);
                            }

                            if (!sessionValue) {
                                isExpire = true;
                                return callback(null, false, {token: token}, {}, isExpire);
                            }

                            /*
                             var expires = new Date();
                             expires.setSeconds(expires.getSeconds() + serverConfig.authCodeLifetime);
                             var milli = expires.getTime();
                             */

                            var gAccessToken = sessionValue.accessToken;
                            var gARefreshToken = sessionValue.refreshToken;
                            var gExpires = sessionValue.expires;
                            var sessionId = sessionValue.sessionId;
                            var client_id = sessionValue.clientId;
                            var gRefreshExpires = sessionValue.refreshExpires;


                            if (gAccessToken == token) {

                                request.session.accessToken = gAccessToken;
                                request.session.refreshToken = gARefreshToken;
                                request.session.expires = gExpires;
                                request.session.clientId = client_id;
                                request.session.sessionId = sessionId;
                                request.session.refreshExpires = gRefreshExpires;

                                if (nMili > gExpires) {
                                    isExpire = true;
                                    return callback(null, false, {token: token}, {}, isExpire);
                                } else {
                                    isExpire = false;
                                    return callback(null, true, {token: token}, {}, isExpire);
                                }
                            } else {
                                return callback(null, false, {token: token}, {}, false);
                            }
                        });

                    } else {
                        if (authResult) {
                            return callback(null, true, {token: token}, {}, isExpire);
                        } else {
                            return callback(null, false, {token: token}, {}, isExpire);
                        }
                    }
                }

                /*
                // Use a real strategy here,
                // comparing with a token from your database for example
                if (token === "1234") {
                    return callback(null, true, { token: token }, { artifact1: 'an artifact' });
                }

                return callback(null, false, { token: token }, { artifact1: 'an artifact' });
                */

            }
        });



        server.route({
            method: 'GET',
            path: '/auth_test',
            config: {
                auth: 'simple',
                handler: function (request, reply) {

                    return reply('success');
                }
            }
        });
    });




    server.route({
        method: 'POST',
        path: '/req_token',
        config: {

            handler: function (request, reply) {
                var result;

                var client_id = request.payload.client_id;
                var client_secret = request.payload.client_secret;
                var session_id = request.payload.session_id;


                if(client_id == null || client_secret == null) {
                    result =  {"message":"유저 정보가 잘못 되었습니다.", "constant":"AUTH_ERROR_PARAM", "code":"a500"};
                    return reply(result);
                }

                //var UserDao = require('../dao/UserDao');
                // var UserDao = require('../dao/MarsUserDao');
                // UserDao.getUser(client_id, function(resultValue) {
                //     if (resultValue.length > 0 || 1) {

                        // var user = {};//resultValue[0];
                // user.user_name = '테스터';
                // user.password = '12345';
                // user.user_type = '1';
                UserDao.getOneByUserId(client_id, function(user) {
                    if (user.password != client_secret) {
                        result = {"message": "회원 정보를 찾을 수 없습니다.", "constant": "AUTH_ERROR_NOT_FOUND", "code": "a501"};
                        return reply(result);
                    } else {
                        //expire 소멸 시간.
                        //accessToken
                        //refreshToken
                        generateRandomToken(function (result, token) {
                            var gAccessToken = token;

                            generateRandomToken(function (result, token) {
                                var gARefreshToken = token;


                                var expiresRefresh = new Date();
                                expiresRefresh.setSeconds(expiresRefresh.getSeconds() + globalConfig.REDIS_REFRESH_LIFE * 86400);   //30일 갱신됨.


                                var expires = new Date();
                                console.log(expires);
                                expires.setSeconds(expires.getSeconds() + globalConfig.REDIS_ACCESS_LIFE);  //2시간 갱신됨. 7200
                                console.log(expires);
                                var milli = expires.getTime();
                                var refreshMilli = expiresRefresh.getTime();

                                /*
                                 var sessionExpires = new Date();
                                 sessionExpires.setSeconds(sessionExpires.getSeconds() + serverConfig.authCodeSessionLifetime);
                                 var sessionMilli = sessionExpires.getTime();
                                 */


                                //Redis 수정.
                                var redisClient = server.plugins['hapi-redis'].client;
                                //클라이언트 세팅.
                                var rkey = "session:" + session_id;

                                redisClient.hmset(rkey, {
                                    accessToken: gAccessToken,
                                    refreshToken: gARefreshToken,
                                    clientId: client_id,
                                    sessionId: session_id,
                                    expires: milli,
                                    refreshExpires: refreshMilli
                                    //userName:user.user_name,
                                    //userType:user.user_type
                                });

                                if (globalConfig.REDIS_REFRESH_LIFE != 0) {
                                    redisClient.expire(rkey, globalConfig.REDIS_REFRESH_LIFE * 86400);   //세션 소멸 시간 기록.
                                } else {
                                    redisClient.persist(rkey);
                                }

                                //세션 정보 세팅
                                rkey = "session:" + gAccessToken;
                                redisClient.hmset(rkey, {
                                    accessToken: gAccessToken,
                                    refreshToken: gARefreshToken,
                                    clientId: client_id,
                                    sessionId: session_id,
                                    expires: milli,
                                    refreshExpires: refreshMilli
                                    //userName:user.user_name,
                                    //userType:user.user_type
                                });

                                if (globalConfig.REDIS_REFRESH_LIFE != 0) {
                                    redisClient.expire(rkey, globalConfig.REDIS_REFRESH_LIFE * 86400);   //세션 소멸 시간 기록.
                                } else {
                                    redisClient.persist(rkey);
                                }


                                //////////////////////


                                result = {
                                    result: true, "message": "", "constant": "AUTH_SUCCESS", "code": "a500"
                                    , accessToken: gAccessToken
                                    , refreshToken: gARefreshToken
                                };
                                request.session.clientId = client_id;
                                request.session.sessionId = session_id;
                                request.session.accessToken = gAccessToken;
                                request.session.refreshToken = gARefreshToken;
                                request.session.expires = milli;
                                request.session.refreshExpires = refreshMilli;

                                //request.session.sessionExpires = sessionMilli;

                                return reply(result);
                            });
                        });
                    }
                    // } else {
                    //     result =  {"message":"회원 정보를 찾을 수 없습니다.", "constant":"AUTH_ERROR_NOT_FOUND", "code":"a501"};
                    //     return reply(result);
                    // }
                    // });
                });
            }
        }
    });


    server.route({
        method: 'POST',
        path: '/refresh_token',
        config: {
            handler: function (request, reply) {
                var result;

                var client_id = request.payload.client_id;
                var sessionId = request.payload.session_id;
                var refreshToken = request.payload.refreshToken;
                var redisClient = server.plugins['hapi-redis'].client;

                var rkey = "session:" + sessionId;
                redisClient.hgetall(rkey, function (err, sessionValue) {
                    if (err)  {
                        return;
                    }

                    if (!sessionValue) {
                        return ;
                    }

                    var gAccessToken = sessionValue.accessToken;
                    var gARefreshToken = sessionValue.refreshToken;
                    //sessionValue.milli;

                    //리플래시 토큰 살아있다.
                    if(gARefreshToken == refreshToken) {

                        //기존 토큰을 소멸시킨다.
                        var rkey = "session:" + gAccessToken;
                        redisClient.del(rkey);

                        //새로운 토큰으로 갱신한다.
                        var globalConfig = ServerConfig.globalConfig;
                        generateRandomToken(function(result, token) {
                            var gAccessToken = token;

                            refreshTockenUpdate(globalConfig, request.session, client_id,sessionId,
                                gAccessToken, gARefreshToken,  redisClient );


                            result =  {result : true, "message":"", "constant":"AUTH_SUCCESS", "code":"a500"
                                , accessToken : gAccessToken
                                , refreshToken : gARefreshToken
                            };

                            return reply(result);
                        });

                    } else {
                        return reply({result : false });
                    }
                });
            }
        }
    });



    next();
};


var crypto = require('crypto');
var generateRandomToken = function (callback) {
    crypto.randomBytes(256, function (ex, buffer) {
        if (ex) return callback(error('server_error'));

        var token = crypto
            .createHash('sha1')
            .update(buffer)
            .digest('hex');

        callback(false, token);
    });
};


/**
 * Plugin attributes...
 * we have here the Name and the Version of the plugin
 */
exports.register.attributes = {

    name : 'AuthorizationModule',
    version : '1.0.0'
};