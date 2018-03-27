'use strict';

function format() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }
  return s;
};

var Help = function(guide, container, options, num) {
  this.guide = guide;
  this._distance = guide.distance || options.distance;
  this._color = guide.color || options.color;
  this._class = guide.cssClass || options.cssClass || '';
  this._timer = guide.timer || options.options.timer || 0;
  debugger;
  if (guide.attachTo != null) {
    guide.element = document.querySelector(guide.attachTo);
    if (guide.element != null) {
      this.currentElement = guide.element.addClass('htd-current-element');
    }
  }
  this.container = container;
  var html = "";
  var toolTip = this.toolTipize(this.guide);
  if (toolTip != "") {
    if (options.options.numero) {
      html = '<div>' + (num + 1) + ". " + toolTip + '</div>';
    } else {
      html = '<div>' + toolTip + '</div>';
    }
    this.helpBox = newElement("div", { class: 'htd-fade-in htd-help ' + this._class }, html);
    document.body.beforeEnd(this.helpBox);
    this._position();
  }
  if (this._timer > 0) {
    setTimer(this._timer);
  }

  return this;
};

var oldTimer = 0;

function setTimer(time) {
  if (oldTimer != 0) {
    window.clearTimeout(oldTimer);
    oldTimer = 0;
  }
  oldTimer = window.setTimeout(function() {
    Function.bind(__Helps);
    __Helps.next();
  }, time);
}

Help.prototype.toolTipize = function(helpItem) {
  if (helpItem.html != undefined) {
    return helpItem.html;
  }
  if (helpItem.htmlId != undefined) {
    return document.querySelector(helpItem.htmlId).html();
  }
  return "";
}


Help.prototype._arrowSize = 10;
Help.prototype._lineTemplate = 'M{0},{1} C{2},{3},{4},{5},{6},{7}';
Help.prototype._arrowTemplate = '<svg width="{0}" height="{1}">\
    <defs>\
        <marker id="arrow" refX="2" refY="6" markerWidth="20" markerHeight="20" orient="auto">\
            <path d="M2,1 L2,{3} L{3},6 L2,2" style="fill:{4};"></path>\
        </marker>\
    </defs>\
    <path id="line" d="{2}" class="{5}" style="stroke:{4}; stroke-width: 1.25px; fill: none; marker-end: url(#arrow);"></path>\
</svg>';

Help.prototype._renderLine = function(coord) {
  return format(this._lineTemplate, coord.x1, coord.y1, coord.dx1, coord.dy1, coord.dx2, coord.dy2, coord.x2, coord.y2);
};


Help.prototype._renderArrow = function() {
  this.helpBox.beforeEndHTML(
    format(this._arrowTemplate,
      this._width, this._distance, this[this.position](),
      this._arrowSize, this._color, this._class));
};


Help.prototype._getOscillation = function() {
  return Math.floor(Math.random() * 10) + 20;
};

Help.prototype._position = function() {
  if (this.currentElement) {
    this._attachToElement(this.currentElement);
    this.helpBox.beforeEnd(this.container);
    this._width = this.helpBox.outerWidth();
    this._height = this.helpBox.outerHeight();
    this._renderArrow();
  } else {
    this._center();
  }
  this.helpBox.scrollIntoView();
};

Help.prototype._center = function() {
  this.helpBox.beforeEnd(this.container);
  this.helpBox.css({
    position: "absolute",
    left: (window.innerWidth / 2) - (this.helpBox.outerWidth() / 2),
    textAlign: 'center',
    top: (window.innerHeight / 2) - (this.helpBox.outerHeight() / 2)
  }).show(true);
};

