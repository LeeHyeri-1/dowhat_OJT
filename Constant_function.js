
const axios = require('axios');
const Utils = require('./routes/util/utils');

exports.sendOrderToHotel = function (req, reply, method, requestBody, headers) {
    console.log(`${req.pre.connectData.WAS_HOST}${req.path}`)

    if (method === 'delete') {
        requestBody = {data: requestBody, headers: headers}
    }

    if(method === 'get'){

        axios[method](`${req.pre.connectData.WAS_HOST}${req.path}`, {
            params: requestBody,
            headers: headers
        })
            .then((response) => {
                console.log(`${req.pre.connectData.WAS_HOST}${req.path}`)
                reply(response.data);

            })
            .catch((err) => {
                console.log(err);
                Utils.response.simpleFalseReply(req.path, reply, {}, '100')
            })

    }else{

        axios[method](`${req.pre.connectData.WAS_HOST}${req.path}`, requestBody, {
            headers: headers
        })
            .then((response) => {
                console.log(`${req.pre.connectData.WAS_HOST}${req.path}`)
                reply(response.data);

            })
            .catch((err) => {
                console.log(err);
                Utils.response.simpleFalseReply(req.path, reply, {}, '100')
            })

    }

}


exports.sendOrderToHotelPTMS = function (req, reply, method, requestBody, headers) {
    console.log(`${req.pre.connectData.PTMS_HOST}${req.path}`)

    if (method === 'delete') {
        requestBody = {data: requestBody, headers: headers}
    }

    if(method === 'get'){

        axios[method](`${req.pre.connectData.PTMS_HOST}${req.path}`, {
            params: requestBody,
            headers: headers
        })
            .then((response) => {
                console.log(`${req.pre.connectData.PTMS_HOST}${req.path}`)
                reply(response.data);

            })
            .catch((err) => {
                console.log(err);
                Utils.response.simpleFalseReply(req.path, reply, {}, '100')
            })

    }else{

        axios[method](`${req.pre.connectData.PTMS_HOST}${req.path}`, requestBody, {
            headers: headers
        })
            .then((response) => {
                console.log(`${req.pre.connectData.PTMS_HOST}${req.path}`)
                reply(response.data);

            })
            .catch((err) => {
                console.log(err);
                Utils.response.simpleFalseReply(req.path, reply, {}, '100')
            })
    }
}

