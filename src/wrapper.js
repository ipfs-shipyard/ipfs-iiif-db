'use strict'

const EventEmitter = require('events')
const Queue = require('async/queue')

module.exports = class Wrapper extends EventEmitter {
  constructor (roomEmitter) {
    super()

    this.room = roomEmitter
    this._mutationQueue = Queue((fn, callback) => {
      if (this._started) {
        fn()
        callback()
      } else {
        this.once('started', () => {
          fn()
          callback()
        })
      }
    }, 1)
  }

  // mutations

  _queueMutation (fn) {
    this._mutationQueue.push(fn)
  }
}
