'use strict'

const Emitter = require('events')

const BROADCAST_INTERVAL = 1000

module.exports = (topic, ipfs, store) => {
  const emitter = new Emitter()

  setInterval(broadcast, BROADCAST_INTERVAL)

  return emitter

  function broadcast () {
    store.getHead(topic, (err, head) => {
      if (head) {
        const value = new Buffer(JSON.stringify(head))
        ipfs.pubsub.publish(topic, value, (err) => {
          if (err) {
            // TODO: handle error
            throw error
          }
        })
      }
    })
  }
}