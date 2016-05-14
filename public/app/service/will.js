angular.module('davinc')
  .service('Will', [
    '$rootScope',

    function($rootScope) {

      var self = this;

      self.backgroundColor = Module.Color.TRANSPARENT;
      self.color = Module.Color.from(204, 204, 204);
      self.strokes = [];
      var canvas = document.getElementById("canvas");

      this.init = function(width, height) {
        self.initInkEngine(width, height);
        self.initEvents();
      };

      this.initInkEngine = function(width, height) {

        self.canvas = new Module.InkCanvas(canvas, width, height);
        self.teacherLayer = self.canvas.createLayer();
        self.userLayer = self.canvas.createLayer();

        self.clear();

        self.brush = new Module.SolidColorBrush();

        self.pathBuilder = new Module.SpeedPathBuilder();
        self.pathBuilder.setNormalizationConfig(5, 210);
        self.pathBuilder.setPropertyConfig(Module.PropertyName.Width, 1, 3.2, NaN, NaN, Module.PropertyFunction.Sigmoid, 0.6, true);

        self.smoothener = new Module.MultiChannelSmoothener(self.pathBuilder.stride);

        // self.brushColor = Module.Color.from(204, 204, 204);
        // self.eraserColor = Module.Color.TRANSPARENT;
        // self.color = self.brushColor;

        self.strokeRenderer = new Module.StrokeRenderer(self.canvas);
        self.useBrush(); // use brush as default
      };

      this.useBrush = function() {
        self.color = Module.Color.from(204, 204, 204);
        $rootScope.state.brush = "brush";
        self.setStrokeConfig();
      };

      this.useBrush = function() {
        self.color = Module.Color.TRANSPARENT;
        $rootScope.state.brush = "eraser";
        self.setStrokeConfig();
      };

      this.setStrokeConfig = function() {
        self.strokeRenderer.configure({brush: self.brush, color: self.color});
      };

      this.initEvents = function() {
        $(Module.canvas).on("mousedown", function(e) {self.beginStroke(e);});
        $(Module.canvas).on("mousemove", function(e) {self.moveStroke(e);});
        $(document).on("mouseup", function(e) {self.endStroke(e);});
        canvas.oncontextmenu = function(e) {
          console.log("UNDO");
          self.undo();
          e.preventDefault();
        };
      };

      this.beginStroke = function(e) {
        if (e.button !== 0) return;

        self.inputPhase = Module.InputPhase.Begin;

        self.buildPath({x: e.clientX, y: e.clientY});
        self.drawPath();
      };

      this.moveStroke = function(e) {
        if (!self.inputPhase) return;

        self.inputPhase = Module.InputPhase.Move;
        self.pointerPos = {x: e.clientX, y: e.clientY};

        if (self.frameID !== self.canvas.frameID) {
          self.frameID = self.canvas.requestAnimationFrame(function() {
            if (self.inputPhase && self.inputPhase == Module.InputPhase.Move) {
              self.buildPath(self.pointerPos);
              self.drawPath();
            }
          }, true);
        }
      };

      this.endStroke = function(e) {
        if (!self.inputPhase) return;

        self.inputPhase = Module.InputPhase.End;

        self.buildPath({x: e.clientX, y: e.clientY});
        self.drawPath();

        var stroke = new Module.Stroke(self.brush, self.path, NaN, self.color, 0, 1);
        self.strokes.push(stroke);

        delete self.inputPhase;
      };

      this.buildPath = function(pos) {
        if (self.inputPhase == Module.InputPhase.Begin)
          self.smoothener.reset();

        var pathPart = self.pathBuilder.addPoint(self.inputPhase, pos, Date.now()/1000);
        var smoothedPathPart = self.smoothener.smooth(pathPart, self.inputPhase == Module.InputPhase.End);
        var pathContext = self.pathBuilder.addPathPart(smoothedPathPart);

        self.pathPart = pathContext.getPathPart();
        self.path = pathContext.getPath();

        if (self.inputPhase == Module.InputPhase.Move) {
          var preliminaryPathPart = self.pathBuilder.createPreliminaryPath();
          var preliminarySmoothedPathPart = self.smoothener.smooth(preliminaryPathPart, true);

          self.preliminaryPathPart = self.pathBuilder.finishPreliminaryPath(preliminarySmoothedPathPart);
        }
      };

      this.drawPath = function() {
        if (self.inputPhase == Module.InputPhase.Begin) {
          self.strokeRenderer.draw(self.pathPart, false);
          self.strokeRenderer.blendUpdatedArea();
        }
        else if (self.inputPhase == Module.InputPhase.Move) {
          self.strokeRenderer.draw(self.pathPart, false);
          self.strokeRenderer.drawPreliminary(self.preliminaryPathPart);

          self.canvas.clear(self.strokeRenderer.updatedArea, self.backgroundColor);
          self.canvas.blend(self.userLayer, {rect: self.strokeRenderer.updatedArea});

          self.strokeRenderer.blendUpdatedArea();
        }
        else if (self.inputPhase == Module.InputPhase.End) {
          self.strokeRenderer.draw(self.pathPart, true);
          self.strokeRenderer.blendStroke(self.userLayer, Module.BlendMode.NORMAL);

          self.canvas.clear(self.strokeRenderer.strokeBounds, self.backgroundColor);
          self.canvas.blend(self.userLayer, {rect: self.strokeRenderer.strokeBounds});
        }
      };

      this.undo = function() {
        removedStroke = self.strokes.pop();
        self.redraw(removedStroke.bounds);
      };

      this.redraw = function(dirtyArea) {
        if (!dirtyArea) dirtyArea = self.canvas.bounds;
        dirtyArea = Module.RectTools.ceil(dirtyArea);
        self.userLayer.clear(dirtyArea);
        self.canvas.clear(dirtyArea);
        self.strokes.forEach(function(stroke) {
          if (Module.RectTools.intersect(stroke.bounds, dirtyArea)) {
            this.strokeRenderer.draw(stroke);
            this.strokeRenderer.blendStroke(self.userLayer, stroke.blendMode);
          }
        }, self);
        self.refresh(dirtyArea);
      };

      this.refresh = function(dirtyArea) {
        self.canvas.blend(self.userLayer, {rect: Module.RectTools.ceil(dirtyArea)});
      };

      this.clear = function() {
        self.strokes = [];
        self.userLayer.clear(self.backgroundColor);
        self.canvas.clear(self.backgroundColor);
      };

      return this;
    }
  ]);
