/* eslint-env mocha */
'use strict'

const DB = require('../')

describe('start and stop', () => {
  let db

  before(() => {
    db = DB()
  })

  it('starts', (done) => {
    db.start(done)
  })

  it('stops', (done) => {
    db.stop(done)
  })
})
