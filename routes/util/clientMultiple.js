/**
 * Created by 유희찬 on 2018-12-14.
 */

const cluster = require('cluster');

let capacity = 200;

if (cluster.isMaster) {
    console.log('Client Online! (', capacity, ')');

    let connList = [];
    let msgList = [];

    for (let i = 0; i < capacity; i++) {
        let worker = cluster.fork();

        worker.on('message', function (message) {
            let msg = message.split('///');

            if(msg[0] === 'CONNECT') {
                connList.push(msg[2]);
                connList.sort((a, b) => {return a - b;});

                if(connList.length === capacity)
                    console.log('CONNECT', connList[0], '/', connList[capacity - 1]);

            } else if(msg[0] === 'MESSAGE') {
                if(!msgList[msg[1]])
                    msgList[msg[1]] = [];

                msgList[msg[1]].push(msg[2]);
                msgList[msg[1]].sort((a, b) => {return a - b;});

                if(msgList[msg[1]].length === capacity) {
                    console.log(msg[1], msgList[msg[1]][0], '/', msgList[msg[1]][capacity - 1]);

                    msgList[msg[1]] = [];
                }

            }
        });

    }

} else {

    var moment = require('moment');

    var mqtt = require('mqtt');
    var client = mqtt.connect('mqtt://192.168.0.8:1883');

    client.on('connect', function () {
        // console.log('connect!', moment().format('YYYY-MM-DD HH:mm:SS'));
        process.send('CONNECT///CONNECT///' + moment().format('YYYY-MM-DD HH:mm:ss') + ' / ' + moment().format('X'));
        // client.publish('app/execute', JSON.stringify(opt));
    });

// client.subscribe('yjel/gw/ep17140004/type/+/dev/+/evt/execute.res/fmt/json');
// client.subscribe('yjel/gw/ep17140004/type/+/grp/+/evt/execute.res/fmt/json');
    client.subscribe('yjel/gw/+/type/+/dev/+/evt/+/fmt/json');
    client.subscribe('yjel/gw/+/type/+/grp/+/evt/+/fmt/json');

    client.on('message', function (topic, message) {
        // message is Buffer
        // console.log('topic :', topic, moment().format('YYYY-MM-DD HH:mm:SS'));
        // console.log('payload :', message.toString());
        // client.end()
        process.send('MESSAGE///' + topic + '///' + moment().format('YYYY-MM-DD HH:mm:ss') + ' / ' + moment().format('X'));
    });

}