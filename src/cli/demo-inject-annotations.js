#! /usr/bin/env node

'use strict'

const DB = require('../node')

const partition = process.argv[2] || 'iiif'
console.log('partition: %s', partition)

const id = process.argv[3] || 'https://wellcomelibrary.org/annoservices/search/b18035723?q=gene'
console.log('annotation id: %s', id)

const interval = Number(process.argv[4]) || 1000
console.log('interval (ms): %d', interval)

const db = DB({ partition: partition, store: 'memory' })

db.ipfs.once('ready', () => {

  const annotations = require('./samples/annotations.json')
  const annotationList = db.annotationList(id)

  setInterval(inject, interval)

  function inject() {
    const annotation = annotations.shift()
    if (annotation) {
      annotationList.pushResource(annotation)
    }
  }
})
