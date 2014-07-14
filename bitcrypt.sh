#!/bin/bash

ACCESS_TOKEN="pandabearwarriorlove"
KEY_SECRET="lovethepurpleundeniably"
VALUE_KEY="iamtheencryptionkeyofunspeakablepower"
ID_KEY="ofunspeakablepoweriamtheencryptionkey"
PORT=9393

curl http://localhost:${PORT}/bitcrypt/key \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "keys": ["'${ID_KEY}'", "'${VALUE_KEY}'"], "secret": "'${KEY_SECRET}'" }'

curl http://localhost:${PORT}/bitcrypt/key \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "keys": ["'${ID_KEY}'", "'${VALUE_KEY}'"], "secret": "'${KEY_SECRET}'" }'

curl http://localhost:${PORT}/bitcrypt/key \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "keys": ["'${ID_KEY}'", "'${VALUE_KEY}'"], "secret": "'${KEY_SECRET}'" }'

# payload MUST be in the field 'value'
curl http://localhost:${PORT}/bitcrypt \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "value": "wonkadonka" }'
