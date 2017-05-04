'use strict'

const setImmediate = require('async/setImmediate')

module.exports = () => {
  // TODO: persist heads

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
    heads[id] = {
      version: version,
      hash: hash
    }
    setImmediate(callback)
  }

  function getHead (topic, callback) {
    setImmediate(() => {
      callback(null, heads[topic])
    })
  }
}
