encrypted-bits-as-a-service
===

The idea here is that you can store some bit of sensitive information
on a separate, isolated service so that it would require two compromised
servers and 2-factors of authentication to decrypt it.

The service-supplied IDs are encrypted separately from the data,
so even if both systems and one of the keys comprimised,
it would be difficult to reassociate the data.

NOTE: You should NOT store keys on either server.

This is a server that must be initialized by a remote source
with encryption keys.

API
===

For all of the examples consider

```
HOST="example.com"
ACCESS_TOKEN="the value of config.js.bitcrypt.accessToken, prevents access"
KEY_SECRET="the value of config.js.bitcrypt.keySecret, prevents key update"
KEY0="the key which will encrypt the ids"
KEY1="the key which will encrypt the data"
```

POST /bitcrypt/keys
---

When the server starts it is unable to store or retrieve data because it doesn't
have any keys.

You may initialize the keys one-at-a-time from two separate keyholders.

Just initializing the data key

```bash
curl http://${HOST}/bitcrypt/key \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "keys": [null, "'${KEY_1}'"], "secret": "'${KEY_SECRET}'" }'
```

Just initializing the id key

```bash
curl http://${HOST}/bitcrypt/key \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "keys": ["'${KEY_0}'", null], "secret": "'${KEY_SECRET}'" }'
```


POST /bitcrypt
---

Let's say we want to store some data:

```bash
curl http://localhost:${PORT}/bitcrypt \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "value": { "foo": "bar" } }'
```

`value` will be `JSON.stringify()`d and encrypted.

```javascript
{ "success": true
, "id": "some encrypted id comes back to you"
}
```

GET /bitcrypt/:id
---

```bash
curl http://${HOST}/bitcrypt/${ENCRYPTED_ID} \
  -X GET \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

the original value you supplied comes back to you

```javascript
{ "success": true
, "value": { "foo": "bar" }
}
```


DELETE /bitcrypt/:id
---

```bash
curl http://${HOST}/bitcrypt/${ENCRYPTED_ID} \
  -X DELETE
```

{ "success": true
}

TODO
===

Test key against hash of key
