'use strict'

const start = require('./start')
const producer = require('./producer')
const consumer = require('./consumer')

exports.start = _start
exports.stop = _stop
exports.producer = _producer
exports.consumer = _consumer

let ipfs

function _start (_callback) {
  if (ipfs) {
    _callback(new Error('IPFS already started'))
    return // early
  }

  ipfs = start(_callback)

  return ipfs
}

function _stop (callback) {
  if (!ipfs) {
    callback(new Error('IPFS stopped'))
    return // early
  }

  const _ipfs = ipfs
  ipfs = null
  _ipfs.once('stop', () => callback())
  _ipfs.stop()
}

function _producer () {
  return producer(ipfs)
}

function _consumer () {
  return consumer(ipfs)
}
