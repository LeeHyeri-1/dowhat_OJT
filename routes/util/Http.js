/**
 * Created by 유희찬 on 2018-06-21.
 */

const request = require('request');
const Log = require('../dao/util/LogErrorDao');

exports.sendPost = function (url, options, formData, next) {
    var sendData = {};
    sendData.url = url;
    for (var k in options)
        sendData[k] = options[k];
    sendData.formData = formData;

    request.post(sendData, function (err, response, body) {
        if (err) {
            Log.error('HTTP_POST', sendData);
            next(null);

        } else {
            next(body);
        }
    });
};

exports.sendGet = function (url, options, query, next) {
    var sendData = {};

    sendData.url = url + "?";
    for (var k in options)
        sendData[k] = options[k];

    for (var k in query)
        sendData.url += k + "=" + query[k] + "&";


    request.get(sendData, function (err, response, body) {
        if (err) {
            Log.error('HTTP_GET', sendData);
            next(null);

        } else {
            next(body);
        }
    });
};