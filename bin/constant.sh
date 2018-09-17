#!/usr/bin/env bash

cd `dirname $0`
echo "update constants"
cp -f ../config/constants.js ../node_modules/byteballcore/constants.js