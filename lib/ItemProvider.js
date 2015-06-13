function parseSitemap(sitemap, widgetType) {
  var widgets = sitemap.homepage.widget;
  var result = [];
  for (var i = 0; i < widgets.length; i++) {
    var widget = widgets[i];
    if (!widgetType || widget.type == widgetType) {
      if (!widget.item) {
        // TODO find a better way of logging. Don't log in tests.
        console.log("WARN: The widget '" + widget.label + "' does not reference an item.");
        continue;
      }

      result.push(
        {
          type: widget.type,
          name: widget.label,
          link: widget.item.link,
          state: widget.item.state
        }
      );
    }
  }
  return result;
}

module.exports = {
  parseSitemap: parseSitemap
};
