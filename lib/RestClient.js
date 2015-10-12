'use strict';
import request from 'request';

export class RestClient {

  fetchSitemap(serverAddress, sitemapName, callback) {
    var url = 'http://' + serverAddress + '/rest/sitemaps/' + sitemapName + '?type=json';
    try {
      request(url, function (error, response, body) {
        if (error) {
          throw error;
        }

        if (response.statusCode == 200) {
          callback(JSON.parse(body));
        }

        if (response.statusCode != 200) {
          throw new Error(
            'openHAB Rest interface returned ' + response.statusCode + ' for URL ' + url);
        }
      });
    } catch (e) {
      throw new Error ('error connecting openHAB Rest interface: ' + e.message);
    }
  }

}
