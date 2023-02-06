// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const cacheName = 'OpenNumismat-Mobile-0.6.0';
const filesToCache = [
  '/open-numismat-app/',
  '/open-numismat-app/index.html',
  '/stylesheets/jquery.mobile-1.4.5.min.css',
  '/stylesheets/mobile.css',
  '/stylesheets/images/ajax-loader.gif',
  '/javascripts/jquery-1.12.4.min.js',
  '/javascripts/jquery.mobile-1.4.5.min.js',
  '/open-numismat-app/js/i18next.min.js',
  '/open-numismat-app/js/jquery-i18next.min.js',
  '/open-numismat-app/js/i18n.js',
  '/open-numismat-app/js/app.js',
  '/open-numismat-app/js/worker.sql-wasm.js',
  '/open-numismat-app/js/sql-wasm.wasm',
  '/open-numismat-app/manifest.json',
  '/open-numismat-app/img/icon-144.png',
  '/open-numismat-app/img/icon-152.png',
  '/open-numismat-app/img/icon-192.png',
  '/open-numismat-app/img/icon-512.png',
  '/open-numismat-app/img/demo.png',
  '/open-numismat-app/img/pass.png',
  '/open-numismat-app/img/owned.png',
  '/open-numismat-app/img/ordered.png',
  '/open-numismat-app/img/bidding.png',
  '/open-numismat-app/img/sold.png',
  '/open-numismat-app/img/sale.png',
  '/open-numismat-app/img/wish.png',
  '/open-numismat-app/img/missing.png',
  '/open-numismat-app/img/duplicate.png',
  '/open-numismat-app/i18n/web_i18n_bg.json',
  '/open-numismat-app/i18n/web_i18n_ca.json',
  '/open-numismat-app/i18n/web_i18n_de.json',
  '/open-numismat-app/i18n/web_i18n_el.json',
  '/open-numismat-app/i18n/web_i18n_en.json',
  '/open-numismat-app/i18n/web_i18n_es.json',
  '/open-numismat-app/i18n/web_i18n_fa.json',
  '/open-numismat-app/i18n/web_i18n_fr.json',
  '/open-numismat-app/i18n/web_i18n_it.json',
  '/open-numismat-app/i18n/web_i18n_nl.json',
  '/open-numismat-app/i18n/web_i18n_pl.json',
  '/open-numismat-app/i18n/web_i18n_pt.json',
  '/open-numismat-app/i18n/web_i18n_ru.json',
  '/open-numismat-app/i18n/web_i18n_tr.json',
  '/open-numismat-app/i18n/web_i18n_uk.json'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        console.log('[ServiceWorker] Removing old cache', key);
        caches.delete(key);
      }));
    })
  );
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell', cacheName);
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
/*
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          console.log('[Service Worker] Fetch from web', e.request.url);
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
*/
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */

    e.respondWith(
      caches.match(e.request).then(function(response) {
        console.log('[Service Worker] Fetch from cash', e.request.url);
        return response || fetch(e.request);
      })
    );
});
