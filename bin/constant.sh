#!/usr/bin/env bash

cd `dirname $0`
echo "update constants"
cp -f ../config/constants.js ../genesis/node_modules/ocore/constants.js

