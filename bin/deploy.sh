#!/usr/bin/env bash

SYSTEM=`uname -s`
if [[ ${SYSTEM} = "Darwin" ]] ; then
    APPDIR="$HOME/Library/Application Support"
elif [[ ${SYSTEM} = "Linux" ]] ; then
    APPDIR="$HOME/.config"
else
    echo "Unsupported system"
    exit -1
fi

cd `dirname $0`

pm2 delete all

echo "clean up old data"
rm -rf ../nodes/*
rm -rf "$APPDIR"/wallet*
rm -rf "$APPDIR"/obyte-explorer
rm -rf "$APPDIR"/obyte-hub

echo "copy wallet to appdir"
cp -a ../wallets/wallet* "$APPDIR"

echo "update config file"
cp -f ../config/hub-conf.js ../src/obyte-hub/conf.js
cp -f ../config/witness-conf.js ../src/obyte-witness/conf.js
cp -f ../config/explorer-conf.js ../src/obyte-explorer/conf.js

echo "update constants"
cp -f ../config/constants.js ../src/obyte-witness/node_modules/ocore/constants.js
cp -f ../config/constants.js ../src/obyte-hub/node_modules/ocore/constants.js
cp -f ../config/constants.js ../src/obyte-explorer/node_modules/ocore/constants.js

cp -f ../config/constants.js ../genesis/node_modules/ocore/constants.js

for i in {1..3}
do
    echo "deploy witness$i"
    cp -a ../src/obyte-witness/ ../nodes/witness${i}
    cp ../genesis/start.sh ../nodes/witness${i}
    if [[ ${SYSTEM} = "Darwin" ]] ; then
        sed -i "" "s/obyte-witness/wallet-witness$i/g" ../nodes/witness${i}/package.json
    else
        sed -i "s/obyte-witness/wallet-witness$i/g" ../nodes/witness${i}/package.json
    fi
done

cp -a ../src/obyte-explorer/ ../nodes/explorer
cp -a ../src/obyte-hub/ ../nodes/hub

echo deploy finshed

#! run ./start.sh!
