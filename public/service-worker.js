var CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
// const APP_PREFIX = "my-site-cache-";

var FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/manifest.json",
    "/index.js",
    "/styles.css",
    "/dist/bundle.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

self.addEventListener("install", function(event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        console.log("Opened cache");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  });

  // self.addEventListener("activate", event => {
  //   event.waitUntil(
  //     caches
  //       .keys()
  //       .then(keyList => {
  //         // return array of cache names that are old to delete
  //       let cacheKeepList = keyList.filter(function(key) {
  //           return key.indexOf(APP_PREFIX);
  //       })
  //       cacheKeepList.push(CACHE_NAME);
  //         return Promise.all(
  //           cachesToDelete.map(function (key, i) {
  //               if(cacheKeepList.indexOf(key) === -1) {
  //                   return caches.delete(keyList[i]);
  //               }
  //           })
  //         );
  //       })
  //   );
  // });


self.addEventListener("fetch", function(event) {
    // cache get requests /api 
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              // clone and store in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request).then(function(response) {
          if (response) {
            return response;
          } else if (event.request.headers.get("accept").includes("text/html")) {
            // return the cached home page for all requests for html pages
            return caches.match("/");
          }
        });
      })
    );
});
  