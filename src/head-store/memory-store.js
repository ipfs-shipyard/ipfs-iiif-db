'use strict'

const setImmediate = require('async/setImmediate')

module.exports = () => {
  // TODO: persist heads

  const heads = {}

  return {
    start: start,
    setHead: setHead,
    topics: topics,
    headForTopic: headForTopic
  }

  function start (callback) {
    setImmediate(callback)
  }

  function setHead (id, hash, callback) {
    heads[id] = hash
    setImmediate(callback)
  }

  function headForTopic (topic, callback) {
    setImmediate(() => {
      callback(null, heads[topic])
    })
  }
}
