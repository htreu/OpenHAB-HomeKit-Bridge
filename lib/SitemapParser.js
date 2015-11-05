'use strict';

class SitemapParser {
  constructor() {
    // nop
  }

  parseSitemap(sitemap, widgetType) {
    if (sitemap.homepage.widget) {
      var widgets = sitemap.homepage.widget; //OpenHab 1
    } else if (sitemap.homepage.widgets) {
      widgets = sitemap.homepage.widgets; //OpenHab 2
    } else {
      return [];
    }
    var result = [];
    for (var i = 0; i < widgets.length; i++) {
      var widget = widgets[i];
      if (!widget.item) {
        // Don't log in tests.
        if (process.env.NODE_ENV != 'test') {
          console.log("WARN: The widget '" + widget.label + "' does not reference an item.");
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
