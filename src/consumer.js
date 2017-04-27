'use strict'

const topicName = require('./topic-name')

module.exports = (ipfs) => {
  return {
    onChange: onChange
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
      fn(JSON.parse(message.data.toString()))
    }

    function cancel () {
      if (!active) {
        return
      }
      active = false
      try {
        ipfs.pubsub.unsubscribe(topic, handler)
      } catch (e) {
        if (!e.message.match('FloodSub is not started')) {
          throw e
        }
      }
    }
  }
}
