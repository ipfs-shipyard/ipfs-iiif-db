'use strict'

const setImmediate = require('async/setImmediate')

// TODO: persist heads

const heads = {}

exports.start = (callback) => {
  setImmediate(callback)
}

exports.setHead = (id, hash, callback) => {
  heads[id] = hash
  setImmediate(callback)
}

exports.topics = (callback) => {
  // fix
  setImmediate(() => {
    callback(null, Object.keys(heads))
  })
}

exports.headForTopic = (topic, callback) => {
  setImmediate(() => {
    callback(null, heads[topic])
  })
}
