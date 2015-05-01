var request = require('request');

function fetchSitemap(serverAddress, sitemapName, callback) {
  var url = 'http://' + serverAddress + '/rest/sitemaps/' + sitemapName + '?type=json';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(JSON.parse(body));
    }
    if (response.statusCode != 200) {
      throw new Error(
        'Error connecting OpenHAB Rest interface: ' + response.statusCode + ' for URL ' + url);
    }
    if (error) {
      throw error;
    }
  });
}

module.exports = {
  fetchSitemap : fetchSitemap
}
