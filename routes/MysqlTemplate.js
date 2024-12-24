/**
 * Created by bestist on 2016-06-13.
 */

const Mysql = require('mysql');
let DbConfig = require('../ServerConfig').dbConfig;
let moment = require('moment');

let DbConfig2 = {};
for (let k in DbConfig)
    DbConfig2[k] = DbConfig[k];

DbConfig2.multipleStatements = true;

let pool = Mysql.createPool(DbConfig2);
let pool2 = Mysql.createPool(DbConfig);

exports.get = function (query, next) {
    try {
        let strQuery = query.join(';');

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('getConn : ', query);
                //logger.error("poolConnect:"+err);
                try {
                    conn.release();
                } catch (e) {
                } //logger.error("poolConnect conn.release:"+e); }
                next();
                throw err;
            }
            conn.query(strQuery, function (err, rows) {
                if (err) {
                    console.log('queryErr : ', query);
                    try {
                        conn.release();
                    } catch (e) {
                    } //logger.error("poolClose:"+e); }
                    next();
                    throw err;
                } else {
                    try {
                        conn.release();
                    } catch (e) {
                    } //logger.error("poolClose:"+e); }
                    next(rows);
                }
            });
        });
    } catch (err) {
        console.log(query);
        next(err);
    }
};

exports.getSingle = function (query, next) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, conn) {
            if (err) {
                reject(err);
                return;
            }

            conn.query(query, function (err, recordSet) {
                if (err) {
                    console.log('queryErr : ', query);
                    try {
                        conn.release();
                    } catch (err) {
                    }
                    reject(err);
                }

                try {
                    conn.release();
                } catch (e) {
                }

                resolve(recordSet);
            });
        });
    })
};

exports.exec = function (query, params, next) {
    try {
        pool.getConnection(function (err, conn) {
            if (err) {
                try {
                    conn.release();
                } catch (e) {
                } //logger.error("poolConnect conn.release:"+e); }
                throw err;
            }
            conn.query(query, params, function (err, result) {
                if (err) {
                    try {
                        conn.release();
                    } catch (e) {
                    } //logger.error("poolClose:"+e); }
                    throw err;
                } else {
                    try {
                        conn.release();
                    } catch (e) {
                    } //logger.error("poolClose:"+e); }
                    next(result);
                }
            });
            //console.log(result);
        });
    } catch (e) {
        console.log('queryErr : ', query);
        console.log('errLog : ', err);
        throw err;
    }
};

// 트랜젝션 : 실패시 롤백, 성공시 커밋
exports.commit = function (query, next) {
    let strQuery = query;
    if (Array.isArray(query))
        strQuery = query.join(';');

    try {
        pool.getConnection(function (err, conn) {
            if (err) {
                console.log(err);
                try {
                    conn.release();
                } catch (e) {
                }
                next();
                throw err;
            }
            conn.beginTransaction(function (err) {
                if (err) {
                    console.log(err);
                    next();
                    throw err;
                }

                conn.query(strQuery, function (err, result) {
                    if (err) {
                        console.log(err);
                        conn.rollback(function () {
                            try {
                                conn.release();
                            } catch (e) {
                            }
                            next();
                            throw err;
                        });
                    }

                    if ((!Array.isArray(query) && Array.isArray(result[0])) || (Array.isArray(query) && query.length > 1 && query.length !== result.length)) {
                        conn.rollback(function () {
                            let nowTime = moment().format('YYYY-MM-DD hh:mm:ss');
                            console.log('Warning! Detecting query attack [', nowTime, '] -', strQuery);

                            try {
                                conn.release();
                            } catch (e) {
                            }
                            next();
                            throw err;
                        });

                    } else {
                        conn.commit(function (err) {
                            if (err) {
                                console.log(err);
                                conn.rollback(function () {
                                    try {
                                        conn.release();
                                    } catch (e) {
                                    }
                                    next();
                                    throw err;
                                });

                            } else {
                                try {
                                    conn.release();
                                } catch (e) {
                                }
                                next(result);
                            }
                        });
                    }
                });
            });
        });

    } catch (e) {
        console.log(query);
        next();
        throw e;

    }
};
