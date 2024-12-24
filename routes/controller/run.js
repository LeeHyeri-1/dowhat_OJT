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


    // 작업자 : 이혜리
    // 작업일자 : 2024년 12월 24일
    // 작업내용 : BuilderDao와 CommonDao를 사용해서 t_name 테이블에 값 넣기 구현
    {
        method: 'POST',
        path: '/api/insertInto/t_name',
        config: {
            handler: async function (req, reply) {

                let needArr = ["code","name"];
                let strArr = [];
                let int0Arr = [];
                let int1Arr = [];
                let data = Utils.utils.check(req, needArr, strArr, int0Arr, int1Arr);


                if (data.check_result == false) {
                    if (serverConfig.DEBUG_MSG === '1')
                        Utils.response.simpleFalseReply(req.path, reply, {message: data.check_value + '의 값이 없습니다.'}, '00'); //파라미더 누락
                    else
                        Utils.response.simpleFalseReply(req.path, reply, {}, '99'); // 서버 내부 에러
                    return;
                }


                try {
                    
                    // 기존 데이터 존재 여부 확인
                    let existingData = await CommonDao.getOneAsync(
                        BuilderDao.buildSelect("t_name", {
                            code : data.code
                        })
                    );

                    if (existingData) {
                        Utils.response.simpleFalseReply(req.path, reply,
                            {message: '이미 존재하는 코드입니다.'},"02"); //중복데이터 오류
                    }

                    // t_name 테이블에 데이터 삽입
                    const insertQuery = BuilderDao.buildInsert("t_name", {
                        code: data.code,
                        name: data.name
                    });

                    const insertResult = await CommonDao.insertAsync(insertQuery);

                    if (insertResult) {
                        Utils.response.simpleTrueReply(req.path, reply,
                            {message: '데이터가 성공적으로 저장되었습니다.'}, "01"); //데이터 삽입 성공
                    } else {
                        Utils.response.simpleFalseReply(req.path, reply,
                            {message: '데이터 저장에 실패했습니다.'}, "03"); //데이터 삽입 실패
                    }


                } catch (err) {
                    NsLog.e(req.path, err);
                    Utils.response.simpleFalseReply(req.path, reply, {}, "99"); //서버 내부 에러
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

