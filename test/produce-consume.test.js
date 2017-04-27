/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const iia = require('../')

describe('produce and consume', () => {
  let producer
  let consumer
  let subscription

  before((done) => iia.start(done))
  after((done) => iia.stop(done))

  it('can create a producer', (done) => {
    producer = iia.producer()
    done()
  })

  it('can put a string value', (done) => {
    producer.put('name', 'value', done)
  })

  it('can create a consumer', (done) => {
    consumer = iia.consumer()
    done()
  })

  it.skip('consumer can subscribe to name', (done) => {
    subscription = consumer.onChange(value => {
      expect(value).to.equal('value')
      done()
    })
  })

  it.skip('consumer can cancel subscription', (done) => {
    subscription.cancel()
    done()
  })
})
