# Why?
[flat-cache](https://www.npmjs.com/package/flat-cache) is amazing and I wanted to extend it to add a TLL (key expiry) feature.

## Using

```javascript

    //Some cache options
    const cacheOpts = {
      // namespace to use
      ns: "shorticle-cache",
      // time to live
      ttl: 3600 * 24,
      //dir: '/Directory-To-Save-Data'
    };
    
    const cache = require(".")(cacheOpts);
    
    let key = "test-key",
      value = {tyope:"Object", name:"Some Fancy Object to cache"};
    
    cache.set(key, value, 30);
    
    console.log(cache.ttl(key));
    console.log(cache.get(key));

```

This will print:

```javascript

    { key: 'test-key', expires: 'in a few seconds' }
    { tyope: 'Object', name: 'Some Fancy Object to cache' }

```

**NOTE:** 
- ttl defaults to null, meaning no expiry.
- you can use .get(), .set() and .del() methods which map to flat-caches .getKey(), .setKey() and .removeKey() respectively.
- all option values are optional