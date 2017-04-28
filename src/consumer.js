'use strict'

const topicName = require('./topic-name')

module.exports = (ipfs) => {
  return {
    get: get,
    onChange: onChange
  }

  function get (id, callback) {
    let replied = false
    const sub = onChange(id, (err, result) => {
      if (!replied) {
        replied = true
        sub.cancel()
        callback(err, result)
      }
    })
  }

  function onChange (id, fn) {
    let active = true
    const topic = topicName(id)
    ipfs.once('stop', cancel)
    ipfs.pubsub.subscribe(topic, handler)

    return {
      cancel: cancel
    }

    function handler (message) {
      ipfs.object.get(message.data, (err, object) => {
        if (err) {
          console.error('error getting IPFS object', err)
          return // early
        }
        const message = JSON.parse(object.data.toString())
        if (message.name !== id) {
          console.error('expected name to be ' + id + ' and was ' + message.name)
          return // early
        }
        fn(message.value)
      })
    }

    function cancel () {
      if (!active) {
        return
      }
      active = false
      try {
        setTimeout(() => ipfs.pubsub.unsubscribe(topic, handler), 1000)
      } catch (e) {
        if (!e.message.match('FloodSub is not started')) {
          throw e
        }
      }
    }
  }
}
