/* eslint-env mocha */
'use strict'

// const chai = require('chai')
// chai.use(require('dirty-chai'))
// const expect = chai.expect

const iia = require('../')

describe('start and stop', () => {
  it('starts', (done) => {
    iia.start(done)
  })

  it('stops', (done) => {
    iia.stop(done)
  })
})
