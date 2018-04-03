"use strict";
(function() {

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
    this._class = guide.cssClass || options.cssClass || "";
    this._timer = guide.timer || options.timer || 0;
    if (guide.attachTo !== null) {
      guide.element = document.querySelector(guide.attachTo);
      if (guide.element !== null) {
        guide.element.addClass("htd-current-element");
      }
    }
    this.container = container;
    var html = "";
    var toolTip = this.toolTipize(this.guide);
    if (toolTip !== "") {
      if (options.numero) {
        html = "<div>" + (num + 1) + ". " + toolTip + "</div>";
      } else {
        html = "<div>" + toolTip + "</div>";
      }
      this.helpBox = newElement("div", { class: "htd-fade-in htd-help " + this._class }, html);
      document.body.beforeEnd(this.helpBox);
      if (guide.position) {
        var pos = Positionizer.getRelativePosition(guide.element,
          this.helpBox,
          guide.position.relative,
          guide.position.dx,
          guide.position.dy);
        Positionizer.setPosition(this.helpBox, pos);
        var attach1 = Positionizer.getAttach(guide.element, guide.position.attach1);
        var attach2 = Positionizer.getAttach(this.helpBox, guide.position.attach2);
        this.renderLine({ x1: attach1.left, y1: attach1.top, x2: attach2.left, y2: attach2.top });
      } else {
        this._position();
      }
    }
    if (this._timer > 0) {
      setTimer(this._timer);
    }

    return this;
  };

  var oldTimer = 0;

  function setTimer(time) {
    if (oldTimer !== 0) {
      window.clearTimeout(oldTimer);
      oldTimer = 0;
    }
    oldTimer = window.setTimeout(function() {
      Function.bind(__Helps);
      __Helps.next();
    }, time);
  }

  Help.prototype.toolTipize = function(helpItem) {
    if (helpItem.html !== undefined) {
      return helpItem.html;
    }
    if (helpItem.htmlId !== undefined) {
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

  var line = "<svg width={0} height={1}>\
  <path d='M{2} {3} L{4} {5}' style='stroke:red; stroke-width: 1.25px; fill: none;'></path> \
  </svg>";

  Help.prototype.RenderLine = function(coord) {
    debugger;
    var svg = format(line, Math.abs(coord.x2 - coord.x1), Math.abs(coord.y2 - coord.y1), coord.x1, coord.y1, coord.x2, coord.y2);
    this.helpBox.beforeEndHTML(svg);
  }

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
    if (this.guide.element) {
      this._attachToElement(this.guide);
    } else {
      this._center();
    }
    this.helpBox.beforeEnd(this.container);
    this.helpBox.scrollIntoView();
  };

  Help.prototype._center = function() {
    this.helpBox.css({
      position: "absolute",
      left: (window.innerWidth / 2) - (this.helpBox.outerWidth() / 2),
      textAlign: 'center',
      top: (window.innerHeight / 2) - (this.helpBox.outerHeight() / 2)
    }).show(true);
  };

  Help.prototype._attachToElement = function(help) {
    var elem = help.element;
    var elOffset = elem.offset();
    var cr = document.body.getClientRects();
    var docWidth = cr[0].width;
    var docHeight = cr[0].height;
    var leftSpace = elOffset.left;
    var topSpace = elOffset.top;
    var highlightedElementWidth = elem.outerWidth();
    var highlightedElementHeight = elem.outerHeight();
    var rightSpace = docWidth - leftSpace - highlightedElementWidth;
    var bottomSpace = docHeight - topSpace - highlightedElementHeight;
    var css = {
      color: this._color,
      top: docHeight / 2 > elOffset.top ? elOffset.top : "auto",
      left: docWidth / 2 > elOffset.left ? elOffset.left : "auto",
      right: docWidth / 2 > elOffset.left ? "auto" : docWidth - elOffset.left - highlightedElementWidth,
      bottom: docHeight / 2 > elOffset.top ? "auto" : elOffset.bottom
    };
    switch (Math.max(leftSpace, rightSpace, topSpace, bottomSpace)) {
      case leftSpace:
        this.position = "left";
        break;
      case topSpace:
        this.position = "top";
        break;
      case rightSpace:
        this.position = "right";
        break;
      default:
        this.position = "bottom";
        break;
    }

    var forceTop = (help.position !== null) ? help.position.top : null;
    var forceLeft = (help.position !== null) ? help.position.left : null;
    switch (Math.max(leftSpace, rightSpace, topSpace, bottomSpace)) {
      case leftSpace:
        css.paddingRight = this._distance;
        css.right = (document.body.clientWidth - elOffset.left) + "px";
        css.left = "auto";
        break;
      case topSpace:
        css.paddingBottom = this._distance;
        css.bottom = (document.body.clientHeight - elOffset.top) + "px";
        css.top = "auto";
        break;
      case rightSpace:
        css.paddingLeft = this._distance;
        css.left = (forceLeft || elOffset.left + highlightedElementWidth) + "px";
        css.right = "auto";
        break;
      default:
        css.paddingTop = this._distance;
        css.top = (forceTop || elOffset.top + highlightedElementHeight) + "px";
        css.bottom = "auto";
        break;
    }

    this.helpBox.addClass("htd-" + this.position).css(css);
    this._width = this.helpBox.outerWidth();
    this._height = this.helpBox.outerHeight();
    this._renderArrow();
  };



  Help.prototype.top = function() {
    var coord = this._alignTop(this.guide.element, this.helpBox);
    return this._renderLine(coord);
  };

  Help.prototype.bottom = function() {
    var coord = this._alignBottom(this.guide.element, this.helpBox);
    return this._renderLine(coord);
  };

  Help.prototype.left = function() {
    var coord = this._alignLeft(this.guide.element, this.helpBox);
    return this._renderLine(coord);
  };

  Help.prototype.right = function() {
    var coord = this._alignRight(this.guide.element, this.helpBox);
    return this._renderLine(coord);
  };




  Help.prototype._alignBottom = function(el1, el2) {
    var x1 = this._width / 2,
      y1 = this._distance,
      x2 = Math.max(
        Math.min(
          el1.offset().left + (el1.outerWidth() / 2) - el2.offset().left,
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

  Help.prototype._alignTop = function(el1, el2) {
    var x1 = this._width / 2,
      y1 = 0,
      x2 = Math.max(
        Math.min(
          el1.offset().left + (el1.outerWidth() / 2) - el2.offset().left,
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

  Help.prototype._alignLeft = function(el1, el2) {
    var x1 = this._width - this._distance,
      y1 = this._height / 2,
      x2 = this._width - this._arrowSize,
      y2 = Math.max(
        Math.min(
          el1.offset().top + (el1.outerHeight() / 2) - el2.offset().top,
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

  Help.prototype._alignRight = function(el1, el2) {
    var x1 = this._distance,
      y1 = this._height / 2,
      x2 = this._arrowSize,
      y2 = Math.max(
        Math.min(
          el1.offset().top + (el1.outerHeight() / 2) - el2.offset().top,
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
    if (this.element !== null) {
      this.element.removeClass("htd-current-element");
    }
    if (this.helpBox !== null) {
      this.helpBox.remove();
    }
  };


  /////////////////////////////////////////

  var Helps = function(data) {
    this._current = 0;
    this.data = data;
    this.data.options = Object.assign(Helps.DEFAULTS, data.options);
    return this;
  };

  Helps.DEFAULTS = {
    distance: 100,
    color: 'red',
    cssClass: '',
    items: []
  };

  Helps.prototype.start = function(numSlide) {
    this._current = numSlide || 0;
    this._renderCanvas()
      ._renderHelp(this.data.items[this._current], this._current);
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
    if (this._current >= this.data.items.length) {
      this.end();
    } else {
      this._renderHelp(this.data.items[this._current], this._current);
    }
    return this;
  };

  Helps.prototype.prev = function() {
    return this.goTo(this._current - 1);
  };

  Helps.prototype.goTo = function(slideNum) {
    if (slideNum >= 0 || slideNum < this.data.items.length) {
      this._current = slideNum;
      this._renderHelp(this.data.items[this._current], this._current);
    }
    return this;
  };

  Helps.prototype.destroy = function() {
    this.end();
  };

  Helps.prototype._renderCanvas = function() {
    this.canvas = newElement("div", { class: "htd-canvas htd-fade-in" }, "<div class='htd-overlay'></div><div class='htd-mask'></div>");
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
    this._currentHelp = new Help(help, this.canvas, this.data.options, num);
    return this;
  };

  var __Helps = null;

  Helps.prototype._onCanvasClick = function() {
    __Helps.next();
  };

  Helps.prototype._onDocumentKeyUp = function(e) {
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
        __Helps.goTo(__Helps.data.items.length - 1);
        break;
      case 37: //left arrow
      case 8: //backspace
        e.preventDefault();
        __Helps.prev();
        break;
      default:
        break;
    }
  }

})();