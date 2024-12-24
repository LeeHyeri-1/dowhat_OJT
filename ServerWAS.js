/**
 * Created by anbaksa on 2017-02-13.
 * Edit by Yoo on 2017-12-27
 */
'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const os = require('os');
const async = require('async');
const Yar = require('yar');
const moment = require('moment');
const cluster = require('cluster');

// 스케쥴링 정책을 라운드 로빈으로 변경
cluster.schedulingPolicy = cluster.SCHED_RR;

var routeConfig = require('./RouteConfig');

// **************  여기를 수정합니다. ******************

const SERVER_TYPE = 'WAS';
const PROTOCOL = 'HTTP';
const ROUTES = routeConfig.path[SERVER_TYPE];

// 수동 변경 설정 값
let globalOpt = {
    FILE_PUBLIC: 'C:/temp',
};
let serverOpt = {};

// 스케쥴러를 작성한다.
var runScheduler = function () {
/*    const Scheduler = require('./routes/scheduler/SchedulerWAS');
    Scheduler.getHolidayList();
    Scheduler.getVbankOrderList();
    Scheduler.funcOldVbankDelete();
    // Scheduler.ReservationAlarm();*/
};

// **************  여기까지 수정합니다. ****************

const ServerConfig = require('./ServerConfig');

const serverInfoDao = require('./routes/dao/util/ServerInfoDao');
const fs = require("fs");

var globalConfig = ServerConfig.globalConfig;
var serverConfig = ServerConfig.serverConfig;

var serverIdConfig = ServerConfig.serverIdConfig;
var SERVER_ID = serverIdConfig[SERVER_TYPE].serverId;

var filterData = ServerConfig.filterData;
// var MsgFilterDao = require('./routes/dao/SNS/MsgFilterDao');

const options = {
    cookieOptions: {
        password: 'brw2bv6jjhsddvli1t08fjuew90o8fju24f4-2di8he48903',   // Required
        isSecure: false, // Required if using http
        ttl: 1000 * 60 * 60 * 24 * 30 // Time Expire 30일
    },
    redirectUrl: '/kr'
};


exports.getSession = function (req, reply, required, next) {
    var session = {
        "USER_ID": '',
        "USER_NAME": '',
        "USER_TYPE": '',
        "COMPANY_SEQ": '',
        "SESSION_ID": ''
    };
    var userId = req.yar.get('USER_ID');

    if (userId == undefined || userId == '') {
        if (required) {
            reply.redirect(options.redirectUrl);
        } else {
            next(session);
        }
    } else {
        session = req.yar._store;
        next(session);
    }
};
console.log('Server Start - SERVER_TYPE :', SERVER_TYPE, '/ SERVER_ID :', SERVER_ID);

