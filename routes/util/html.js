/**
 * Created by Administrator on 2017-01-11.
 */
var querystring = require('querystring');
var http = require('http');
const https = require('https');


exports.send = {
    getImpToken : function(url, port, path, imp_key, imp_secret, next) {

        var post_data = querystring.stringify({
            imp_key: imp_key,
            imp_secret: imp_secret
        });

        var post_options  = {
            host: url,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('getImpToken Response: ' + chunk);
                next(chunk);
            });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();

    },

    getCertifications : function(urlPath, next) {
        https.get(urlPath, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                next(data);
                console.log(JSON.parse(data).explanation);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
        /*
         var post_options  = {
         host: url,
         port: port,
         path: path,
         method: 'GET',
         headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Content-Length': Buffer.byteLength(post_data)
         }
         };

         // Set up the request
         var post_req = http.request(post_options, function(res) {
         res.setEncoding('utf8');
         res.on('data', function (chunk) {
         console.log('getImpToken Response: ' + chunk);
         next(chunk);
         });
         });

         // post the data
         post_req.write(post_data);
         post_req.end();*/

    },
    eventChat : function(url, port, path, userId, event_id, msg_id, sender, contents_type, message, attatchment, option1, option2, option3, msg_type, receiver, sendPush) {

        var post_data = querystring.stringify({
            userId: userId,       // 요청 ID (미사용)
            event_id: event_id,    // 교회 churchCode
            msg_id: msg_id,        // 메시지 고유 seq
            sender: sender,       // 전송자 ID
            contents_type: contents_type,  // 0:평문, 1:이미지
            message: message,      // 내용
            attatchment: attatchment,
            option1: option1,
            option2: option2,
            option3: option3,
            msg_type: msg_type,   // 0:알림전체 1:알림지정, 2:공지전체, 3:공지지정, 4:일반알림 지정
            receiver: receiver,   // 수신자 (쉼표로 구분)
            sendPush: sendPush    // 1:푸시 발송, 0:미발송
        });

        var post_options  = {
            host: url,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();

    },

    eventChatGet : function(url, port, path, userId, event_id, msg_id, sender, contents_type, message, attatchment, option1, option2, option3) {
        var param = '';
        param += '?userId='+ userId;
        param += '&event_id='+ event_id;
        param += '&msg_id='+ msg_id;
        param += '&sender='+ sender;
        param += '&contents_type='+ contents_type;
        param += '&message='+ message;
        param += '&attatchment='+ attatchment;
        param += '&option1='+ option1;
        param += '&option2='+ option2;
        param += '&option3='+ option3;

        param = encodeURI(param);

        var options = {
            host: url,
            port: port,
            path: path + param
        };

        var req = http.get(options, function(res) {
            //console.log('util.sendHtml STATUS: ' + res.statusCode);
            //console.log('util.sendHtml HEADERS: ' + JSON.stringify(res.headers));

            var bodyChunks = [];
            res.on('data', function(chunk) {
                bodyChunks.push(chunk);
            }).on('end', function() {
                var body = Buffer.concat(bodyChunks);
                var encodedString = String.fromCharCode.apply(null, body);
                var decodedString = decodeURIComponent(escape(encodedString));
                //console.log('util.sendHtml BODY: ' + encodedString);
                //next({'result':true, 'body':encodedString});
            })
        });

        req.on('error', function(e) {
            console.log('util.sendHtml ERROR: ' + e.message);
        });

    },


};