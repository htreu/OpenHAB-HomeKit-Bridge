/**
 * Copyright 2016 Henning Treu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import request from 'request';

export class RestClient {

  fetchSitemap(serverAddress, sitemapName, callback) {
    let url = 'http://' + serverAddress + '/rest/sitemaps/' + sitemapName + '?type=json';
    try {
      request(url, function (error, response, body) {
        if (error) {
          callback(error);
        } else if (response.statusCode !== 200) {
          callback(new Error(
            'openHAB Rest interface returned ' + response.statusCode + ' for URL ' + url));
        } else if (response.statusCode === 200) {
          callback(undefined, JSON.parse(body));
        }
      });
    } catch (e) {
      throw new Error ('error connecting openHAB Rest interface: ' + e.message);
    }
  };

  fetchItem(itemURL, callback) {
    let url = itemURL + '?type=json';
    try {
      request(url, function (error, response, body) {
        if (error) {
          throw error;
        }

        if (response.statusCode === 200) {
          callback(JSON.parse(body));
        }

        if (response.statusCode !== 200) {
          throw new Error(
            'openHAB Rest interface returned ' + response.statusCode + ' for URL ' + url);
        }
      });
    } catch (e) {
      throw new Error ('error connecting openHAB Rest interface: ' + e.message);
    }
  };

}
