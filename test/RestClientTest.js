var should = require('should');
var nock = require('nock')
var restClient = require('../RestClient.js');

describe('test RestClient', function () {

  it('RestClient should fetch sitemap', function (done) {
    nock('http://openhab.test')
      .get('/rest/sitemaps/test.sitemap?type=json')
      .reply(200, '{}');

    restClient.fetchSitemap('openhab.test', 'test.sitemap',
      function callback(result) {
        done();
      });
  })

  it('RestClient should return proper object', function (done) {
    nock('http://openhab.test')
      .get('/rest/sitemaps/test.sitemap?type=json')
      .reply(200, '{ "homepage" : { "widget" : [] } }');

    restClient.fetchSitemap('openhab.test', 'test.sitemap',
      function callback(result) {
        result.should.have.property('homepage');
        result.homepage.should.have.property('widget');
        result.homepage.widget.should.be.instanceof(Array);
        done();
      });
  })

});
