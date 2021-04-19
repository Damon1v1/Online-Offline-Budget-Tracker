const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const APP_PREFIX = "my-site-cache-";

const FILES_TO_CACHE = [
    //"/",
    "/db.js",
    "/manifest.json",
    "/index.js",
    "/styles.css",
    "/dist/bundle.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        console.log("Opened cache");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  });

  self.addEventListener("activate", event => {
    event.waitUntil(
      caches
        .keys()
        .then(keyList => {
          // return array of cache names that are old to delete
        let cacheKeepList = keyList.filter(function(key) {
            return key.indexOf(APP_PREFIX);
        })
        cacheKeepList.push(CACHE_NAME);
          return Promise.all(
            cachesToDelete.map(function (key, i) {
                if(cacheKeepList.indexOf(key) === -1) {
                    return caches.delete(keyList[i]);
                }
            })
          );
        })
    );
  });


self.addEventListener("fetch", function(evt) {
    // cache get requests /api 
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // clone and store in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function() {
        return caches.match(evt.request).then(function(response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get("accept").includes("text/html")) {
            // return the cached home page for all requests for html pages
            return caches.match("/");
          }
        });
      })
    );
});
  