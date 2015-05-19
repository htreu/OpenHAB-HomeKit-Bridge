function parseSitemap(sitemap, widgetType) {
  var widgets = sitemap.homepage.widget;
  var result = [];
  for (var i = 0; i < widgets.length; i++) {
    var widget = widgets[i];
    if (!widgetType || widget.type == widgetType) {
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
