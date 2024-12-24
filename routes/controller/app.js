const Hapi = require('@hapi/hapi');
const router = require('./run').routes;
const MysqlTemplate = require('../MysqlTemplate');
const {dbConfig} = require("../../ServerConfig");
const mysql = require("mysql");

const pool = mysql.createPool({
    host : dbConfig.host,
    user : dbConfig.user,
    password : dbConfig.password,
    database : dbConfig.database,
    port : dbConfig.port,
    charset: dbConfig.charset,
})

const init = async () => {

    const server = Hapi.server({
        port: dbConfig.port || 3000, // HTTP 서버 포트 (기본값: 3000)
        host: 'localhost',          // 서버 호스트
        routes: {
            cors: {
                origin: ['*'], // 모든 출처 허용
            },
        },
    });

    // 데이터베이스 연결 테스트
    try {
        await MysqlTemplate.getSingle("SELECT 1 as test");
        console.log('Database connection successful');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }

    // 라우트 등록
    server.route(router);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// 서버 종료 시 처리
process.on('SIGINT', async () => {
    try {
        // MysqlTemplate의 pool들이 자동으로 정리됨
        console.log('Server shutting down...');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

init();