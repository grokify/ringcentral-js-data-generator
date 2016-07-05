# RingCentral JS Data Generator

A set of Node.js command line applications calling RingCentral REST APIs repeatedly to generate RingCentral data records (messages, faxes, pager messages, phone call logs, call recordings). The API calls are configured by JSON files in the `conf` directory.

# Getting Started

1. Clone this repo
2. Run `npm install`
3. Edit files in `conf` directory with your own configuration

## Generate SMS API calls

1. Edit `conf/sms.json`
2. `node sendsms.js`

## Generate Fax API calls

1. Edit `conf/fax.json`
2. `node sendfax.js`

# About Configuration

If the repeat `count` is -1, then it will run forever.