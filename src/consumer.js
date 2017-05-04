'use strict'

const Emitter = require('events')
const topicName = require('./topic-name')

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
    console.log('pubsub: subscribing topic', topic)
    ipfs.pubsub.subscribe(topic, handleMessage)
    const emitter = new Emitter()

    return emitter

    function handleMessage (message) {
      const head = message.data.toString()
      store.headForTopic(topic, (err, previousHead) => {
        if (err) {
          throw err
        }

        // TODO: make this causal
        if (previousHead && previousHead === head) {
          return // early
        }

        console.log('have a new head for topic %s. Setting it..', topic)

        store.setHead(topic, head, (err) => {
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
    store.headForTopic(topic, (err, head) => {
      if (err) {
        callback(err)
        return // early
      }

      console.log('head for topic %s is ', topic, head)

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

  function get (id, callback) {
    getHead(id, (err, head) => {
      if (err) {
        callback(err)
        return //early
      }
      getFromHash(head, callback)
    })
  }

  function getFromHash (hash, callback) {
    console.log('get from hash', hash)
    ipfs.object.get(hash, { enc: 'base58' }, (err, object) => {
      console.log('got from hash', err, object)
      if (err) {
        callback(err)
        return // early
      }
      const message = JSON.parse(object.data.toString())
      callback(null, message.value)
    })
  }

  // function ensureSubscription (topic) {
  //   let subs = subscriptions[topic]
  //   if (!subs) {
  //     subs = subscriptions[topic] = Subscription(ipfs, topic)
  //   }
  //   return subs
  // }
}
