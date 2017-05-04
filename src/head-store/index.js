'use strict'

module.exports = process.browser ? require('./browser-store') : require('./memory-store')
