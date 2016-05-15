angular.module('davinc')
  .service('Will', [
    '$rootScope', "$timeout", "$q", "$http",

    function($rootScope, $timeout, $q, $http) {

      var self = this;

      self.backgroundColor = Module.Color.TRANSPERENT;
      self.brushColor = Module.Color.from(204, 204, 204);
      self.eraserColor =  Module.Color.from(255, 255, 255);

      self.color = self.brushColor;
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

        self.blendNormal = Module.BlendMode.NORMAL;
        self.blendErase = Module.BlendMode.ERASE;
        self.blend = self.blendNormal;

        self.pathBuilder = new Module.SpeedPathBuilder();
        self.pathBuilder.setNormalizationConfig(5, 210);
        self.pathBuilder.setPropertyConfig(Module.PropertyName.Width, 1, 3.2, NaN, NaN, Module.PropertyFunction.Sigmoid, 0.6, true);

        self.smoothener = new Module.MultiChannelSmoothener(self.pathBuilder.stride);

        self.strokeRenderer = new Module.StrokeRenderer(self.canvas);
        self.useBrush(); // use brush as default

        Module.InkDecoder.getStrokeBrush = function(paint) {
          return self.brush;
        };
      };

      this.useBrush = function() {
        self.color = self.brushColor;
        self.blend = self.blendNormal;
        $rootScope.state.brush = "brush";
        self.pathBuilder.setPropertyConfig(Module.PropertyName.Width, 1, 3.2, NaN, NaN, Module.PropertyFunction.Sigmoid, 0.6, true);
        self.setStrokeConfig();
      };

      this.useEraser = function() {
        self.color = self.eraserColor;
        self.blend = self.blendErase;
        $rootScope.state.brush = "eraser";
        self.pathBuilder.setPropertyConfig(Module.PropertyName.Width, 10, 20, NaN, NaN, Module.PropertyFunction.Sigmoid, 0.6, true);
        self.setStrokeConfig();
      };

      this.setStrokeConfig = function() {
        self.brush = new Module.SolidColorBrush();
        self.strokeRenderer.configure({brush: self.brush, color: self.color});
      };

      this.initEvents = function() {
        $(Module.canvas).on("mousedown", function(e) {self.beginStroke(e);});
        $(Module.canvas).on("mousemove", function(e) {self.moveStroke(e);});
        $(document).on("mouseup", function(e) {self.endStroke(e);});
        canvas.oncontextmenu = function(e) {
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
          self.strokeRenderer.blendStroke(self.userLayer, self.blend);

          self.canvas.clear(self.strokeRenderer.strokeBounds, self.backgroundColor);
          self.canvas.blend(self.userLayer, {rect: self.strokeRenderer.strokeBounds});
        }
      };

      this.undo = function() {
        removedStroke = self.strokes.pop();
        if(removedStroke) self.redraw(removedStroke.bounds);
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
        self.userLayer.clear();
        self.canvas.clear();
      };

      this.load = function(file) {
        var reader = new FileReader();

        reader.onload = function(e) {
          self.clear();
          console.log(new Uint8Array(e.target.result));
          var strokes = Module.InkDecoder.decode(new Uint8Array(e.target.result));
          console.log(strokes);
          self.strokes.pushArray(strokes);
          console.log(strokes);
          self.redraw(strokes.bounds);
        };

        reader.readAsArrayBuffer(file);
      };

      this.save = function() {
        var data = Module.InkEncoder.encode(self.strokes);
        saveAs(data, "export.data", "application/octet-stream");
      };

      return this;
    }
  ]);
