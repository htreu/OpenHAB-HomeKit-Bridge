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

import debug from 'debug'; let logger = debug('SitemapParser');

class SitemapParser {
  constructor() {
    // nop
  }

  parseSitemap(sitemap) {
    let widgets = [].concat(sitemap.homepage.widget);
    let result = [];
    for (let i = 0; i < widgets.length; i++) {
      let widget = widgets[i];
      // parse Frames (Outlets)
      if (this.looksLikeOutletFrame(widget)) {
        let outlets = this.parseOutlets([].concat(widget.widget));
        result = result.concat(outlets);
        continue;
      }

      let parsedWidget = this.parseWidget(widget);
      if (parsedWidget) {
        result.push(parsedWidget);
      }
    }

    return result;
  }

  parseOutlets(widgets) {
    let result = [];
    for (let i = 0; i < widgets.length; i++) {
      let parsedWidget = this.parseWidget(widgets[i]);
      if (parsedWidget) {
        result.push(parsedWidget);
      }
    }

    return result;
  }

  parseWidget(widget) {
    if (!widget.item) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV !== 'test') {
        logger("WARN: The widget '" + widget.label + "' does not reference an item.");
      }
      return;
    }
    return {
      type: widget.type,
      itemType: widget.item.type,
      name: widget.label,
      link: widget.item.link,
      state: widget.item.state
    }
  }

  looksLikeOutletFrame(widget) {
    return widget.type === 'Frame'
      && (widget.icon === 'outlet' || widget.label === 'outlet');
  }

};

export { SitemapParser };
