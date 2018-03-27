'use strict';

function format() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }
  return s;
};

var Guide = function(guide, container, options, num) {
  this.guide = guide;
  this._distance = guide.distance || options.distance;
  this._color = guide.color || options.color;
  this._class = guide.cssClass || options.cssClass || '';
  if (guide.attachTo != null) {
    guide.element = document.querySelector(guide.attachTo);
    if (guide.element != null) {
      this.currentElement = guide.element.addClass('guides-current-element');
    }
  }
  this.container = container;
  var html = "";
  if (options.options.numero) {
    html = '<div>' + (num + 1) + ". " + this.guide.html + '</div>';
  } else {
    html = '<div>' + this.guide.html + '</div>';
  }
  this.helpBox = newElement("div", { class: 'guides-fade-in guides-guide ' + this._class }, html);
  document.body.beforeEnd(this.helpBox);
  this._position();
  return this;
};

Guide.prototype._arrowSize = 10;
Guide.prototype._path = 'M{0},{1} C{2},{3},{4},{5},{6},{7}';
Guide.prototype._arrowTemplate = '<svg width="{0}" height="{1}">\
    <defs>\
        <marker id="arrow" refX="2" refY="6" markerWidth="20" markerHeight="20" orient="auto">\
            <path d="M2,1 L2,{3} L{3},6 L2,2" style="fill:{4};"></path>\
        </marker>\
    </defs>\
    <path id="line" d="{2}" class="{5}" style="stroke:{4}; stroke-width: 1.25px; fill: none; marker-end: url(#arrow);"></path>\
</svg>';



Guide.prototype._position = function() {
  if (this.currentElement) {
    this._attachToElement();
    this.helpBox.beforeEnd(this.container);
    this._width = this.helpBox.outerWidth();
    this._height = this.helpBox.outerHeight();
    this._renderArrow();
  } else {
    this._center();
  }
  this.helpBox.scrollIntoView();
};

Guide.prototype._center = function() {
  //.css('visibility', 'hidden')
  this.helpBox.beforeEnd(this.container);
  //.addClass('guides-center')
  this.helpBox.css({
    position: "absolute",
    left: (window.innerWidth / 2) - (this.helpBox.outerWidth() / 2),
    textAlign: 'center',
    top: (window.innerHeight / 2) - (this.helpBox.outerHeight() / 2)
  }).show(true);
};

Guide.prototype._attachToElement = function() {
  var elOffset = this.currentElement.offset();
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
    top: docHeight / 2 > elOffset.top ? elOffset.top : 'auto',
    left: docWidth / 2 > elOffset.left ? elOffset.left : 'auto',
    right: docWidth / 2 > elOffset.left ? 'auto' : docWidth - elOffset.left - highlightedElementWidth,
    bottom: docHeight / 2 > elOffset.top ? 'auto' : elOffset.bottom
  };

  switch (Math.max(leftSpace, rightSpace, topSpace, bottomSpace)) {
    case leftSpace:
      this.position = 'left';
      css.paddingRight = this._distance;
      css.right = document.body.clientWidth - elOffset.left;
      css.left = 'auto';
      break;
    case topSpace:
      this.position = 'top';
      css.paddingBottom = this._distance;
      css.bottom = document.body.clientHeight - elOffset.top;
      css.top = 'auto';
      break;
    case rightSpace:
      this.position = 'right';
      css.paddingLeft = this._distance;
      css.left = elOffset.left + highlightedElementWidth;
      css.right = 'auto';
      break;
    default:
      this.position = 'bottom';
      css.paddingTop = this._distance;
      css.top = elOffset.top + highlightedElementHeight;
      css.bottom = 'auto';
      break;
  }
  this.helpBox.addClass('guides-' + this.position).css(css);
};

Guide.prototype._renderArrow = function() {
  this.helpBox.beforeEndHTML(
    format(this._arrowTemplate,
      this._width, this._distance, this[this.position](),
      this._arrowSize, this._color, this._class));
};

Guide.prototype.top = function() {
  var coord = this._verticalAlign();
  return this._getPath(coord);
};

Guide.prototype.bottom = function() {
  var coord = this._verticalAlign(true);
  return this._getPath(coord);
};

Guide.prototype.left = function() {
  var coord = this._horizontalAlign();
  return this._getPath(coord);
};

Guide.prototype.right = function() {
  var coord = this._horizontalAlign(true);
  return this._getPath(coord);
};

Guide.prototype._getPath = function(coord) {
  return format(this._path, coord.x1, coord.y1, coord.dx1, coord.dy1, coord.dx2, coord.dy2, coord.x2, coord.y2);
};

Guide.prototype._getFluctuation = function() {
  return Math.floor(Math.random() * 30) + 20;
};

Guide.prototype._verticalAlign = function(bottom) {
  var x1 = this._width / 2,
    y1 = bottom ? this._distance : 0,
    x2 = Math.max(
      Math.min(
        this.currentElement.offset().left + (this.currentElement.outerWidth() / 2) - this.helpBox.offset().left,
        this._width - this._arrowSize),
      this._arrowSize),
    y2 = bottom ? this._arrowSize : this._distance - this._arrowSize;
  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    dx1: Math.max(0, Math.min(Math.abs((2 * x1) - x2) / 3, this._width) + this._getFluctuation()),
    dy1: bottom ?
      Math.max(0, y2 + (Math.abs(y1 - y2) * 3 / 4)) : Math.max(0, y1 + (Math.abs(y1 - y2) * 3 / 4)),
    dx2: Math.max(0, Math.min(Math.abs(x1 - (x2 * 3)) / 2, this._width) - this._getFluctuation()),
    dy2: bottom ?
      Math.max(0, y2 + (Math.abs(y1 - y2) * 3 / 4)) : Math.max(0, y1 + (Math.abs(y1 - y2) * 3 / 4))
  }
};

