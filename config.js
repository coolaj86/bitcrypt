'use strict';
// All of these keys are valid working keys registered to
// "Hogwarts Test Application" at http://local.ldsconnect.org,
// which points to 127.0.0.1 for your testing pleasure.
//
// NOTE: grunt automatically serves pages from localhost:9003 which WILL NOT WORK
//
// YOU MUST point your browser to local.ldsconnect.org:9003 or YOU WILL HATE YOUR LIFE
// and spend hours debugging a problem that doesn't exist
// (I've cumulatively wasted nearly a full day of my life on such imagined problems)
//
// TODO need a req.href() or something
/*
    var host = (req.headers.host||'').replace(/^www\./, '')
      , hostname = host.split(':')[0]
      , protocol = 'http' + (req.connection.encrypted ? 's' : '') + '://'
      , href = protocol + host + req.url
*/
var CONFIG = {
  protocol: 'http'
, hostname: 'local.ldsconnect.org'
, port: 4004
, get host() {
    if (
        'http' === this.protocol && '80' === this.port.toString()
      ||'https' === this.protocol && '443' === this.port.toString()
    ) {
      return this.hostname;
    }

    return this.hostname + ':' + this.port;
  }
, get href() {
    return this.protocol + '://' + this.host;
  }
, apiPrefix: '/api'
, bitcrypt: {
    accessToken: "pandabearwarriorlove"
  , keySecret: "lovethepurpleundeniably"
  }
};
module.exports = CONFIG;
