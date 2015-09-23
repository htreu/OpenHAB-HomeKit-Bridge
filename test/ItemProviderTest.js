import should from 'should';
import { ItemProvider } from '../lib/ItemProvider';

process.env.NODE_ENV = 'test';

describe('ItemProvider', function () {

  var itemProvider = new ItemProvider();

  it('should return empty list of items for emtpy sitemap', function (done) {
    var result = itemProvider.parseSitemap({ homepage : { widget: [] }}, '');
    result.should.be.empty;
    done();
  });

  // load demo sitemap
  var sitemap = require('./resources/sitemap.json');

  it('should return 6 items for demo sitemap', function (done) {
    var items = itemProvider.parseSitemap(sitemap, '');
    items.should.have.length(6);
    done();
  });

  it('should return items with all properties set for demo sitemap', function (done) {
    var items = itemProvider.parseSitemap(sitemap, '');
    for (var i = 0; i < items.length; i++) {
      items[i].should.have.property('type');
      items[i].should.have.property('name');
      items[i].should.have.property('link');
      items[i].should.have.property('state');
    }
    done();
  });

  it('should return items with proper initial state for demo sitemap', function (done) {
    var items = itemProvider.parseSitemap(sitemap, '');
    for (var i = 0; i < items.length; i++) {
      switch (items[i].name) {
        case 'Toggle Switch':
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

  it('should return switch items when filtered', function (done) {
    var items = itemProvider.parseSitemap(sitemap, itemProvider.SWITCH_ITEM);
    items.should.have.length(2);
    for (var i = 0; i < items.length; i++) {
      items[i]['type'].should.equal('SwitchItem');
    }
    done();
  });

  it('should return dimmer items when filtered', function (done) {
    var items = itemProvider.parseSitemap(sitemap, itemProvider.DIMMER_ITEM);
    items.should.have.length(1);
    for (var i = 0; i < items.length; i++) {
      items[i]['type'].should.equal('DimmerItem');
    }
    done();
  });

  it('should return one item for single item sitemap', function (done) {
    var sitemap = require('./resources/sitemap_single_item.json');
    var items = itemProvider.parseSitemap(sitemap);
    items.should.have.length(1);
    done();
  });

});
