#!/usr/bin/env bash

SYSTEM=`uname -s`
if [ $SYSTEM = "Darwin" ] ; then
    APPDIR="$HOME/Library/Application Support"
elif [ $SYSTEM = "Linux" ] ; then
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
rm -rf "$APPDIR"/byteball-explorer
rm -rf "$APPDIR"/byteball-hub

echo "copy wallet to appdir"
cp -a ../wallets/wallet* "$APPDIR"

echo "update config file"
cp -f ../config/hub-conf.js ../src/byteball-hub/conf.js
cp -f ../config/witness-conf.js ../src/byteball-witness/conf.js
cp -f ../config/explorer-conf.js ../src/byteball-explorer/conf.js

echo "update start script"
cp -f ../config/witness-headless-start.js ../src/byteball-witness/node_modules/headless-byteball/start.js
cp -f ../config/witness-start.js ../src/byteball-witness/start.js

echo "update constants"
cp -f ../config/constants.js ../src/byteball-witness/node_modules/byteballcore/constants.js
cp -f ../config/constants.js ../src/byteball-hub/node_modules/byteballcore/constants.js
cp -f ../config/constants.js ../src/byteball-explorer/node_modules/byteballcore/constants.js

cp -f ../config/constants.js ../node_modules/byteballcore/constants.js

for i in {1..1}
do
    echo "deploy witness$i"
    cp -a ../src/byteball-witness/ ../nodes/witness$i
    if [ $SYSTEM = "Darwin" ] ; then
        sed -i "" "s/byteball-witness/wallet-witness$i/g" ../nodes/witness$i/package.json  
    else
        sed -i "s/byteball-witness/wallet-witness$i/g" ../nodes/witness$i/package.json  
    fi
done

cp -a ../src/byteball-explorer/ ../nodes/explorer
cp -a ../src/byteball-hub/ ../nodes/hub

echo deploy finshed

#! run ./start.sh!
