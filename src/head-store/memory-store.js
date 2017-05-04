'use strict'

const setImmediate = require('async/setImmediate')
const Emitter = require('events')

module.exports = () => {
  // TODO: persist heads

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
    const head = heads[id] = {
      version: version,
      hash: hash
    }

    setImmediate(callback)
    setImmediate(() => emitter.emit(id, head))
  }

  function getHead (topic, callback) {
    setImmediate(() => {
      callback(null, heads[topic])
    })
  }
}
