'use strict'

const start = require('./start')
const producer = require('./producer')
const consumer = require('./consumer')

module.exports = () => {
  let ipfs

  return {
    start: _start,
    stop: _stop,
    producer: _producer,
    consumer: _consumer,
    id: _id
  }

  function _start (_callback) {
    if (ipfs) {
      _callback(new Error('IPFS already started'))
      return // early
    }

    ipfs = start(_callback)

    return ipfs
  }

  function _id (callback) {
    if (!ipfs) {
      callback(new Error('IPFS not started'))
      return // early
    }
    return ipfs.id((err, reply) => {
      if (err) {
        callback(err)
      } else {
        callback(null, reply.id)
      }
    })
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
}
