'use strict';

// Goal: A mini PCI compliant datastore
// Don't leak data through error messages
// Encrypt data as soon as possible
// Decrypt as late as possible
// Don't store encryption key on the server

function logSql(statement, values) {
  console.log(statement);
  console.log(values);
}

module.exports.create = function (app, config, Db) {
  // The key is only stored in memory
  // never at any time should it be stored on disk
  var crypto = require('crypto')
    , UUID = require('node-uuid')
    , ID_KEY
    , VALUE_KEY
    , ENCODING = 'base64' // 'hex'
    , cipherType = 'aes-256-cbc' // 'des-ede3-cbc'
    , bitAccessToken = config.bitcrypt.accessToken
    , bitKeySecret = config.bitcrypt.keySecret
    ;

  function cipherHelper(KEY, data) {
    var cipherer = crypto.createCipher(cipherType, KEY)
      , crypted
      ;

    try {
      crypted = cipherer.update(JSON.stringify(data), 'utf8', ENCODING) + cipherer.final(ENCODING);
    } catch(e) {
      //console.error('[e] cipher');
      //console.error(e);
      return null;
    }

    return crypted;
  }
  function cipherId(id) {
    return cipherHelper(ID_KEY, id).replace(/\+/g, '-').replace(/_/, '/');
  }
  function cipherValue(val) {
    return cipherHelper(VALUE_KEY, val);
  }

  function decipherHelper(KEY, data) {
    var decipherer = crypto.createDecipher(cipherType, KEY)
      , decrypted
      ;

    try {
      decrypted  = JSON.parse(decipherer.update(data, ENCODING, 'utf8') + decipherer.final('utf8'));
    } catch(e) {
      //console.error('[e] decipher');
      //console.error(e);
      return null;
    }

    return decrypted;
  }
  function decipherId(id) {
    return decipherHelper(ID_KEY, id.replace(/-/g, '+').replace(/\//, '_'));
  }
  function decipherValue(data) {
    return decipherHelper(VALUE_KEY, data);
  }

  // TODO text admin on startup (and have the phone automatically email over tls back ??)
  app.use('/bitcrypt', function (req, res, next) {
    if (bitAccessToken !== req.headers.authorization.replace(/^\s*Bearer\s+/i, '')) {
      res.statusCode = 400;
      res.send({ error: { message: "Unauthorized" } });
      return;
    }

    if (!(ID_KEY && VALUE_KEY) && !(req.body.secret && req.body.keys && req.body.keys.length)) {
      res.statusCode = 400;
      res.send({ error: { message: "The server was shut down, but has not been initialized" } });
      return;
    }

    next();
  });

  function route(rest) {
    function reKey(req, res) {
      if (bitKeySecret !== req.body.secret) {
        res.statusCode = 400;
        res.send({ error: { message: "Unauthorized" } });
        return;
      }

      if (!req.body.keys || 2 !== req.body.keys.length) {
        res.statusCode = 400;
        res.send({ error: { message: "You didn't specify an array of 2 keys" } });
        return;
      }

      if (ID_KEY && req.body.keys[0] && ID_KEY !== req.body.keys[0]) {
        res.statusCode = 400;
        res.send({ error: { message: "You can't change the key without first deleting the database" } });
        return;
      }

      if (VALUE_KEY && req.body.keys[1] && VALUE_KEY !== req.body.keys[1]) {
        res.statusCode = 400;
        res.send({ error: { message: "You can't change the key without first deleting the database" } });
        return;
      }

      if (!ID_KEY) {
        ID_KEY = req.body.keys[0];
      }

      if (!VALUE_KEY) {
        VALUE_KEY = req.body.keys[1];
      }

      res.send({ success: true });
    }

    function getBit(req, res) {
      var id = req.params.id
        ;

      if (!id) {
        res.statusCode = 400;
        res.send({ error: { message: "get: no id given" } });
        return;
      }

      id = decipherId(id);
      if (!id) {
        res.statusCode = 400;
        res.send({ error: { message: "get: bad id or server not initialized" } });
        return;
      }

      Db.Data.forge({ uuid: id }).fetch().then(function (obj) {
        if (!obj) {
          res.statusCode = 404;
          res.send({ error: { message: "get: datum not found" } });
          return;
        }

        var decrypted = decipherValue(obj.get('value'))
          ;

        if (!decrypted) {
          res.statusCode = 500;
          res.send({ error: { message: "get: server not initialized or data corrupt" } });
          return;
        }

        res.send({ success: true, value: decrypted });
      }, function (/*err*/) {
        //console.error(err);
        res.statusCode = 500;
        res.send({ error: { message: "get: transaction error" } });
        return;
      });
    }

    function newBit(req, res) {
      var data = req.body
        , id
        , crypted
        ;

      if (!data || !data.value) {
        res.statusCode = 404;
        res.send({ error: { message: "new: value not found" } });
        return;
      }
       
      crypted = cipherValue(data.value);
      if (!crypted) {
        res.statusCode = 500;
        res.send({ error: { message: "new: server not initialized or data not cryptable" } });
        return;
      }

      id = UUID.v4();
      Db.Data.forge({ uuid: id })
        //.on('query', logSql)
        .save({ uuid: id, value: crypted }, { method: 'insert' })
        .then(function (data) {
          if (!data) {
            res.statusCode = 500;
            res.send({ error: { message: "new: server not initialized or db corrupt" } });
            return;
          }

          res.send({ success: true, id: cipherId(id) });
        }, function (/*err*/) {
          //console.error(err);
          res.statusCode = 500;
          res.send({ error: { message: "new: server not initialized or db connection dropped" } });
          return;
        });
    }

    function delBit(req, res) {
      var id = req.params.id
        ;

      if (!id) {
        res.statusCode = 400;
        res.send({ error: { message: "del: no id given" } });
        return;
      }

      id = decipherId(id);
      if (!id) {
        res.statusCode = 400;
        res.send({ error: { message: "del: bad id or server not initialized" } });
        return;
      }

      Db.Data.forge({ uuid: id }).destroy().then(function (/*data*/) {
        // TODO send back data
        res.send({ success: true });
      }, function (/*err*/) {
        res.statusCode = 500;
        res.send({ error: { message: "del: server not initialized or db parse error" } });
        return;
      });
    }

    rest.post('/bitcrypt/key', reKey);
    rest.post('/bitcrypt', newBit);
    rest.get('/bitcrypt/:id', getBit);
    rest.delete('/bitcrypt/:id', delBit);
  }

  return {
    route: route
  };
};
