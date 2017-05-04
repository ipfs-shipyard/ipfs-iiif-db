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
    headForTopic: headForTopic
  }

  function start (callback) {
    setImmediate(callback)
  }

  function setHead (id, hash, callback) {
    store.setItem(key(id), hash)
    setImmediate(callback)
  }

  function headForTopic (id, callback) {
    setImmediate(() => {
      callback(null, store.getItem(key(id)))
    })
  }
}

function key (id) {
  return PREFIX + id
}