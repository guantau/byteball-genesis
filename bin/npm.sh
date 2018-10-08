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
DIR=`pwd`

installNpm() {
    if [[ -d $1 ]]; then
        cd $1
        echo "remove old node_modules"
        rm -rf package-lock.json ./node_modules
        npm install
    fi
}

(installNpm "$DIR/..")
(installNpm "$DIR/../src/byteball-explorer")
(installNpm "$DIR/../src/byteball-hub")
(installNpm "$DIR/../src/byteball-witness")

cd $DIR/..