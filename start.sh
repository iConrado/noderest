#!/bin/sh

if [ -z "$MONGO_USER" ]; then
  exit 1
fi

if [ -z "$MONGO_PASSWORD" ]; then
  exit 1
fi

npm start;
