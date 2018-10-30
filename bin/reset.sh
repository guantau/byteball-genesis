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

rm "$APPDIR"/byteball-hub/byteball*
rm "$APPDIR"/byteball-explorer/byteball*

rm "$APPDIR"/wallet-genesis/byteball*

for i in {1..1}
do
    rm "$APPDIR"/wallet-witness$i/byteball*
done

echo All database has been deleted