Help.prototype._attachToElement = function(elem) {
  var elOffset = elem.offset();
  var cr = document.body.getClientRects();
  var docWidth = cr[0].width;
  var docHeight = cr[0].height;
  var leftSpace = elOffset.left;
  var topSpace = elOffset.top;
  var highlightedElementWidth = this.currentElement.outerWidth();
  var highlightedElementHeight = this.currentElement.outerHeight();
  var rightSpace = docWidth - leftSpace - highlightedElementWidth;
  var bottomSpace = docHeight - topSpace - highlightedElementHeight;
  var css = {
    color: this._color,
    top: docHeight / 2 > elOffset.top ? elOffset.top : "auto",
    left: docWidth / 2 > elOffset.left ? elOffset.left : "auto",
    right: docWidth / 2 > elOffset.left ? "auto" : docWidth - elOffset.left - highlightedElementWidth,
    bottom: docHeight / 2 > elOffset.top ? "auto" : elOffset.bottom
  };
  if (elem.position != null) {
    debugger;
    css.top = elem.position.top;
    css.left = elem.position.left;
  }

  switch (Math.max(leftSpace, rightSpace, topSpace, bottomSpace)) {
    case leftSpace:
      this.position = "left";
      css.paddingRight = this._distance;
      css.right = document.body.clientWidth - elOffset.left;
      css.left = "auto";
      break;
    case topSpace:
      this.position = "top";
      css.paddingBottom = this._distance;
      css.bottom = document.body.clientHeight - elOffset.top;
      css.top = "auto";
      break;
    case rightSpace:
      this.position = "right";
      css.paddingLeft = this._distance;
      css.left = elOffset.left + highlightedElementWidth;
      css.right = "auto";
      break;
    default:
      this.position = "bottom";
      css.paddingTop = this._distance;
      css.top = elOffset.top + highlightedElementHeight;
      css.bottom = "auto";
      break;
  }
  this.helpBox.addClass("htd-" + this.position).css(css);
};



Help.prototype.top = function() {
  var coord = this._alignTop();
  return this._renderLine(coord);
};

Help.prototype.bottom = function() {
  var coord = this._alignBottom();
  return this._renderLine(coord);
};

Help.prototype.left = function() {
  var coord = this._alignLeft();
  return this._renderLine(coord);
};

Help.prototype.right = function() {
  var coord = this._alignRight();
  return this._renderLine(coord);
};




Help.prototype._alignBottom = function() {
  var x1 = this._width / 2,
    y1 = this._distance,
    x2 = Math.max(
      Math.min(
        this.currentElement.offset().left + (this.currentElement.outerWidth() / 2) - this.helpBox.offset().left,
        this._width - this._arrowSize),
      this._arrowSize),
    y2 = this._arrowSize;
  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    dx1: Math.max(0, Math.min(Math.abs((2 * x1) - x2) / 3, this._width) + this._getOscillation()),
    dy1: Math.max(0, y2 + (Math.abs(y1 - y2) * 3 / 4)),
    dx2: Math.max(0, Math.min(Math.abs(x1 - (x2 * 3)) / 2, this._width) - this._getOscillation()),
    dy2: Math.max(0, y2 + (Math.abs(y1 - y2) * 3 / 4))
  }
};

Help.prototype._alignTop = function() {
  var x1 = this._width / 2,
    y1 = 0,
    x2 = Math.max(
      Math.min(
        this.currentElement.offset().left + (this.currentElement.outerWidth() / 2) - this.helpBox.offset().left,
        this._width - this._arrowSize),
      this._arrowSize),
    y2 = this._distance - this._arrowSize;
  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    dx1: Math.max(0, Math.min(Math.abs((2 * x1) - x2) / 3, this._width) + this._getOscillation()),
    dy1: Math.max(0, y1 + (Math.abs(y1 - y2) * 3 / 4)),
    dx2: Math.max(0, Math.min(Math.abs(x1 - (x2 * 3)) / 2, this._width) - this._getOscillation()),
    dy2: Math.max(0, y1 + (Math.abs(y1 - y2) * 3 / 4))
  }
};

Help.prototype._alignLeft = function() {
  var x1 = this._width - this._distance,
    y1 = this._height / 2,
    x2 = this._width - this._arrowSize,
    y2 = Math.max(
      Math.min(
        this.currentElement.offset().top + (this.currentElement.outerHeight() / 2) - this.helpBox.offset().top,
        this._height - this._arrowSize),
      this._arrowSize);
  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    dx1: Math.max(0, x1 + Math.abs(x1 - x2) * 3 / 4),
    dy1: Math.max(0, Math.min(Math.abs((2 * y1) - y2) / 3, this._height) + this._getOscillation()),
    dx2: Math.max(0, x1 + Math.abs(x1 - x2) * 3 / 4),
    dy2: Math.max(0, Math.min(Math.abs(y1 - (y2 * 3)) / 2, this._height) + this._getOscillation())
  }
};

