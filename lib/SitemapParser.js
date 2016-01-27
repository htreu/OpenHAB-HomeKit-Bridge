'use strict';

import debug from 'debug'; let logger = debug('SitemapParser');

class SitemapParser {
  constructor() {
    // nop
  }

  parseSitemap(sitemap, widgetType) {
    var widgets = [].concat(sitemap.homepage.widget);
    var result = [];
    for (var i = 0; i < widgets.length; i++) {
      var widget = widgets[i];
      if (!widget.item) {
        /* istanbul ignore next */
        if (process.env.NODE_ENV != 'test') {
          logger("WARN: The widget '" + widget.label + "' does not reference an item.");
        }
        continue;
      }
      if (!widgetType || widget.item.type == widgetType) {
        result.push(
          {
            type: widget.item.type,
            name: widget.label,
            link: widget.item.link,
            state: widget.item.state
          }
        );
      }
    }
    return result;
  }

};

export { SitemapParser };
