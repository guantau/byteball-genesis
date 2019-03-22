# byteball-genesis
This project is used to start a ByteBall network from scratch, including generating config files, creating the genesis unit, starting the witnesses, starting the hub, and starting the explorer. The codes have been tested in the Ubuntu and MacOS.

The main steps are as follow:

## Install NodeJS and Tools

Install NodeJS version control tool NVM:

```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```

Check if NVM is installed successfully:

```bash
$ nvm -v
```

Install NodeJS v8.15.1 LTS:

```bash
$ nvm install 8.15.1
```

Install NodeJS process management tool:

```bash
$ npm install pm2 -g
```

Install NodeJS code compile tool:

```bash
$ npm install node-gyp -g
```

## Download source codes

Download `byteball-genesis` source code:

```bash
$ git checkout https://github.com/guantau/byteball-genesis
$ cd genesis
$ npm install
```

## Configure number of witnesses (optional)

Modify file `constanst.js` and set `exports.COUNT_WITNESSES` variable. Suggested number for obyte network is equal to 12.

## Generate config files

```bash
$ npm run init
```

Generated config files are in directory `wallets`, and the structure is: 

![](http://oc7urqs4c.bkt.clouddn.com/2018-09-16-byteball_wallets.png)

Print the addresses of `witness`:

```bash
$ cat witness-address.json
```

Modify the `explorer-conf.js` and `hub-conf.js` in the directory `config`, and fill the addresses in `exports.initial_witnesses`.

## Create the genesis unit

```bash
$ npm run create_bytes
```

It will output `Genesis unit: ` and the hash of the genesis unit. Modify the `constants.js` in the directory `config`, and fill the hash in `exports.GENESIS_UNIT`.

## Create the blackbytes unit

```bash
$ npm run create_blackbytes
```

It will output `blackbytes asset created:` and the hash of the asset unit. Modify the `constants.js` in the directory `config`, and fill the hash in `exports.BLACKBYTES_ASSET`.

## Deploy nodes

```bash
$ npm run deploy
```

## Start nodes

```bash
$ npm run start
```

After the nodes are starts, use the command `pm2 list` to get the following result:

![](http://oc7urqs4c.bkt.clouddn.com/2018-04-01-byteball-genesis-pm2.png)

Check the `Hub` node's log, and see other nodes are connected, such as `13 incoming connections, 0 outgoing connections, 0 outgoing connections being opened`.

```bash
$ pm2 logs hub
```

## Send the genesis unit

```bash
$ npm run create_bytes
```

After that, you can see the genesis unit in `http://127.0.0.1:4000/`.

## Send the blackbytes unit

```bash
$ npm run create_blackbytes
```

After that, you can see the blackbytes unit in `http://127.0.0.1:4000/`.


## Test the payment

```bash
$ npm run pay_bytes
```

In the test, payment is started every 30s(**Attention: the test must start after the genesis unit is stable**）。

## Test the private payment

```bash
$ npm run pay_blackbytes
```

It need enough `header_commission` and `witnessing` to start the private payment.