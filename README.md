# ipfs-iiif-db

> IIIF annotations JS client over IPFS

# Instructions

## Install

```sh
$ npm install ipfs-iiif-db --save
```

## Import


In thr browser environment, you can either use this library by including it and bundling your app together with it (using browserify or webpack, for instance), or you can

### in Node.js or in a browser with a bundler:

```js
const DB = require('ipfs-iiif-db')
```

### Using a script tag in a browser

```html
<!-- loading the minified version -->
<script src="https://unpkg.com/ipfs-iiif-db/dist/index.min.js"></script>

<!-- loading the human-readable (not minified) version -->
<script src="https://unpkg.com/ipfs-iiif-db/dist/index.js"></script>
```

Now you can access this library using the `IpfsIiifDb` on the global namespace. (In this case, replace `DB` on the examples below with `IpfsIiifDb`).

## Instantiate

```js
const db = DB([options])
```

Arguments:
* options (object):
  * ipfs: a [js-ipfs options object](https://github.com/ipfs/js-ipfs#advanced-options-when-creating-an-ipfs-node)

# Annotation list

Get an annotations object:

```js
const annotationList = db.annotationList(id [, originalAnnotationList])
```

Arguments:

* id (string, mandatory): the unique id of this annotation list
* originalAnnotationList (object): the annotation list


## annotationList API:

### annotationList.set (key, value)

Set a annotation list attribute `key` to a given value

```js
annotationList.set('@context', 'http://iiif.io/api/search/0/context.json')
```

### annotationList.pushResource (resource)

Insert a resource at the end of the `resources` array.

```js
annotationList.pushResource({
  "@id": "https://wellcomelibrary.org/iiif/b18035723/annos/searchResults/a2h0r885,2553,282,46",
  "@type": "oa:Annotation",
  "motivation": "sc:painting",
  "resource": {
    "@type": "cnt:ContentAsText",
    "chars": "gediegenen"
  },
  "on": "https://wellcomelibrary.org/iiif/b18035723/canvas/c2#xywh=885,2553,282,46"
})
```

### putResource (index, resource)

Insert a resource at the given position inside the `resources` array.

```js
annotationList.putResource(3, {
  "@id": "https://wellcomelibrary.org/iiif/b18035723/annos/searchResults/a2h0r885,2553,282,46",
  "@type": "oa:Annotation",
  "motivation": "sc:painting",
  "resource": {
    "@type": "cnt:ContentAsText",
    "chars": "gediegenen"
  },
  "on": "https://wellcomelibrary.org/iiif/b18035723/canvas/c2#xywh=885,2553,282,46"
})
```

### deleteResourceAt (index)

Delete the resource at the given `index` position.

```js
annotationList.deleteResourceAt(3)
```

### getResources ()

Return the `resources` array.

```js
annotationList.getResources()
```

### pushHit (hit)

Insert a hit at the end of the `hits` array.

```js
annotationList.pushHit({
  "@id": "https://wellcomelibrary.org/iiif/b18035723/annos/searchResults/a2h0r885,2553,282,46",
  "@type": "oa:Annotation",
  "motivation": "sc:painting",
  "resource": {
    "@type": "cnt:ContentAsText",
    "chars": "gediegenen"
  },
  "on": "https://wellcomelibrary.org/iiif/b18035723/canvas/c2#xywh=885,2553,282,46"
})
```

### putHit (index, hit)

Insert a hit at the given position inside the `hits` array.

```js
annotationList.putHit(3, {
  "@id": "https://wellcomelibrary.org/iiif/b18035723/annos/searchResults/a2h0r885,2553,282,46",
  "@type": "oa:Annotation",
  "motivation": "sc:painting",
  "resource": {
    "@type": "cnt:ContentAsText",
    "chars": "gediegenen"
  },
  "on": "https://wellcomelibrary.org/iiif/b18035723/canvas/c2#xywh=885,2553,282,46"
})
```

### deleteHitAt (index)

Delete the hit at the given `index` position.

```js
annotationList.deleteHit(3)
```

### getHits ()

Return the `hits` array.

```js
annotationList.getHits()
```

### toJSON ()

Returns an object representation of the annotation list.

```js
console.log('current annotation list is: %j', annotationList.toJSON())
```


## AnnotationList Events

### "mutation" (event)

```js
annotationList.on('mutation', (event) => {
  console.log('new mutation', event)
  console.log('annotation list now is:', annotationList.toJSON())
})
```

Callback arguments:

* event (object):
  * type (string): can be 'add', 'update' or 'delete'
  * name (string): the attribute name
  * value (object): the new value, if applicable
  * oldValue (object): the previous value, if applicable

### "add" (event)

```js
annotationList.on('add', (event) => {
  console.log('added attribute', event.name)
  console.log('with value:', event.value)
})
```

Callback arguments:

* event (object):
  * name (string): the attribute name
  * value (object): the value of the attribute


### "update" (event)

```js
annotationList.on('update', (event) => {
  console.log('updated attribute', event.name)
  console.log('old value:', event.oldValue)
  console.log('new value:', event.value)
})
```

Callback arguments:

* event (object):
  * name (string): the attribute name
  * value (object): the new value of the attribute
  * oldValue (object): the old value of the attribute


### "delete" (event)

```js
annotationList.on('delete', (event) => {
  console.log('deleted attribute', event.name)
  console.log('old value:', event.oldValue)
})
```

Callback arguments:

* event (object):
  * name (string): the attribute name
  * oldValue (object): the old value of the attribute


### "resource inserted" (event)

```js
annotationList.on('resource inserted', (event) => {
  console.log('inserted resource at pos', event.index)
  console.log('with value:', event.value)
})
```

Callback arguments:

* event (object):
  * index (interger >= 0): the array index the insertion was done on
  * value (object): the value that was inserted


### "resource deleted" (event)

Callback arguments:

* event (object):
  * index (interger >= 0): the array index that was removed

### "hit inserted" (event)

Callback arguments:

* event (object):
  * index (interger >= 0): the array index the insertion was done on
  * value (object): the value that was inserted


### "hit deleted" (event)

Callback arguments:

* event (object):
  * index (interger >= 0): the array index that was removed

# License

MIT

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/pgte/ipfs-iiif-db/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
