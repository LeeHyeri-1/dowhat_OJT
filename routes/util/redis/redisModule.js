/**
 * Created by anbaksa on 2016-06-18.
 */

const ServerConfig = require('../../../ServerConfig');
var globalConfig = ServerConfig.globalConfig;

exports.register = function(server, options, next) {
    server.register({
        register: require('hapi-redis'),
        options: {
            connection: {
                "host": globalConfig.REDIS_HOST,
                "port": globalConfig.REDIS_PORT,
                "opts": JSON.parse(globalConfig.REDIS_OPTS)
            }
        }
    }, function () {

    });

    server.route( {
        "method"  : "GET",
        "path"    : "/stats",
        "handler" : usersHandler
    });

    next();
};



function usersHandler(request, reply) {
    var redisClient2 = request.server.plugins['config'];
    var redisClient = request.server.plugins['hapi-redis'].client;

    // Do something with the redis client
    // reply(result);
};



/**
 * Plugin attributes...
 * we have here the Name and the Version of the plugin
 */
exports.register.attributes = {
    name : 'redisManagement',
    version : '1.0.0'
};
