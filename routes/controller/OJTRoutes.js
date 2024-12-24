/**
 * Created by kyd on 2020-02-03.
 */

const ServerConfig = require('../../ServerConfig');
let serverConfig = ServerConfig.serverConfig;

const Utils = require('../util/utils');
const NsLog = require('../util/NSLog');


// const TestDao = require('../../dao/hotel/TestDao');
const CommonDao = require('../dao/CommonDao');
const BuilderDao = require('../dao/BuilderDao');

exports.routes = [


    // 작업자 : 000
    // 작업일자 : 0000년 00월 00일
    // 작업내용 : 작업내용을 서술해주세요.
    {
        method: 'POST', // GET(파일 다운로드), POST
        path: '/api/address/gugun',
        config: {
            handler: async function (req, reply) {

                let needArr = ["postCode"];
                let strArr = [];
                let int0Arr = [];
                let int1Arr = [];
                let data = Utils.utils.check(req, needArr, strArr, int0Arr, int1Arr);


                if (data.check_result == false) {
                    if (serverConfig.DEBUG_MSG === '1')
                        Utils.response.simpleFalseReply(req.path, reply, {message: data.check_value + '의 값이 없습니다.'}, '00');
                    else
                        Utils.response.simpleFalseReply(req.path, reply, {}, '00');
                    return;
                }


                try {

                    let addressData = await CommonDao.getOneAsync(BuilderDao.buildSelect("t_nf_addresss", {
                        post_code: data.postCode
                    }));


                    if (!addressData) {
                        Utils.response.simpleFalseReply(req.path, reply, {}, "01");
                        return;
                    }

                    Utils.response.simpleTrueReply(req.path, reply, {addressData: addressData}, "01");


                } catch (err) {
                    NsLog.e(req.path, err);
                    Utils.response.simpleFalseReply(req.path, reply, {}, "99");
                }

            }
        }
    },


    // 작업자 : 000
    // 작업일자 : 0000년 00월 00일
    // 작업내용 : 작업내용을 서술해주세요.
    {
        method: 'POST',
        path: '/api/address/sido',
        config: {
            handler: async function (req, reply) {

                let needArr = ["sidoCode"];
                let strArr = [];
                let int0Arr = [];
                let int1Arr = [];
                let data = Utils.utils.check(req, needArr, strArr, int0Arr, int1Arr);


                if (data.check_result == false) {
                    if (serverConfig.DEBUG_MSG === '1')
                        Utils.response.simpleFalseReply(req.path, reply, {message: data.check_value + '의 값이 없습니다.'}, '00');
                    else
                        Utils.response.simpleFalseReply(req.path, reply, {}, '00');
                    return;
                }

                try {

                    let addressList = await CommonDao.getSingleAsync(BuilderDao.buildSelect("t_nf_address", {
                        sido_code: data.sidoCode
                    }));

                    if (!addressList) {
                        Utils.response.simpleFalseReply(req.path, reply, {}, "01");
                        return;
                    }

                    Utils.response.simpleTrueReply(req.path, reply, {addressList: addressList}, "01");

                } catch (err) {
                    NsLog.e(req.path, err);
                    Utils.response.simpleFalseReply(req.path, reply, {}, "99");
                }

            }
        }
    },


    // 작업자 : 000
    // 작업일자 : 0000년 00월 00일
    // 작업내용 : 작업내용을 서술해주세요.
    {
        method: 'POST',
        path: '/api/address/update',
        config: {
            handler: async function (req, reply) {

                let needArr = ["postCode"];
                let strArr = [];
                let int0Arr = [];
                let int1Arr = [];
                let data = Utils.utils.check(req, needArr, strArr, int0Arr, int1Arr);


                if (data.check_result == false) {
                    if (serverConfig.DEBUG_MSG === '1')
                        Utils.response.simpleFalseReply(req.path, reply, {message: data.check_value + '의 값이 없습니다.'}, '00');
                    else
                        Utils.response.simpleFalseReply(req.path, reply, {}, '00');
                    return;
                }

                try {

                    let addressUdtResult = await CommonDao.updateAsync(BuilderDao.buildUpdate("t_nf_address", {
                        post_code: data.postCode
                    }, {
                        post_code: data.postCode
                    }));

                    if (!addressUdtResult) {
                        Utils.response.simpleFalseReply(req.path, reply, {}, "01");
                        return;
                    }

                    Utils.response.simpleTrueReply(req.path, reply, {}, "01");

                } catch (err) {
                    NsLog.e(req.path, err);
                    Utils.response.simpleFalseReply(req.path, reply, {}, "99");
                }

            }
        }
    },


    // 작업자 : 000
    // 작업일자 : 0000년 00월 00일
    // 작업내용 : 작업내용을 서술해주세요.
    {
        method: 'POST',
        path: '/api/address/delete',
        config: {
            handler: async function (req, reply) {

                let needArr = ["sidoCode"];
                let strArr = [];
                let int0Arr = [];
                let int1Arr = [];
                let data = Utils.utils.check(req, needArr, strArr, int0Arr, int1Arr);


                if (data.check_result == false) {
                    if (serverConfig.DEBUG_MSG === '1')
                        Utils.response.simpleFalseReply(req.path, reply, {message: data.check_value + '의 값이 없습니다.'}, '00');
                    else
                        Utils.response.simpleFalseReply(req.path, reply, {}, '00');
                    return;
                }

                try {

                    let addressDelResult = await CommonDao.deleteAsync(BuilderDao.buildDelete("t_nf_address", {
                        post_code: data.postCode
                    }));

                    if (!addressDelResult) {
                        Utils.response.simpleFalseReply(req.path, reply, {}, "01");
                        return;
                    }

                    Utils.response.simpleTrueReply(req.path, reply, {}, "01");

                } catch (err) {
                    NsLog.e(req.path, err);
                    Utils.response.simpleFalseReply(req.path, reply, {}, "99");
                }

            }
        }
    },

];


