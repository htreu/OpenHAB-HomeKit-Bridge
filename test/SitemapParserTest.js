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
import { SitemapParser, ElementType } from '../index';

process.env.NODE_ENV = 'test';

describe('SitemapParser', function () {

  let sitemapParser = new SitemapParser();
  let elementType = new ElementType();

  it('should return empty list of items for emtpy sitemap', function (done) {
    let result = sitemapParser.parseSitemap({ homepage : { widget: [] }}, '');
    result.should.be.empty;
    done();
  });

  // load demo sitemap
  let sitemap = require('./resources/sitemap.json');

  it('should return 7 items for demo sitemap', function (done) {
    let items = sitemapParser.parseSitemap(sitemap, '');
    items.should.have.length(7);
    done();
  });

  it('should return items with all properties set for demo sitemap', function (done) {
    let items = sitemapParser.parseSitemap(sitemap, '');
    for (let i = 0; i < items.length; i++) {
      items[i].should.have.property('type');
      items[i].should.have.property('itemType');
      items[i].should.have.property('name');
      items[i].should.have.property('link');
      items[i].should.have.property('state');
    }
    done();
  });

  it('should return items with proper initial state for demo sitemap', function (done) {
    let items = sitemapParser.parseSitemap(sitemap, '');
    for (let i = 0; i < items.length; i++) {
      switch (items[i].name) {
        case 'Toggle Switch':
          items[i].state.should.equal('ON');
          break;
        case 'Outlet':
          items[i].state.should.equal('ON');
          break;
        case 'Dimmed Light':
          items[i].state.should.equal('80');
          break;
        case 'RGB Light':
          items[i].state.should.equal('144.32432432432432,41.340782122905026,70.19607843137254');
          break;
      }
    }
    done();
  });

  it('should return one item for single item sitemap', function (done) {
    let sitemap = require('./resources/sitemap_single_item.json');
    let items = sitemapParser.parseSitemap(sitemap);
    items.should.have.length(1);
    done();
  });

});
