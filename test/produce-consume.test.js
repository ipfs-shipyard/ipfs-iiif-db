/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const DB = require('../')

describe('produce and consume', () => {
  let producer
  let consumer
  let subscription

  before(() => {
    producer = DB()
  })

  before((done) => producer.start(done))
  after((done) => producer.stop(done))
  after((done) => {
    if (consumer) {
      consumer.stop(done)
    } else {
      done()
    }
  })

  it('can get the producer id', (done) => {
    producer.id((err, id) => {
      expect(err).to.not.exist()
      done()
    })
  })

  it('can put a string value', (done) => {
    producer.put('name', 'value', done)
  })

  it('can start a consumer node', (done) => {
    consumer = DB()
    consumer.start(done)
  }).timeout(5000)

  it('can get id of the consumer node', (done) => {
    consumer.id((err, id) => {
      expect(err).to.not.exist()
      done()
    })
  })

  it('consumer can get a name', (done) => {
    consumer.get('name', (err, value) => {
      expect(err).to.not.exist()
      expect(value).to.equal('value')
      done()
    })
  }).timeout(10000)

  it('consumer can get a change on a name', (done) => {
    subscription = consumer.onChange('name', value => {
      expect(value).to.equal('value 2')
      done()
    })
    setTimeout(() => {
      producer.put('name', 'value 2', (err) => {
        expect(err).to.not.exist()
      })
    }, 1000)
  }).timeout(10000)

  it('consumer can cancel subscription', (done) => {
    subscription.cancel()
    done()
  })
})
