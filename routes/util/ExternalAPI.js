/**
 * Created by 유희찬 on 2018-02-21.
 */

const request = require('request');

const ServerConfig = require('../../ServerConfig');
const globalConfig = ServerConfig.globalConfig;

var NodeGeocoder = require('node-geocoder');


exports.naverAuthCheckRequest = function (accessToken, next) {
    var options = {
        url: "https://openapi.naver.com/v1/nid/me",
        headers: {'Authorization': 'Bearer ' + accessToken}
    };

    request.get(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            next(false);

        } else {
            next(true);

        }
    });
};

exports.kakaoAuthCheckRequest = function (accessToken, next) {
    var options = {
        url: "https://kapi.kakao.com/v2/user/me",
        headers: {'Authorization': 'Bearer ' + accessToken}
    };

    request.get(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            next(false);

        } else {
            next(true);

        }
    });
};

exports.googleAuthCheckRequest = function (accessToken, next) {
    var options = {
        url: `https://www.googleapis.com/oauth2/v2/userinfo?access_token=` + encodeURIComponent(accessToken),
        // headers: {'Authorization': 'Bearer ' + accessToken}
    };

    request.get(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            next(false);

        } else {
            // console.log(body)
            next(true);

        }
    });
};


var options = {
    provider: 'google',

    httpAdapter: 'https',
    apiKey: globalConfig.APIKEY_GOOGLE_GEOCODER,
    formatter: null,

    language: 'ko-kr'
};

var geocoder = NodeGeocoder(options);

exports.geoReverse = function (lat, lng, next) {
    geocoder.reverse({lat: lat, lon: lng}, function (err, res) {
        var addr = res[0].formattedAddress.split(' '); // 0 : 국가, 1:시도, 2:시군구, 3:읍면동

        next(addr);
    });
};

exports.geoCode = function (address, next) {
    geocoder.geocode(address, function (err, res) {
        if (err) {
            console.log("geocoder.geocode : " + err);
            stopCode = 1;
            next(null);
        } else {
            if (res == undefined) {
                console.log("geocoder.geocode : res is undefined");
                next(null);
            } else {
                if (res.length > 0) {
                    var oldAdr = res[0].formattedAddress;
                    var newAdr = '';
                    oldAdr = oldAdr.split(' ');
                    if (oldAdr[0] == '대한민국') {
                        for (var i = 1; i < oldAdr.length; i++) {
                            newAdr += oldAdr[i];

                            if (i + 1 < oldAdr.length)
                                newAdr += ' ';
                        }
                    } else if (oldAdr[oldAdr.length - 1] == '대한민국') {
                        for (var i = oldAdr.length - 2; i >= 0; i--) {
                            newAdr += oldAdr[i];

                            if (i - 1 >= 0)
                                newAdr += ' ';
                        }
                    } else {
                        newAdr = res[0].formattedAddress;
                    }

                    var result = {
                        result: 1,
                        countryCode: res[0].countryCode,
                        address: newAdr,
                        latitude: res[0].latitude,
                        longitude: res[0].longitude
                    };
                    next(result);
                } else {
                    next({result: 0});
                }
            }
        }
    });
};
