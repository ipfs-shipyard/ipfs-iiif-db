'use strict'

const setImmediate = require('async/setImmediate')

const PREFIX = 'ipfs:iiif:db:'

module.exports = () => {
  // TODO: persist heads

  const store = window.localStorage

  const heads = {}

  return {
    start: start,
    setHead: setHead,
    getHead: getHead
  }

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