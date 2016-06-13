# Generate Ringcentral sdk api calls

A set of node command line applications to call Ringcentral sdk apis repeatedly. The api calls are configured by json files in `conf` directory.

# Getting Started

1. Clone this repo
2. Run `npm install`
3. Edit files in `conf` directory with your own configurations

## Gengerate sms api calls

1. Edit `conf/sms.json`
2. `node sendsms.js`

## Gengerate fax api calls

1. Edit `conf/fax.json`
2. `node sendfax.js`
