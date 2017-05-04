'use strict'

const Emitter = require('events')
const topicName = require('./topic-name')

module.exports = (id, store, ipfs) => {
  const topic = topicName(id)
  const emitter = new Emitter()

  emitter.cancel = cancel

  store.on(topic, onNewHead)

  return emitter

  function onNewHead (head) {
    console.log('NEW HEAD', head.hash)
    ipfs.object.get(head.hash, { enc: 'base58' }, (err, node) => {
      if (err) {
        // TODO: handle error
        throw err
      }

      emitter.emit('change', JSON.parse(node.data.toString()).value)
    })
  }

  function cancel () {
    store.removeListener(topic, onNewHead)
  }
}
