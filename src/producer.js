'use strict'

const waterfall = require('async/waterfall')
const eachSeries = require('async/eachSeries')
const each = require('async/each')
const topicName = require('./topic-name')
const Peers = require('./peers')

module.exports = (store, ipfs) => {
  const peers = Peers(ipfs)
  peers.on('changed', onPeersChange)

  return {
    put: put
  }

  function put (name, value, callback) {
    const data = {
      name: name,
      value: value
    }

    const topic = topicName(name)

    waterfall(
      [
        (callback) => {
          console.log('ipfs.object.put')
          ipfs.object.put({
            Data: new Buffer(JSON.stringify(data)),
            Links: [] // fix
          }, {enc: 'json'}, callback)
        },

        (node, callback) => {
          const mh = node.multihash
          console.log('setting head of %s to', topic, mh)
          store.setHead(topic, mh, (err) => {
            callback(err, mh)
          })
        },

        (mh, callback) => {
          console.log('PUBLISHING topic %s', topic, mh)
          ipfs.pubsub.publish(topic, mh, callback)
        }
      ],
      callback
    )
  }

  function onPeersChange () {
    store.topics((err, topics) => {
      if (err) {
        console.error('peer poller: error getting topics', err)
        return // early
      }
      eachSeries(
        topics,
        (topic, callback) => {
          each(
            pubSubDelays(),
            publishWithDelay.bind(null, topic),
            callback
          )
        },
        (err) => {
          if (err) {
            console.error('peer poller: error head for topics', err)
          }
        }
      )

      function publishWithDelay (topic, delay, callback) {
        // fix: do I really need a delay?
        setTimeout(() => {
          store.headForTopic(topic, (err, head) => {
            if (err) {
              callback(err)
            } else {
              console.log('(2) PUBLISHING topic %s', topic, head)
              ipfs.pubsub.publish(topic, head, callback)
            }
          })
        }, delay)
      }
    })
  }
}

function pubSubDelays () {
  // TODO: this is ugly:
  return [1000, 3000, 6000]
}
