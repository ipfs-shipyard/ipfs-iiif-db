'use strict'

const Emitter = require('events')
const topicName = require('./topic-name')
const ChangesFeed = require('./changes-feed')

module.exports = (store, ipfs) => {

  const subscriptions = {}

  return {
    get: get,
    getHead: getHead,
    getFromHash: getFromHash
  }

  /*** Subscriptions ***/

  function ensureSubscription (topic) {
    let subscription = subscriptions[topic]
    if (!subscription) {
      subscription = subscriptions[topic] = createSubscription(topic)
    }
    return subscription
  }

  function createSubscription (topic) {
    ipfs.pubsub.subscribe(topic, handleMessage)
    const emitter = new Emitter()

    return emitter

    function handleMessage (message) {
      const head = JSON.parse(message.data.toString())
      store.getHead(topic, (err, previousHead) => {
        if (err) {
          throw err
        }
        if (previousHead && previousHead.version > head.version) {
          return // early
        }

        store.setHead(topic, head.version, head.hash, (err) => {
          // todo: handle error
          if (err) {
            throw err
          }

          emitter.emit('head', head)
        })
      })
    }

  }

  /*** Heads ***/

  function getHead (id, callback) {
    const topic = topicName(id)
    const subscription = ensureSubscription(topic)
    store.getHead(topic, (err, head) => {
      if (err) {
        callback(err)
        return // early
      }

      if (!head) {
        subscription.once('head', (head) => {
          callback(null, head)
        })
      } else {
        callback(null, head)
      }
    })

  }

  /*** Get ***/

  function get (id, listenForChanges, callback) {
    if (typeof (listenForChanges) === 'function') {
      callback = listenForChanges
      listenForChanges = false
    }

    getHead(id, (err, head) => {
      if (err) {
        callback(err)
        return //early
      }
      getFromHash(head.hash, callback)
    })

    if (listenForChanges) {
      return createChangesFeed(id)
    }
  }

  function getFromHash (hash, callback) {
    ipfs.object.get(hash, { enc: 'base58' }, (err, object) => {
      if (err) {
        callback(err)
        return // early
      }
      const message = JSON.parse(object.data.toString())
      callback(null, message.value)
    })
  }

  function createChangesFeed (id) {
    return ChangesFeed(id, store, ipfs)
  }

  // function ensureSubscription (topic) {
  //   let subs = subscriptions[topic]
  //   if (!subs) {
  //     subs = subscriptions[topic] = Subscription(ipfs, topic)
  //   }
  //   return subs
  // }
}
