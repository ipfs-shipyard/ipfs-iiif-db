'use strict'

const Backoff = require('backoff').exponential

const BACKOFF_OPTIONS = {
  initialDelay: 1000,
  maxDelay: 10000
}

module.exports = (partition, ipfs) => {
  const topic = 'iiif:partition:' + partition
  const announcers = {}

  let started = ipfs.isOnline()
  if (!started) {
    ipfs.once('ready', () => {
      started = true
    })
  }

  return {
    push: push,
    refresh: refresh
  }

  function onceStarted () {
    announce()
  }

  function push (type, id) {
    if (started) {
      const key = type + ':' + id
      announcers[id] = Announcer(type, id)
    } else {
      ipfs.once('ready', () => push(type, id))
    }
  }

  function refresh (type, id) {
    const key = type + ':' + id
    const announcer = announcers[key]
    if (announcer) {
      announcer.refresh()
    }
  }

  function Announcer(type, id) {
    const backoff = Backoff(BACKOFF_OPTIONS)
    backoff.backoff()

    backoff.on('ready', () => {
      announce()
      backoff.backoff()
    })

    return {
      refresh: refresh
    }

    function refresh () {
      backoff.reset()
    }

    function announce () {
      const message = {
        type: type,
        id: id
      }
      ipfs.pubsub.publish(topic, encode(message))
    }
  }
}

function encode (message) {
  return Buffer.from(JSON.stringify(message))
}