const path = require('path');

module.exports = appInfo => ({
  keys: 'mumu', // 用于 cookie 的加解密，上线后就不要改了。
  logger: {
    dir: path.join(__dirname, '../logs/mumu-server'),
  },
  static: {
    dir: path.join(appInfo.baseDir, 'static/dist'),
    prefix: '/static/'
  },
  // cluster: {
  //   https: {
  //     key: '/www/server/panel/vhost/cert/api.resonance.fun/privkey.pem',
  //     cert: '/www/server/panel/vhost/cert/api.resonance.fun/fullchain.pem',
  //   },
  // }
});
