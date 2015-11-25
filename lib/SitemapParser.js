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
    return this.parseWidgets(widgets, widgetType);
  }

  parseWidgets(widgets, widgetType) {
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
        result.push(this.parseWidget(widget));
      }
    }
    return result;
  }

  parseWidget(widget) {
    if (widget.linkedPage && widget.linkedPage.widgets) {//for group items
      var groupWidgets = widget.linkedPage.widgets;
      var groupItems = this.parseWidgets(groupWidgets);
    }

    return ({
      type: widget.item.type,
      displayPattern: widget.item.stateDescription ? widget.item.stateDescription.pattern : null,
      tags: widget.item.tags ? widget.item.tags : null,
      name: widget.item.name,
      link: widget.item.link,
      state: widget.item.state,
      groupItems: groupItems
    });
  }

}
export { SitemapParser };
