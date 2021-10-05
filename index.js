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
  }

  invalidateKey(key) {
    aproba("S", arguments);

    //
    let data = this.cache.getKey(key);

    if (data && data.expires) {
      // let {expires} = data.expires;
      let expires = dayjs(data.expires),
        now = dayjs();
      // check if time has expired
      if (now.isAfter(expires)) {
        // remove key
        this.cache.removeKey(key);
        return null;
      } else {
        return dayjs.duration(expires.diff(now)).humanize(true);
      }
    }
  }

  get(key) {
    aproba("S", arguments);
    this.invalidateKey(key);

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
    return { key, expires: this.invalidateKey(key) };
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