// 서버 기본 정보를 받아온다.
serverInfoDao.getServerInitData(SERVER_TYPE, SERVER_ID, function (serverInfo, configData) {



    if (!serverInfo) {
        //서버 정보 로드 실패.
        console.log('getServerInfo : 서버 정보 로드 실패');
        process.exit(1);

    } else {
        console.log('getServerInfo : 서버 정보 로드 성공');

        // 디비에서 설정 값을 읽어와 메모리에 적재한다.
        for (var i = 0; i < configData.length; i++) {
            if (configData[i].config_type == 'GLOBAL')
                globalConfig[configData[i].config_id] = configData[i].data;
            else if (configData[i].config_type == SERVER_TYPE)
                serverConfig[configData[i].config_id] = configData[i].data;
        }

        serverConfig.replyTime = moment().unix();

        //an 서버 타입을 저장한다.
        serverConfig['SERVER_TYPE'] = SERVER_TYPE;
        serverConfig.DIRROOT = __dirname;

        for (var gKey in globalOpt)
            globalConfig[gKey] = globalOpt[gKey];
        for (var sKey in serverOpt)
            serverConfig[sKey] = serverOpt[sKey];

        serverConfig.apnsList = [];

        // 서버 커넥션 설정
        var serverOption = {
            port: '65432',
            routes: {cors: true}
    };

        // HTTPS 통신의 경우 키와 인증서를 세팅해 준다.
        if (PROTOCOL == 'HTTPS') {
            const fs = require('fs');

            var cert = fs.readFileSync(__dirname + "/ssl/againsang.crt", 'utf8');
            var key = fs.readFileSync(__dirname + "/ssl/www.againsang.com_key.pem", 'utf8');

            serverOption.tls = {cert: cert, key: key};

        }

        // 환경 변수 조정
        if (serverConfig.SERVER_OS == 'windows') {
            process.env.Path += ';' + serverConfig.SYS_ENVIRONMENT + ';';
            process.env.Path += __dirname + '\\dfs_modules\\gm_windows;' + __dirname + '\\dfs_modules\\ffmpeg_windows';
            serverConfig.FILE_FFMPEG = __dirname + '\\dfs_modules\\ffmpeg_windows\\ffmpeg.exe';

        } else if (serverConfig.SERVER_OS == 'linux') {
            process.env.PATH += ':' + serverConfig.SYS_ENVIRONMENT + ':';
            process.env.PATH += __dirname + '/dfs_modules/gm_linux:' + __dirname + '/dfs_modules/ffmpeg_linux';
            serverConfig.FILE_FFMPEG = __dirname + '/dfs_modules/ffmpeg_linux/ffmpeg';
        }

        const server = new Hapi.Server();
        server.connection(serverOption);

        var route = function (server) {

            var plugins1 = [
                {register: Inert},
                {register: require('vision')},
                {register: Yar, options: options},
                {register: require('hapi-server-session')},
                {register: require('hapi-auth-cookie')},
                {register: require('hapi-auth-jwt')},
            ];

            server.register(plugins1, function (err) {
                if (err) {
                    throw err;
                }

                const cache = server.cache({segment: 'sessions', expiresIn: 1 * 3 * 60 * 60 * 1000});    // 3 * 24 * 60 * 60 * 1000
                server.app.cache = cache;

                // 인증 strategy 를 생성한다.
                server.auth.strategy('mySessionStrategy', 'cookie', {
                    password: 'ebojnklcavm94hnvoa89hdu9iho92j9hfonujdibnwiofnjcoxlkzd',   // 32자 이상
                    cookie: 'sid-fob',
                    redirectTo: '/',
                    isSecure: false
                });

                // jwt 구현.
                server.auth.strategy('jwt', 'jwt', {
                    key: globalConfig.JWT_SECRET,
                    validateFunc: require('./routes/authorization/jwt_validator.js').validate,
                    verifyOptions: { algorithms: [ 'HS256' ] }  // only allow HS256 algorithm
                });

                server.views({
                    engines: {ejs: require('ejs')},
                    relativeTo: __dirname,
                    path: './views'
                });

                server.route([
                    // Default 경로
                    {
                        method: 'GET', path: '/',
                        handler: function (request, reply) {
                            reply.redirect("/index");
                            //reply.view('index', {title : 'SkyNet'});
                        }
                    },

                    // Public 경로
                    {
                        method: 'GET', path: '/{path*}',
                        handler: {
                            directory: {
                                path: './public',
                                listing: false,
                                index: false
                            }
                        }
                    },
                ]);

                if (serverConfig.DEBUG_LEVEL > 1) {

                    if (cluster.isMaster) {
                        var makeCluster = function () {
                            os.cpus().forEach(function (cpu) {
                                cluster.fork();
                            });

                            functionCluster();
                        };

                        var functionCluster = function () {
                            for (var id in cluster.workers) {
                                cluster.workers[id].on('message', function (message) {
                                    if (message == 'RESTART') {
                                        for (var id in cluster.workers) {
                                            cluster.workers[id].send('SHUTDOWN');
                                        }

                                        for (var i = 0; i < ROUTES.length; i++) {
                                            delete require.cache[require.resolve(ROUTES[i])];
                                        }

                                        makeCluster();
                                    }
                                });

                                cluster.workers[id].on('exit', function (exitCode) {
                                    if (exitCode != 0) {
                                        cluster.fork();
                                    }
                                });
                            }
                        };

                        makeCluster();

                        runScheduler();

                    } else {
                        process.on('message', function (message) {
                            if (message === 'SHUTDOWN') {

                                console.log("Worker Dead!");

                                //안전하게 종료할 수 있는 로직
                                process.exit(0);
                            }
                        });

                        server.route({
                            method: 'POST',
                            path: '/dev/restart',
                            handler: function (req, reply) {
                                var tasks = [
                                    function (callback) {
                                        reply({result: true});
                                        callback();
                                    },
                                    function (callback) {
                                        process.send('RESTART');
                                        callback();
                                    }
                                ];

                                async.series(tasks, function (err, results) {

                                });

                            }
                        });

                        server.route({
                            method: 'POST',
                            path: '/dev/status',
                            handler: function (req, reply) {
                                reply({result: true, count: os.cpus().length});
                            }
                        });

                        for (var i = 0; i < ROUTES.length; i++) {
                            server.route(require(ROUTES[i]).routes);
                        }

                        server.start(function (err) {
                            if (err) {
                                throw err;
                            }
                            console.log(moment().format('YYYY-MM-DD hh:mm:ss'), "Server running on", server.info.uri);
                        });
                    }
                } else {
                    serverStart(server);

                    runScheduler();
                }
            });
        };

        route(server);
    }
});

const serverStart = function (server) {
    for (var i = 0; i < ROUTES.length; i++) {
        server.route(require(ROUTES[i]).routes);
    }

    // MsgFilterDao.getAll(function (filterList) {
    //     for (var k in filterList)
    //         filterData.push(filterList[k]);

    server.start(function (err) {
        if (err) {
            throw err;
        }
        console.log(moment().format('YYYY-MM-DD hh:mm:ss'), "Server running on", server.info.uri);

    });
    // });
};