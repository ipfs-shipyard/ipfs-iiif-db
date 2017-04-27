'use strict'

const waterfall = require('async/waterfall')
const topicName = require('./topic-name')
const localStore = require('./local-store')

module.exports = (ipfs) => {
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
          ipfs.object.put({
            Data: new Buffer(JSON.stringify(data)),
            Links: [] // fix
          }, {enc: 'json'}, callback)
        },

        (node, callback) => {
          const mh = node.multihash
          localStore.setHead(topic, mh, (err) => {
            callback(err, mh)
          })
        },

        (mh, callback) => {
          ipfs.pubsub.publish(topic, mh, callback)
        }
      ],
      callback
    )
  }
}