Help.prototype._alignRight = function() {
  var x1 = this._distance,
    y1 = this._height / 2,
    x2 = this._arrowSize,
    y2 = Math.max(
      Math.min(
        this.currentElement.offset().top + (this.currentElement.outerHeight() / 2) - this.helpBox.offset().top,
        this._height - this._arrowSize),
      this._arrowSize);
  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    dx1: Math.max(0, x2 + (Math.abs(x1 - x2) * 3 / 4)),
    dy1: Math.max(0, Math.min(Math.abs((2 * y1) - y2) / 3, this._height) + this._getOscillation()),
    dx2: Math.max(0, x2 + (Math.abs(x1 - x2) * 3 / 4)),
    dy2: Math.max(0, Math.min(Math.abs(y1 - (y2 * 3)) / 2, this._height) + this._getOscillation())
  }
};

Help.prototype.destroy = function() {
  if (this.currentElement != null) {
    this.currentElement.removeClass("htd-current-element");
  }
  if (this.helpBox != null) {
    this.helpBox.remove();
  }
};


/////////////////////////////////////////

var Helps = function(options) {
  this._current = 0;
  this.options = Object.assign(Helps.DEFAULTS, options);
  return this;
};

Helps.DEFAULTS = {
  distance: 100,
  color: '#fff',
  cssClass: '',
  items: []
};

Helps.prototype.start = function(numSlide) {
  this._current = numSlide || 0;
  this._renderCanvas()
    ._renderHelp(this.options.items[this._current], this._current);
  return this;
};

Helps.prototype.end = function() {
  if (this.canvas) {
    this.canvas.remove();
    this.canvas = null;
  }
  if (this._currentHelp) {
    this._currentHelp.destroy();
    this._currentHelp = null;
  }
  document.body.off("keyup", this._onDocumentKeyUp);
  return this;
};

Helps.prototype.next = function() {
  this._current++;
  if (this._current >= this.options.items.length) {
    this.end();
    return this;
  }
  this._renderHelp(this.options.items[this._current], this._current);
  return this;
};

Helps.prototype.prev = function() {
  if (this._current > 0) {
    this._current--;
    this._renderHelp(this.options.items[this._current], this._current);
  }
  return this;
};

Helps.prototype.goTo = function(slideNum) {
  if (!this._current) {
    return;
  }
  this._current = slideNum;
  this._renderHelp(this.options.items[this._current], this._current);
  return this;
};

Helps.prototype.destroy = function() {
  this.end();
};

Helps.prototype._renderCanvas = function() {
  this.canvas = newElement("div", { class: 'htd-canvas htd-fade-in' }, '<div class="htd-overlay"></div><div class="htd-mask"></div>');
  document.body.beforeEnd(this.canvas);
  __Helps = this;
  this.canvas.on("click", this._onCanvasClick);
  document.body.on("keyup", this._onDocumentKeyUp);
  return this;
};

Helps.prototype._renderHelp = function(help, num) {
  if (this._currentHelp) {
    this._currentHelp.destroy();
  }
  document.body.emit("beforeRenderHelp", { help: help, num: num });
  this._currentHelp = new Help(help, this.canvas, this.options, num);
  return this;
};

var __Helps = null;

Helps.prototype._onCanvasClick = function(e) {
  __Helps.next();
};

Helps.prototype._onDocumentKeyUp = function(e) {
  console.log(e.which);
  switch (e.which) {
    case 27: //esc
      __Helps.end();
      break;
    case 39: //right arrow
    case 32: //space
      __Helps.next();
      break;
    case 33: // top arrow
      __Helps.goTo(0);
      break;
    case 34: // bottom arrow
      __Helps.goTo(__Helps.options.items.length - 1);
      break;
    case 37: //left arrow
    case 8: //backspace
      e.preventDefault();
      __Helps.prev();
      break;
    default:
      break;
  }
};