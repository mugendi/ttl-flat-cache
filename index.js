// Copyright 2021 Anthony Mugendi
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2021 Anthony Mugendi
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require("fs-extra"),
  os = require("os"),
  path = require("path"),
  flatCache = require("flat-cache"),
  aproba = require("aproba"),
  dayjs = require("dayjs"),
  duration = require("dayjs/plugin/duration"),
  relativeTime = require("dayjs/plugin/relativeTime");

//   extend dayjs
dayjs.extend(duration);
dayjs.extend(relativeTime);

class Cache {
  constructor(options) {
    aproba("O", arguments);

    options = Object.assign({ ns: "default", ttl: 3600 }, options);

    let { ns, dir, ttl } = options;

    ns = ns || "default";

    dir = dir && fs.existsSync(path.dirname(dir)) ? dir : null;

    dir = path.join(os.tmpdir(), "cache", ns);

    // loads the cache, if one does not exists for the given
    this.defaultTTL = isNaN(Number(ttl)) ? null : Number(ttl);
    
    this.cache = flatCache.load(ns, dir);

    this.getKey = this.get;
    this.setKey = this.set;
    this.removeKey = this.del;
    this.clearAll = this.cache.clearAll;
    this.clearCacheById = this.cache.clearCacheById;
  }

  __is_expired(expires, returnTTL = false) {
    let exp, now;

    if (expires) {
      exp = dayjs(expires);
      now = dayjs();

      if (returnTTL) {
        return dayjs.duration(exp.diff(now)).humanize(true);
      }

      return now.isAfter(exp);
    }

    return false;
  }

  __invadidate_key(key) {
    aproba("S", arguments);

    //
    let data = this.cache.getKey(key);

    if (data && data.expires) {
      // check if time has expired
      if (this.__is_expired(data.expires)) {
        // remove key
        this.cache.removeKey(key);
        return null;
      } else {
        let resp = this.__is_expired(data.expires, true);
        return resp ? resp : null;
      }
    }
  }

  all() {
    let data = this.cache.all();

    for (let key in data) {
      if (this.__is_expired(data.expires)) {
        data[key] = null;
        this.cache.removeKey(key);
      } else {
        data[key] = data[key].value;
      }
    }

    console.log(data);

    return data;
  }

  get(key) {
    aproba("S", arguments);
    this.__invadidate_key(key);

    let data = this.cache.getKey(key);

    if (data) {
      return data.value;
    }

    return null;
  }

  del(key) {
    aproba("S", arguments);
    return this.cache.removeKey(key);
  }

  ttl(key) {
    aproba("S", arguments);
    return { key, expires: this.__invadidate_key(key) };
  }

  set(key, value, ttl) {
    aproba("S*N|S*", arguments);

    let self = this;

    ttl = ttl || this.defaultTTL;

    let data = {
      expires: ttl ? dayjs().add(ttl, "seconds").toDate() : null,
      value,
    };

    self.cache.setKey(key, data);

    return self.cache.save();

    console.log({ key, value, ttl });
  }
}

module.exports = (options = {}) => new Cache(options);
