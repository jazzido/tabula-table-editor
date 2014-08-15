/* jshint undef: true, unused: true */
/* global $, _, console, document */

(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition();
  else if (typeof define == 'function' && define.amd) define(definition);
  else context[name] = definition();
})('RectangularSelector', this, function (name, context) {

var rectangularSelector = function(pdfListView, options) {
    var isDragging = false;
    var target = null;
    var start = null;
    var options = _.extend({
        selector: options.selector || 'div.page-view canvas',
        start: function() {},
        end: function() {},
        drag: function() {}
    }, options);
    var fullSelector = options.selector + ', .selection-box';
    this.box = $('<div></div>').addClass('selection-box').appendTo($('body'));
    var self = this;

    $(document).on({
        mousedown: function(event) {
            target = this;
            isDragging = true;
            start = { x: event.pageX, y: event.pageY };
            self.box.css({
                'top': event.clientY,
                'left': event.clientX,
                'width': 0,
                'height': 0,
                'visibility': 'visible'
            });
            options.start(event);
        },

        mousemove: function(event) {
            if (!isDragging || ($(event.target).is(options.selector) && event.target !== target)) {
                return;
            }
            var ds = {
                'left': Math.min(start.x, event.pageX),
                'top': Math.min(start.y, event.pageY),
                'width': Math.abs(start.x - event.pageX),
                'height': Math.abs(start.y - event.pageY)
            };
            self.box.css(ds);
            options.drag(ds);
        },

        mouseup: function(event) {
            if (isDragging) { // selection ended
                var pvs = pdfListView.listView.pageViews, targetPageView;
                for (var i = 0; i < pvs.length; i++) {
                    if (pvs[i].canvas == target) {
                        targetPageView = pvs[i];
                        break;
                    }
                }
                var cOffset = $(target).offset();

                var d = {
                  'absolutePos': _.extend(cOffset,
                    {
                      'top': parseFloat(self.box.css('top')),
                      'left': parseFloat(self.box.css('left')),
                      'width': parseFloat(self.box.css('width')),
                      'height': parseFloat(self.box.css('height'))
                    }),
                  'relativePos': {
                    'width': parseFloat(self.box.css('width')),
                    'height': parseFloat(self.box.css('height')),
                    'top': parseFloat(self.box.css('top')) - cOffset.top,
                    'left': parseFloat(self.box.css('left')) - cOffset.left
                  },
                  'pageView': targetPageView
                };
                options.end(d);
            }
            target = null;
            start = null;
            isDragging = false;
            self.box.css('visibility', 'hidden');
        }
    }, fullSelector);
};

return rectangularSelector;

});
