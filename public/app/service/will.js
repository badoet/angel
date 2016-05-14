angular.module('davinc')
  .service('Will', [
    '$rootScope',

    function($rootScope) {

      var self = this;

      self.backgroundColor = Module.Color.WHITE;
      self.color = Module.Color.from(204, 204, 204);
      self.strokes = [];

      this.init = function(width, height) {
        self.initInkEngine(width, height);
        self.initEvents();
      };

      this.initInkEngine = function(width, height) {
        canvas = document.getElementById("canvas");
        console.log(canvas);
        self.canvas = new Module.InkCanvas(canvas, width, height);
        console.log(self.canvas);
        self.strokesLayer = self.canvas.createLayer();

        self.clear();

        self.brush = new Module.SolidColorBrush();

        self.pathBuilder = new Module.SpeedPathBuilder();
        self.pathBuilder.setNormalizationConfig(5, 210);
        self.pathBuilder.setPropertyConfig(Module.PropertyName.Width, 1, 3.2, NaN, NaN, Module.PropertyFunction.Sigmoid, 0.6, true);

        self.smoothener = new Module.MultiChannelSmoothener(self.pathBuilder.stride);

        self.strokeRenderer = new Module.StrokeRenderer(self.canvas);
        self.strokeRenderer.configure({brush: self.brush, color: self.color});
      };

      this.initEvents = function() {
        $(Module.canvas).on("mousedown", function(e) {self.beginStroke(e);});
        $(Module.canvas).on("mousemove", function(e) {self.moveStroke(e);});
        $(document).on("mouseup", function(e) {self.endStroke(e);});
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
          self.canvas.blend(self.strokesLayer, {rect: self.strokeRenderer.updatedArea});

          self.strokeRenderer.blendUpdatedArea();
        }
        else if (self.inputPhase == Module.InputPhase.End) {
          self.strokeRenderer.draw(self.pathPart, true);
          self.strokeRenderer.blendStroke(self.strokesLayer, Module.BlendMode.NORMAL);

          self.canvas.clear(self.strokeRenderer.strokeBounds, self.backgroundColor);
          self.canvas.blend(self.strokesLayer, {rect: self.strokeRenderer.strokeBounds});
        }
      };

      this.clear = function() {
        self.strokes = [];

        self.strokesLayer.clear(self.backgroundColor);
        self.canvas.clear(self.backgroundColor);
      };

      return this;
    }
  ]);
