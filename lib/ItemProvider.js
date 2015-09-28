class ItemProvider {

  constructor() {
      this.SWITCH_ITEM = "SwitchItem";
      this.DIMMER_ITEM = "DimmerItem";
      this.COLOR_ITEM = "ColorItem";
      this.ROLLERSHUTTER_ITEM = "RollershutterItem";
      this.TEMPERATURE_SENSOR = "NumberItem";
  }

  parseSitemap(sitemap, widgetType) {
    var widgets = [].concat(sitemap.homepage.widget);
    if (typeof widgets == 'undefined') {
      console.log("WARN: No items found");
      widgets = [];      
    } else if (!Array.isArray(widgets)) {
      // if there is only 1 item, "widgets" is an object and not an array
      widgets = [ widgets ];
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

export { ItemProvider };
