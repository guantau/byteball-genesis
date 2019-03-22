#!/bin/bash

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

rm "$APPDIR"/obyte-hub/obyte*
rm "$APPDIR"/obyte-explorer/obyte*

rm "$APPDIR"/wallet-genesis/obyte*

for i in {1..12}
do
    rm "$APPDIR"/wallet-witness$i/obyte*
done

echo All database has been deleted
