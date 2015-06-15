import should from 'should';
import nock from 'nock';
import { RestClient } from '../lib/RestClient.js';

process.env.NODE_ENV = 'test';

describe('RestClient', function () {

  it('should fetch sitemap', function (done) {
    nock('http://openhab.test')
      .get('/rest/sitemaps/test.sitemap?type=json')
      .reply(200, '{}');

    new RestClient().fetchSitemap('openhab.test', 'test.sitemap',
      function callback(result) {
        done();
      });
  })

  it('should return proper object', function (done) {
    nock('http://openhab.test')
      .get('/rest/sitemaps/test.sitemap?type=json')
      .reply(200, '{ "homepage" : { "widget" : [] } }');

    new RestClient().fetchSitemap('openhab.test', 'test.sitemap',
      function callback(result) {
        result.should.have.property('homepage');
        result.homepage.should.have.property('widget');
        result.homepage.widget.should.be.instanceof(Array);
        done();
      });
  })

});
