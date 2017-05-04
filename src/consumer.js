'use strict'

const topicName = require('./topic-name')

module.exports = (store, ipfs) => {
  return {
    get: get,
    onChange: onChange
  }

  function get (id, callback) {
    let replied = false
    const topic = topicName(id)
    console.log('getting head for topic', topic)
    store.headForTopic(topic, (err, head) => {
      if (err) {
        callback(err)
        return // early
      }

      console.log('HEAD for topic', head)

      if (!head) {
        const sub = onChange(id, (result) => {
          console.log('CHANGE', result)
          if (!replied) {
            replied = true
            sub.cancel()
            callback(null, result)
          }
        })
      } else {
        getFromHead(head, id, callback)
      }
    })
  }

  function onChange (id, fn) {
    let active = true
    const topic = topicName(id)
    // const subscription = ensureSubscription(topic)

    ipfs.once('stop', cancel)

    console.log('pubsub: subscribing topic', topic)
    ipfs.pubsub.subscribe(topic, handler)

    return {
      cancel: cancel
    }

    function handler (message) {
      const head = message.data
      store.headForTopic(topic, (err, previousHead) => {
        if (err) {
          throw err
        }

        // TODO: make this causal
        if (previousHead && previousHead.equals(head)) {
          return // early
        }

        console.log('have a new head for topic %s. Setting it..', topic)

        store.setHead(topic, head, (err) => {
          // todo: handle error
          if (err) {
            throw err
          }

          console.log('getting %s from head...', id)
          getFromHead(head, id, (err, obj) => {
            // todo: handle error
            if (err) {
              throw err
            }
            console.log('got %s from head', id)
            fn(obj)
          })
        })
      })
    }

    function cancel () {
      if (!active) {
        return
      }
      active = false
      try {
        setTimeout(() => ipfs.pubsub.unsubscribe(topic, handler), 1000)
      } catch (e) {
        if (!e.message.match('FloodSub is not started')) {
          throw e
        }
      }
    }
  }

  function getFromHead (head, name, callback) {
    console.log('get from head', head, name)
    ipfs.object.get(head, (err, object) => {
      console.log('got from head', err, object)
      if (err) {
        callback(err)
        return // early
      }
      const message = JSON.parse(object.data.toString())
      if (message.name !== name) {
        callback(new Error('expected name to be ' + name + ' and was ' + message.name))
        return // early
      }
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
