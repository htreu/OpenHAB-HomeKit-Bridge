var should = require('should');
var itemProvider = require('../ItemProvider');

describe('test ItemProvider', function () {

  it('empty sitemap should return empty list of items', function (done) {
    var result = itemProvider.parseSitemap({ homepage : { widget: [] }}, '');
    result.should.be.empty;
    done();
  });

  // load demo sitemap
  var sitemap = require('./resources/sitemap.json');

  it('demo sitemap should return 3 items', function (done) {
    var items = itemProvider.parseSitemap(sitemap, '');
    items.should.have.length(3);
    done();
  });

  it('demo sitemap should return items with all properties set', function (done) {
    var items = itemProvider.parseSitemap(sitemap, '');
    for (var i = 0; i < items.length; i++) {
      items[i].should.have.property('type');
      items[i].should.have.property('name');
      items[i].should.have.property('link');
      items[i].should.have.property('state');

      if (items[i].name === 'Toggle Switch') {
        items[i].state.should.equal('ON');
      }
    }
    done();
  })

  it('demo sitemap should return items with proper initial state', function (done) {
    var items = itemProvider.parseSitemap(sitemap, '');
    for (var i = 0; i < items.length; i++) {
      if (items[i].name === 'Toggle Switch') {
        items[i].state.should.equal('ON');
      }
      if (items[i].name === 'Volume') {
        items[i].state.should.equal('Uninitialized');
      }
    }
    done();
  })

  it('demo sitemap should return switch items when filtered', function (done) {
    var items = itemProvider.parseSitemap(sitemap, 'Switch');
    items.should.have.length(2);
    for (var i = 0; i < items.length; i++) {
      items[i]['type'].should.equal('Switch');
    }
    done();
  })

});
