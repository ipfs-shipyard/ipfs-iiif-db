/* eslint-env mocha */
'use strict'

const IpfsIiifAnnotations = require('../')

describe('start and stop', () => {
  let iia

  before(() => {
    iia = IpfsIiifAnnotations()
  })

  it('starts', (done) => {
    iia.start(done)
  })

  it('stops', (done) => {
    iia.stop(done)
  })
})
