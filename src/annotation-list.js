'use strict'

module.exports = function createAnnotationList (initialValue) {
  const options = Object.assign({}, this.yDefaultOptions, {
    share: {
      annotationList: 'Map'
    }
  })
  const yPromise = Y(options)

  yPromise.then((y) => {
    y.share.annotationList.set('resources', 'Array')
    y.share.annotationList.set('hits', 'Array')
  })

  return yPromise
}