Guide.prototype._horizontalAlign = function(right) {
  var x1 = right ? this._distance : this._width - this._distance,
    y1 = this._height / 2,
    x2 = right ? this._arrowSize : this._width - this._arrowSize,
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
    dx1: right ?
      Math.max(0, x2 + (Math.abs(x1 - x2) * 3 / 4)) : Math.max(0, x1 + Math.abs(x1 - x2) * 3 / 4),
    dy1: Math.max(0, Math.min(Math.abs((2 * y1) - y2) / 3, this._height) + this._getFluctuation()),
    dx2: right ?
      Math.max(0, x2 + (Math.abs(x1 - x2) * 3 / 4)) : Math.max(0, x1 + Math.abs(x1 - x2) * 3 / 4),
    dy2: Math.max(0, Math.min(Math.abs(y1 - (y2 * 3)) / 2, this._height) + this._getFluctuation())
  }
};

Guide.prototype._scrollIntoView = function() {
  if (this.currentElement.length === 0) {
    $('html,body').animate({
      scrollTop: 0
    }, 500);
    return;
  }
  var guideOffset = this.helpBox.offset(),
    top = guideOffset.top,
    bottom = guideOffset.top + this.helpBox.outerHeight(),
    left = guideOffset.left,
    right = guideOffset.left + this.helpBox.outerWidth(),
    scrollTop = $(document).scrollTop(),
    scrollLeft = $(document).scrollLeft();

  //scroll vertically to element if it is not visible in the view port
  if (scrollTop > top || scrollTop + $(window).height() < bottom) {
    $('html,body').animate({
      scrollTop: this.position === 'bottom' ? top - 100 : top
    }, 500);
  }

  //scroll horizontally to element if it is not visible in the view port
  if (scrollLeft > left || scrollLeft + $(window).width() < right) {
    $('html,body').animate({
      scrollLeft: this.position === 'righ' ? left - 100 : left
    }, 500);
  }
};

Guide.prototype.destroy = function() {
  if (this.currentElement != null) {
    this.currentElement.removeClass('guides-current-element');
  }
  this.helpBox.remove();
};


/////////////////////////////////////////

var Guides = function(options) {
  this._current = 0;
  this.options = Object.assign(Guides.DEFAULTS, options);
  return this;
};

Guides.DEFAULTS = {
  distance: 100,
  color: '#fff',
  cssClass: '',
  guides: []
};

Guides.prototype.start = function(e) {
  if (e) {
    e.preventDefault();
  }
  if (this._isAlreadyRunning()) {
    return this;
  }
  this._current = 0;
  this._renderCanvas()
    ._renderGuide(this.options.guides[this._current], this._current)
    ._callback('start');
  return this;
};

Guides.prototype.end = function() {
  if (this.canvas) {
    this.canvas.remove();
    this.canvas = null;
  }
  if (this._currentGuide) {
    this._currentGuide.destroy();
    this._currentGuide = null;
  }
  document.body.off('keyup.guides');
  this._callback('end');
  return this;
};

Guides.prototype.next = function() {
  console.log("next");
  this._renderGuide(this.options.guides[++this._current], this._current)
    ._callback('next');
  return this;
};

Guides.prototype.prev = function() {
  if (!this._current) {
    return;
  }
  this._renderGuide(this.options.guides[--this._current], this._current)
    ._callback('prev');
  return this;
};

Guides.prototype.goTo = function(slideNum) {
  if (!this._current) {
    return;
  }
  this._current = slideNum;
  this._renderGuide(this.options.guides[this._current], this._current)
    ._callback('goTo');
  return this;
};

Guides.prototype.destroy = function() {
  this.end();
  this.$element.off('click.guides');
  this._callback('destroy');
  return this;
};

Guides.prototype._callback = function(eventName) {
  var callback = this.options[eventName],
    eventObject = {
      sender: this
    };

  if (this._currentGuide) {
    eventObject.$element = this._currentGuide.guide.element;
    eventObject.helpBox = this._currentGuide.$element;
  }

  if (typeof callback === "function") {
    callback.apply(this, [eventObject]);
  }
};

Guides.prototype._isAlreadyRunning = function() {
  return !!this.canvas;
};

Guides.prototype._renderCanvas = function() {
  this.canvas = newElement("div", { class: 'guides-canvas guides-fade-in' }, '<div class="guides-overlay"></div><div class="guides-mask"></div>');
  document.body.beforeEnd(this.canvas);
  __Guides = this;
  this.canvas.on('click', this._onCanvasClick);
  document.body.on('keyup', this._onDocumentKeyUp);
  return this;
};

Guides.prototype._renderGuide = function(guide, num) {
  if (!guide) {
    this.end();
    return this;
  }

  if (this._currentGuide) {
    this._currentGuide.destroy();
  }

  this._callback('render', guide);

  if (typeof guide.render === "function") {
    guide.render.apply(this, [guide]);
  }

  this._currentGuide = new Guide(guide, this.canvas, this.options, num);
  return this;
};

var __Guides = null;

Guides.prototype._onCanvasClick = function(e) {
  console.log("_onCanvasClick");
  //this.next();
  __Guides.next();
};

Guides.prototype._onDocumentKeyUp = function(e) {
  console.log("_onDocumentKeyUp", e.which);
  switch (e.which) {
    case 27: //esc
      __Guides.end();
      break;
    case 39: //right arrow
    case 32: //space
      __Guides.next();
      break;
    case 37: //left arrow
    case 8: //backspace
      e.preventDefault();
      __Guides.prev();
      break;
    default:
      break;
  }
};