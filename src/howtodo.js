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
  this._current = 0;
  this._renderCanvas()
    // ._renderGuide(this.options.guides[this._current])
    // ._callback('start')
  ;
  return this;
};


Guides.prototype._renderCanvas = function() {
  debugger;
  this.$canvas = newElement("div");
  this.$canvas.addClass('guides-canvas guides-fade-in');
  this.$canvas.html('<div class="guides-overlay"></div><div class="guides-mask"></div>');
  document.body.insertAdjacentElement("beforeend", this.$canvas.html());
  this._bindNavigation();
  return this;
};

Guides.prototype._renderGuide = function(guide) {
  if (!guide) { //no more guides
    this.end();
    return this;
  }

  if (this._currentGuide) {
    this._currentGuide.destroy();
  }

  //this._callback('render', guide);

  guide.render.apply(this, [guide]);

  this._currentGuide = new Guide(guide, this.$canvas, this.options);
  return this;
};

Guides.prototype._bindNavigation = function() {
  this.$canvas.on('onclick', this._onCanvasClick);
  document.body.on('onkeyup', this._onDocKeyUp);
  return this;
}

Guides.prototype._onCanvasClick = function(e) {
  console.log("_onCanvasClick");
  this.next();
};

Guides.prototype._onDocKeyUp = function(e) {
  console.log("_onDocKeyUp");
  switch (e.which) {
    case 27: //esc
      this.end();
      break;
    case 39: //right arrow
    case 32: //space
      this.next();
      break;
    case 37: //left arrow
    case 8: //backspace
      e.preventDefault();
      this.prev();
      break;
    default:
      break;
  }
};