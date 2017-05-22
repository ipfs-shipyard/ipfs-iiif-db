#! /usr/bin/env node

'use strict'

require('colors')

const TYPES = {
  AnnotationList: 'annotationList'
}

const tracking = {}

const DB = require('../node')

const db = DB({ store: 'leveldb' })

const partition = process.argv[2] || 'iiif'
console.log('partition: %s', partition)

const topic = 'iiif:partition:' + partition

db.ipfs.once('ready', () => {
  db.ipfs.pubsub.subscribe(topic, (m) => {
    handle(decode(m.data))
  })
})

function handle (message) {
  const type = TYPES[message.type]
  if (type) {
    const key = message.type + ':' + message.id
    const tracker = tracking[key]
    if (!tracker) {
      const tracker = tracking[key] = db[type](message.id)
      tracker.on('mutation', () => {
        console.log('%s: mutated to %s\n'.yellow, key, pprint(tracker))
      })
      tracker.on('started', () => {
        console.log('%s: started from %s\n'.green, key, pprint(tracker))
      })
      console.log('tracking %s', key)
    }
  }
}

function decode (data) {
  return JSON.parse(data.toString())
}

function pprint (tracker) {
  return JSON.stringify(tracker)
}