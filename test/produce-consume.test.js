/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const IpfsIiifAnnotations = require('../')

describe('produce and consume', () => {
  let iiaProducer, iiaConsumer
  let producer
  let consumer
  let subscription

  before(() => {
    iiaProducer = IpfsIiifAnnotations()
  })

  before((done) => iiaProducer.start(done))
  after((done) => iiaProducer.stop(done))
  after((done) => {
    if (iiaConsumer) {
      iiaConsumer.stop(done)
    } else {
      done()
    }
  })

  it('can get the producer id', (done) => {
    producer = iiaProducer.id((err, id) => {
      expect(err).to.not.exist()
      done()
    })
  })

  it('can create a producer', (done) => {
    producer = iiaProducer.producer()
    done()
  })

  it('can put a string value', (done) => {
    producer.put('name', 'value', done)
  })

  it('can start a consumer node', (done) => {
    iiaConsumer = IpfsIiifAnnotations()
    iiaConsumer.start(done)
  })

  it('can get id of the consumer node', (done) => {
    iiaConsumer.id((err, id) => {
      expect(err).to.not.exist()
      done()
    })
  })

  it('can start a consumer', (done) => {
    consumer = iiaConsumer.consumer()
    done()
  })

  it('consumer can subscribe to name', (done) => {
    subscription = consumer.onChange('name', value => {
      expect(value).to.equal('value')
      done()
    })
  }).timeout(5000)

  it('consumer can cancel subscription', (done) => {
    subscription.cancel()
    done()
  })
})
