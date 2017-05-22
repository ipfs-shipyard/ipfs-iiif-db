'use strict'

const Y = require('yjs')
const EventEmitter = require('events')

module.exports = (type, ipfs, options) => {
  let ready = ipfs.isOnline && ipfs.isOnline()
  ipfs.once('ready', () => {
    ready = true
  })

  return (id, original) => {
    if (typeof id === 'object') {
      original = id
      id = original['@id']
    } else if (!original) {
      original = {}
    }

    if (!id) {
      throw new Error('annotation list needs an id or @id property')
    }

    if (!original['@id']) {
      original['@id'] = id
    }

    if (id !== original['@id']) {
      throw new Error('id and original[@id] should not be different')
    }

    const roomEmitter = new EventEmitter()
    const wrapper = new type.wrapper(roomEmitter, original)

    const onceIpfsReady = () => {
      Y({
        db: {
          name: options.store || 'memory'
        },
        connector: {
          name: 'ipfs', // use the IPFS connector
          ipfs: ipfs,
          room: original['@id'],
          roomEmitter: roomEmitter
        },
        share: type.share
      }).then(function (y) {

        type.update(original, y.share)

        wrapper._start(y.share)
      })
    }

    if (ready) {
      onceIpfsReady()
    } else {
      ipfs.once('ready', onceIpfsReady)
    }

    return wrapper
  }
}
