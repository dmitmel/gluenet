/* eslint-env browser, jquery */

String.prototype.replaceAt = function(index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  );
};

function getTextRect(text, options) {
  var element = document.createElement('span');

  element.classList.add('measured-text');
  var style = element.style;
  for (var option in options)
    if (options.hasOwnProperty(option)) style[option] = options[option];

  element.textContent = text;
  document.body.appendChild(element);
  var rect = element.getBoundingClientRect();
  document.body.removeChild(element);

  return rect;
}
