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
