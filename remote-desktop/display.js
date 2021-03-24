/* eslint-env browser, jquery */
/* global getTextRect */

function Display(element) {
  element = $(element);
  var $window = $(window);

  var fontRect = getTextRect('0', {
    fontFamily: element.css('font-family'),
    fontSize: element.css('font-size'),
    lineHeight: element.css('line-height')
  });

  var fontWidth = fontRect.right - fontRect.left,
    fontHeight = fontRect.bottom - fontRect.top;

  this.calcSize = function calcSize() {
    this.width = Math.floor($window.width() / fontWidth);
    this.height = Math.floor($window.height() / fontHeight);
  };

  this.viewportToDisplay = function viewportToDisplay(x, y) {
    return {
      x: Math.floor(x / fontWidth),
      y: Math.floor(y / fontHeight)
    };
  };

  this.clear = function clear() {
    var text = '';
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) text += ' ';
      text += '\n';
    }
    element.text(text);
  };

  this.write = function write(x, y, str) {
    var text = element.text();
    text = text.replaceAt(x + y * (this.width + 1), str);
    element.text(text);
  };

  this.fill = function fill(x, y, width, height, char) {
    var text = '';
    for (var offsetX = 0; offsetX < width; offsetX++) text += char;
    for (var offsetY = 0; offsetY < height; offsetY++)
      this.write(x, y + offsetY, text);
  };

  this.copy = function copy(x, y, width, height, tx, ty) {
    var buffer = '';
    var text = element.text();

    for (var offsetY = 0; offsetY < height; offsetY++) {
      var i = x + (y + offsetY) * (this.width + 1);
      buffer += text.substr(i, width);
    }
    for (var bufferY = 0; bufferY < height; bufferY++) {
      var bufferI = bufferY * width;
      this.write(tx, ty + bufferY, buffer.substr(bufferI, width));
    }
  };

  this.calcSize();
  this.clear();
}
