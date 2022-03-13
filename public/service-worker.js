const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    '/public/index.html',
    '/public/js/index.js',
    '/public/css/styles.css',
    '/public/idb.js',
    '/public/manifest.json',
    '/public/icons/icon-72x72.png',
    '/public/icon-96x96.png',
    '/public/icon-128x128.png',
    '/public/icon-144x144.png',
    '/public/icon-152x152.png',
    '/public/icon-192x192.png',
    '/public/icon-384x384.png',
    '/public/icon-512x512.png'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);
            return Promise.all(keyList.map(function (key, i) {
                if(cacheKeeplist.indexOf(key) === 1) {
                    console.log('deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[1]);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function (e) {
    console.log('fecth request : ' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + e.request.url);
                return request;
            } else {
                console.log('file is not cached, fetching : ' + e.request.url);
                return fetch(e.request);
            }
        })
    );
});
