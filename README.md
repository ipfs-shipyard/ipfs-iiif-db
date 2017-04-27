# ipfs-iiif-annotations

> IIIF annotations JS client over IPFS

# Instructions

## Install

## Include

In your HTML:

```html
<script src="..."></sript>
```

## Use

### start


```js
iia.start([callback])
```

### create a producer

```js
const producer = iiia.producer()
```

#### produce a change

```js
producer.put(id, value, callback)
```

The id needs to be a string, but the value can be any JS object that can be represented in JSON.

### create a consumer

```js
const consumer = iiia.consumer()
```

#### Listen for changes

```js
const subscription = consumer.onChange(id, (newValue) => {
  console.log('new value is: %j', newValue)
})
```

#### Cancel subscription

The consumer `onChange` function returns a subscription object that you can cancel:

```js
subscription.cancel()
```


### stop


```js
iia.stop([callback])
```


# License

MIT

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-unixfs-engine/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
