'use strict';

var connect = require('connect')
  , path = require('path')
  , app = connect()
  , config = require('./config')
  ;

function init(Db) {
  var serveStatic = require('serve-static')
    ;

  config.apiPrefix = config.apiPrefix || '/api';

  if (!connect.router) {
    connect.router = require('connect_router');
  }

  app.api = function (path, fn) {
    if (!fn) {
      fn = path;
      path = "";
    }

    app.use(config.apiPrefix + path, fn);
    return app;
  };

  app
    //.use(require('morgan')())
    .use(require('errorhandler')({ dumpExceptions: true, showStack: true }))
    .use(require('./lib/connect-shims/query')())
    .use(require('body-parser').json({
      strict: true // only objects and arrays
    , inflate: true
    , limit: 100 * 1024
    , reviver: undefined
    , type: 'json'
    , verify: undefined
    }))
    .use(require('body-parser').urlencoded({
      extended: true
    , inflate: true
    , limit: 100 * 1024
    , type: 'urlencoded'
    , verify: undefined
    }))
    .use(require('compression')())
    .use(require('./lib/connect-shims/send'))
    //.use(express.router)
    ;

  app
    .use(connect.router(require('./lib/bitcrypt').create(app, config, Db).route))
    ;

  //
  // Generic Template API
  //
  app
    //.use(require('connect-jade')({ root: __dirname + "/views", debug: true }))
    .use(serveStatic(path.join(__dirname, 'priv', 'public')))
    //.use(serveStatic(path.join(__dirname, 'dist')))
    //.use(serveStatic(path.join(__dirname, '.tmp', 'concat')))
    .use(serveStatic(path.join(__dirname, 'app')))
    .use(serveStatic(path.join(__dirname, '.tmp')))
    ;
}

module.exports = app;
module.exports.create = function () {
  config.knexInst = require('./lib/knex-connector').create(config.knex);
  require('./lib/bookshelf-models').create(config.knexInst).then(init);
};
module.exports.create();
