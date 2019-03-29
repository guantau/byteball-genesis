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
rm -rf ../wallets/*
rm -rf "$APPDIR"/wallet*
rm -rf "$APPDIR"/obyte-explorer
rm -rf "$APPDIR"/obyte-hub

echo "clean-up done"
