'use strict';

const Boom = require('boom');
const Hoek = require('hoek');

// Declare Internals

const internals = {};


exports.register = function (server, options, next) {

    server.auth.scheme('bearer-access-token', internals.implementation);
    next();
};
/*
exports.register.attributes = {
    pkg: require('../package.json')
};
*/
exports.register.attributes = {

    name : 'AuthBearerModule',
    version : '1.0.0'
};
internals.implementation = (server, options) => {

    Hoek.assert(options, 'Missing bearer auth strategy options');
    Hoek.assert(typeof options.validateFunc === 'function', 'options.validateFunc must be a valid function in bearer scheme');

    options.accessTokenName = options.accessTokenName || 'access_token';
    options.allowQueryToken = options.allowQueryToken === false ? false : true;
    options.allowMultipleHeaders = options.allowMultipleHeaders === true ? true : false;
    options.tokenType = options.tokenType || 'Bearer';

    const settings = Hoek.clone(options);

    settings.headerRegExp = new RegExp(options.tokenType + '\\s+([^;$]+)','i');

    const scheme = {
        authenticate: (request, reply) => {

            const req = request.raw.req;
            let authorization = req.headers.authorization;

            if (settings.allowQueryToken
                && !authorization
                && request.query[settings.accessTokenName] ) {
                authorization = options.tokenType + ' ' + request.query[settings.accessTokenName];
                delete request.query[settings.accessTokenName];
            }

            if (!authorization) {
                return reply({"message":"유저 정보가 잘못 되었습니다.", "constant":"AUTH_MISSING_AUTENTICATION", "code":"a401"});//Boom.unauthorized(null, options.tokenType));
            }

            if (settings.allowMultipleHeaders) {
                const headers = authorization.match(settings.headerRegExp);
                if (headers !== null) {
                    authorization = headers[0];
                }
            }

            const parts = authorization.split(/\s+/);

            if (parts[0].toLowerCase() !== options.tokenType.toLowerCase()) {
                return reply({"message":"Missing authentication", "constant":"AUTH_MISSING_AUTENTICATION", "code":"a401"});//Boom.unauthorized(null, options.tokenType));
            }

            const token = parts[1];

            settings.validateFunc.call(request, token, (err, isValid, credentials, artifacts, isExpired) => {

                if (err) {
                    return reply({"message":"Bad token", "constant":"AUTH_BAD_TOCKEN", "code":"a402"}).code(403);;//
                    //return reply(err, { credentials, log: { tags: ['auth', 'bearer'], data: err } });
                }

                if(isExpired) {
                    return reply({"message":"expire token", "constant":"AUTH_EXPIRED_TOKEN", "code":"a403"}).code(403);;
                }

                if (!isValid) {
                    return reply({"message":"Bad token", "constant":"AUTH_BAD_TOCKEN", "code":"a402"}).code(403);;//Boom.unauthorized('Bad token', options.tokenType), { credentials, artifacts });
                }

                if (!credentials
                    || typeof credentials !== 'object') {
                    return reply({"message":"Bad token", "constant":"AUTH_BAD_TOCKEN", "code":"a402"}).code(403);;//Boom.badImplementation('Bad token string received for Bearer auth validation'), { log: { tags: 'token' } });
                }

                return reply.continue({ credentials, artifacts });
            });
        }
    };

    return scheme;
};
