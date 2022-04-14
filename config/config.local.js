module.exports = {
  sequelize: {
    dialect: 'mysql',
    host: '152.32.211.215',
    port: 3306,
    database: 'mumu',
    username: 'mumu',
    password: 'W3LWJXyMEKCNzHTy',
    logging: false
  },
  cors: {
    // origin:'*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  },
  security: {
    csrf: {
      enable: false,
      ignoreJSON: true
    },
    domainWhiteList: [
      'http://localhost:8080',
      // 'http://aaa.mumu-h5.cn:8080'
    ]
  }
};
