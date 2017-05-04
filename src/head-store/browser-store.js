'use strict'

const setImmediate = require('async/setImmediate')
const Emitter = require('events')

const PREFIX = 'ipfs:iiif:db:'

module.exports = () => {
  // TODO: persist heads

  const store = window.localStorage

  const heads = {}

  const emitter = new Emitter()

  Object.assign(emitter, {
    start: start,
    setHead: setHead,
    getHead: getHead
  })

  return emitter

  function start (callback) {
    setImmediate(callback)
  }

  function setHead (id, version, hash, callback) {
    const value = {
      version: version,
      hash: hash
    }
    store.setItem(key(id), JSON.stringify(value))
    setImmediate(callback)
    setImmediate(() => emitter.emit(id, value))
  }

  function getHead (id, callback) {
    setImmediate(() => {
      let value = store.getItem(key(id))
      if (value) {
        value = JSON.parse(value)
      }
      callback(null, value)
    })
  }
}

function key (id) {
  return PREFIX + id
}