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

import should from 'should';
import nock from 'nock';
import { RestClient } from '..';

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
  });

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
  });

  // it('should throw exception on connection error', function (done) {
  //   let restClient = new RestClient();
  //   (function() {
  //     restClient.fetchSitemap(undefined, 'test.sitemap', null);
  //   }).should.throw();
  //   done();
  // });

});
