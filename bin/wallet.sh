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

echo "copy wallet to appdir"
cp -a ../wallets/wallet-genesis "$APPDIR"

# remove duplicate ocore module
rm -rf ../genesis/node_modules/headless-obyte/node_modules/ocore

