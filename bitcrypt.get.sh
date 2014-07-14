#!/bin/bash

ACCESS_TOKEN="pandabearwarriorlove"
PORT=9393
ID="d2x0fvcywKtivijh-6moC4D0PTfHQvYlWgYkEJdGFRuASOkY1tO3k9XNYg1llZ9o"

curl http://localhost:${PORT}/bitcrypt/${ID} \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
