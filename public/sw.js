/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

'use strict';

var CACHE_NAME = 'meetat-cache-v1';

/* eslint-disable max-len */

const applicationServerPublicKey = 'AAAA89vDMwM:APA91bFOnhrm6729CGwXTeKIUXiUzW4Ja_AovhAO_GmKrz_NFq8fL-LJWcjG3H7VbG2zP45js9ox9hNVAsdAiWgLpbEwFsut4UYT4FFUQOxeN5jNDaOnKAkrXeebalHAbdCi9QDHujQAjPYlWFcAII42Ce2jxR6NXg';

/* eslint-enable max-len */

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

self.addEventListener('activate', function () {
})

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                const REQUEST_DELICATE = '/request-resource/?url=';
                const requestResource = event.request.url.indexOf(REQUEST_DELICATE) != -1;

                var fetchRequest;

                if (requestResource) {
                    let altUrl = decodeURIComponent(event.request.url.split(REQUEST_DELICATE)[1]);
                    let options = {};

                    for (var k in event.request) {
                        if (typeof (event.request[k]) != 'function' && k != 'url') {
                            options[k] = event.request[k];
                        }
                    }

                    fetchRequest = new Request(altUrl, options);
                } else {
                    fetchRequest = event.request.clone();
                }

                return fetch(fetchRequest).then((response) => {
                    if (requestResource) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200) {
                            if (response.type !== 'basic') {

                            }

                            console.log(fetchRequest.url + ' has cached.');
                            var responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(function (cache) {
                                    cache.put(event.request.url, responseToCache);
                                });
                        }
                    }

                    return response;
                });
            })
    );
});
