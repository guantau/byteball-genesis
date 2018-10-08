#!/usr/bin/env bash

cd `dirname $0`

pm2 delete all

pm2 start  ../nodes/hub/start.js --name hub

for i in {1..1}
do
    pm2 start ../nodes/witness$i/start.js --name witness$i
done

pm2 start ../nodes/explorer/explorer.js --name explorer

echo start finshed
