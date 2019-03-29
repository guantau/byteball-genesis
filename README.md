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

Download `obyte-genesis` source code:

```bash
$ git clone https://github.com/guantau/obyte-genesis.git
$ cd genesis
$ npm install
```

## Configure number of witnesses (optional)

Modify file `constanst.js` and set `exports.COUNT_WITNESSES` variable. Suggested number for obyte network is equal to 12, default is 3.

## Initialize the project data

Downloads sources, executes node install and generates configs:

```bash
$ npm run init
```

Generated config files are in directory `wallets`. 
You can print the addresses of `witnesses` if console output is lost:

```bash
$ cat witness-address.json
```

Modify the `explorer-conf.js` and `hub-conf.js` in the directory `config`, and replace the addresses in `exports.initial_witnesses` with generated ones.

## Create the genesis unit

```bash
$ npm run create_bytes
```
Press Ctrl+C after genesis unit is generated. It will output `Genesis unit: ` and the hash of the genesis unit. Modify the `constants.js` in the directory `config`, and replace the hash in `exports.GENESIS_UNIT`.

## Create the blackbytes unit (optional)

```bash
$ npm run create_blackbytes
```
Press Ctrl+C after blackbytes unit is generated. It will output `blackbytes asset created:` and the hash of the asset unit. Modify the `constants.js` in the directory `config`, and fill the hash in `exports.BLACKBYTES_ASSET`.

## Deploy nodes

```bash
$ npm run deploy
```
Nodes binaries are copied to nodes/ folder.

## Start nodes

```bash
$ npm run start
```
After the nodes are started, use the command
```bash
$ pm2 logs hub
```
to check the number of incoming hub connections. It should be equal to your number of witnesses + 1 (explorer).
Example: `4 incoming connections, 0 outgoing connections, 0 outgoing connections being opened`.

## Send the genesis unit

```bash
$ npm run create_bytes
```

After that, you will not be able to see the tree unless you make first blackbyte unit or payment.

## Send the blackbytes unit (optional)

```bash
$ npm run create_blackbytes
```

After that, you can see the blackbytes unit in `http://127.0.0.1:4000/`.


## Test the payment
Edit `pay_bytes.js` script at `genesis` folder and change `receive_address` address to one of the witnesses.

```bash
$ npm run pay_bytes
```

After that you will be able to see tree with units and witnesses to witness the transactions at `http://127.0.0.1:4000/`
Payment is done once. Unless payment is not confirmed by adding it to MC there is no point to make another one with the same data. 

## Test the private payment

```bash
$ npm run pay_blackbytes
```

It needs enough `header_commission` and `witnessing` to start the private payment.
