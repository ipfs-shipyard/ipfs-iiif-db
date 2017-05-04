'use strict'

const start = require('./start')
const Producer = require('./producer')
const Consumer = require('./consumer')
const LocalStore = require('./local-store')
const Emitter = require('events')

module.exports = () => {
  let ipfs, producer, consumer
  const store = LocalStore()

  const node = Object.assign(new Emitter(), {
    start: _start,
    stop: _stop,
    put: _put,
    get: _get,
    getHead: _getHead,
    getFromHash: _getFromHash,
    onChange: _onChange,
    id: _id,
    peerInfo: _peerInfo
  })

  return node

  function _start (callback) {
    if (ipfs) {
      callback(new Error('IPFS already started'))
      return // early
    }

    ipfs = start(store, (err) => {
      if (err) {
        callback(err)
        return // early
      }

      producer = Producer(store, ipfs, node)
      consumer = Consumer(store, ipfs)
      callback()
    })

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
      callback(new Error('IPFS already stopped'))
      return // early
    }

    const _ipfs = ipfs
    ipfs = null
    _ipfs.once('stop', () => callback())
    _ipfs.stop()
  }

  function _put (id, value, callback) {
    if (!ipfs) {
      callback(new Error('IPFS not started'))
      return // early
    }
    return producer.put(id, value, callback)
  }

  function _get (id, callback) {
    if (!ipfs) {
      callback(new Error('IPFS not started'))
      return // early
    }
    return consumer.get(id, callback)
  }

  function _getHead (id, callback) {
    if (!ipfs) {
      callback(new Error('IPFS not started'))
      return // early
    }

    return consumer.getHead(id, callback)
  }

  function _getFromHash (hash, callback) {
    if (!ipfs) {
      callback(new Error('IPFS not started'))
      return // early
    }

    return consumer.getFromHash(hash, callback)
  }

  function _onChange (id, fn) {
    if (!ipfs) {
      throw new Error('IPFS not started')
    }
    return consumer.onChange(id, fn)
  }

  function _peerInfo (callback) {
    if (!ipfs) {
      callback(new Error('IPFS not started'))
      return // early
    }
    return ipfs.id(callback)
  }
}
