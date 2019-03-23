#!/usr/bin/env bash

# Clone repositories and install modules
echo "INFO: cloning repositories..."
cd src
rm -rf *
git clone https://github.com/byteball/obyte-explorer.git
git clone https://github.com/byteball/obyte-hub.git
git clone https://github.com/byteball/obyte-witness.git

cd obyte-explorer; npm install
cd ../obyte-hub; npm install
cd ../obyte-witness; npm install
cd ../../genesis; npm install
cd ../bin

# Replace number of witnesses from constants.js file at all locations
WITNESSES=$(cat ../config/constants.js | grep -m 1 COUNT_WITNESSES | cut -d "=" -f 2 | tr -d " " | cut -d ";" -f 1)
echo "INFO: User wish to configure ${WITNESSES} witnesses"

sed -i "s/exports.COUNT_WITNESSES =.*/exports.COUNT_WITNESSES = ${WITNESSES};/g" ../genesis/node_modules/ocore/constants.js
sed -i "s/for i in {1\.\..*/for i in {1..${WITNESSES}\}/g" deploy.sh
sed -i "s/for i in {1\.\..*/for i in {1..${WITNESSES}\}/g" start.sh

echo "INFO: witnesses number replacement finished"
