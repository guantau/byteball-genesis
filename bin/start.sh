#!/usr/bin/env bash

cd `dirname $0`

pm2 delete all

pm2 start  ../nodes/hub/start.js --name hub
pm2 start ../nodes/explorer/explorer.js --name explorer

cd ../nodes
for i in {1..3}
do
    cd witness${i}
    pm2 start --interpreter=bash start.sh --name witness${i}
    cd ..
done

echo start finshed
