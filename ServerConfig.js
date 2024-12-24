/**
 * Created by bestist on 2016-06-13.
 */

exports.serverIdConfig = {
    WAS: {
        serverId: '1',
    }
};

// exports.elasticRedis = "172.31.11.175"; // 아마존 내부 ip
exports.elasticRedis = "52.79.77.142"; // 외부 접속 ip

exports.globalConfig = {
    JWT_ALGORITHM: 'HS256', JWT_EXPIRE: "10d",
    MQTT_HOST: 'localhost',
    REDIS_HOST: '218.54.201.175', //'localhost',
    REDIS_PORT: 7021,
    MQTT_DEVICE_PORT: 16214,
    MQTT_PTMS_PORT: 16215,
    MQTT_S2S_HOST: 'localhost',
    MQTT_S2S_PORT: 17217,
    MONGO_HOST: 'mongodb://192.168.0.56:27017',
    PRICE_ORDER_LIST: ['BASIC', 'IMMEDIATE', 'RESERVE', 'PURCHASE', 'ROOMSERVICE'],
    EXCEPT_ORDER_ON_APP: ['MORNING_CALL', 'DND'],
    AES_SECRET: '+hZvM0jGM6GgSugwGYKWpr/s1AYBr/JqNZkKs+vzJzAervY+z2uTcm2hdM9fCYSQ8NXprK019fsibAL+4Pe9YaJyJtxdyBLo26XZSg1w8/GqbvR9R4QEdbeWcIciaFV2W3ddAiK3NW391MNQICHVVsWR7QLLM3WW4oKg/cjgWXs=',
    DB_TIME_EXPIRE: 10000
};
exports.serverConfig = {};

exports.dbConfig = {
    host: '218.54.201.175',
    port: '7020',
    user: 'nomad',
    password: '[nomad8083]',
    database: 'test_db_HL',
    dateStrings: true,
    charset: 'utf8mb4_general_ci'
};