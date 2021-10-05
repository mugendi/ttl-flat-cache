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

const cacheOpts = {
  // namespace to use
  ns: "shorticle-cache",
  // time to live
  // ttl: 3600 * 24,
//   dir: '/Directory-To-Save-Data'
};

const cache = require(".")(cacheOpts);

let key = "test-key",
  value = {tyope:"Object", name:"Some Fancy Object to cache"};

cache.set(key, value, 20);

console.log(cache.ttl(key));
console.log(cache.get(key));
