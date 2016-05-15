angular.module('davinc')
  .service('Will', [
    '$rootScope', "$timeout", "$q", "$http",

    function($rootScope, $timeout, $q, $http) {

      var self = this;

      self.strokes = [];
      self.redrawStrokesArray = [];

      var canvas = document.getElementById("canvas");

      this.init = function(width, height) {
        self.drawToAutoStrokeId = 0;
        self.currentStrokeId = 0;
        self.redrawIntervalId = -1;
        self.canUpdate = false;

        self.backgroundColor = Module.color.TRANSPERENT;
        self.brushColor = Module.color.from(255, 100, 100);
        self.eraserColor =  Module.color.from(255, 255, 255);

        self.color = self.brushColor;

        self.initInkEngine(width, height);
        self.initEvents();
      };

      this.initInkEngine = function(width, height) {

        self.canvas = new Module.InkCanvas(width, height);
        self.teacherLayer = self.canvas.createLayer();
        self.autoDrawLayer = self.canvas.createLayer();
        self.userLayer = self.canvas.createLayer();

        self.blendNormal = Module.BlendMode.NORMAL;
        self.blendErase = Module.BlendMode.ERASE;
        self.blend = self.blendNormal;

        // self.pathBuilder = new Module.SpeedPathBuilder();
        // self.pathBuilder.setNormalizationConfig(5, 210);

        self.speedPathBuilder = new Module.SpeedPathBuilder();
        self.speedPathBuilder.setNormalizationConfig(182, 3547);
        self.speedPathBuilder.setPropertyConfig(Module.PropertyName.Width, 4.05, 34.53, 0.72, NaN, Module.PropertyFunction.Power, 1.19, false);

        if (window.PointerEvent) {
          self.pressurePathBuilder = new Module.PressurePathBuilder();
          self.pressurePathBuilder.setNormalizationConfig(0.195, 0.88);
          self.pressurePathBuilder.setPropertyConfig(Module.PropertyName.Width, 4.05, 34.53, 0.72, NaN, Module.PropertyFunction.Power, 1.19, false);
        }

        self.smoothener = new Module.MultiChannelSmoothener(self.speedPathBuilder.stride);

        self.strokeRenderer = new Module.StrokeRenderer(self.canvas);
        self.useBrush(); // use brush as default

        // init auto draw brush
        self.autoDrawBrush = new Module.DirectBrush();
        self.autoDrawStrokeRenderer = new Module.StrokeRenderer(self.canvas);

        self.clear();
      };

      this.useBrush = function() {
        self.color = self.brushColor;
        self.blend = self.blendNormal;
        $rootScope.state.brush = "brush";
        self.pathBuilder = isNaN(self.pressure)?self.speedPathBuilder:self.pressurePathBuilder;
        self.pathBuilder.setPropertyConfig(Module.PropertyName.Width, 4, 3.2, NaN, NaN, Module.PropertyFunction.Sigmoid, 1, true);
        self.setStrokeConfig();
      };

      this.useEraser = function() {
        self.color = self.eraserColor;
        self.blend = self.blendErase;
        $rootScope.state.brush = "eraser";
        self.pathBuilder = isNaN(self.pressure)?self.speedPathBuilder:self.pressurePathBuilder;
        self.pathBuilder.setPropertyConfig(Module.PropertyName.Width, 10, 20, NaN, NaN, Module.PropertyFunction.Sigmoid, 0.6, true);
        self.setStrokeConfig();
      };

      this.setStrokeConfig = function() {
        self.brush = new Module.SolidColorBrush();
        self.strokeRenderer.configure({brush: self.brush, color: self.color});
      };

      this.initEvents = function() {
        if (window.PointerEvent) {
          Module.canvas.addEventListener("pointerdown", function(e) {self.beginStroke(e);});
          Module.canvas.addEventListener("pointermove", function(e) {self.moveStroke(e);});
          document.addEventListener("pointerup", function(e) {self.endStroke(e);});
        }
        else {
          Module.canvas.addEventListener("mousedown", function(e) {self.beginStroke(e);});
          Module.canvas.addEventListener("mousemove", function(e) {self.moveStroke(e);});
          document.addEventListener("mouseup", function(e) {self.endStroke(e);});

          if (window.TouchEvent) {
            Module.canvas.addEventListener("touchstart", function(e) {self.beginStroke(e);});
            Module.canvas.addEventListener("touchmove", function(e) {self.moveStroke(e);});
            document.addEventListener("touchend", function(e) {self.endStroke(e);});
          }
        }
        Module.canvas.oncontextmenu = function(e) {
          self.undo();
          e.preventDefault();
        };
      };

      this.getPressure = function(e) {
        return (window.PointerEvent && e instanceof PointerEvent && e.pressure !== 0.5)?e.pressure:NaN;
      };

      this.beginStroke =  function(e) {
        if (e.button !== 0) return;

        self.inputPhase = Module.InputPhase.Begin;
        self.pressure = self.getPressure(e);
        self.pathBuilder = isNaN(self.pressure)?self.speedPathBuilder:self.pressurePathBuilder;

        self.buildPath({x: e.clientX, y: e.clientY});
        self.strokeRenderer.draw(self.pathPart, true);
        self.strokeRenderer.blendUpdatedArea();
      };

      this.moveStroke = function(e) {
        if (!self.inputPhase) return;

        self.pointerPos = {x: e.clientX, y: e.clientY};

        self.inputPhase = Module.InputPhase.Move;
        self.pressure = self.getPressure(e);
        if (self.intervalID) return;

        var lastPointerPos = self.pointerPos;
        self.drawPoint();

        self.intervalID = setInterval(function() {
          if (self.inputPhase && lastPointerPos != self.pointerPos) {
            self.drawPoint();
            lastPointerPos = self.pointerPos;
          }
        }, 16);
      };

      this.endStroke = function(e) {
        if (!self.inputPhase) return;

        self.inputPhase = Module.InputPhase.End;
        self.pressure = self.getPressure(e);

        clearInterval(self.intervalID);
        delete self.intervalID;

        self.buildPath({x: e.clientX, y: e.clientY});
        self.strokeRenderer.draw(self.pathPart, true);
        self.strokeRenderer.blendStroke(self.userLayer, self.blend);

        self.canvas.clearArea(self.strokeRenderer.updatedArea, self.backgroundColor);
        self.canvas.blendWithRect(self.userLayer, self.strokeRenderer.updatedArea, Module.BlendMode.NORMAL);

        var stroke = new Module.Stroke(self.brush, self.path, NaN, self.color, 0, 1);
        self.strokes.push(stroke);

        delete self.inputPhase;
      };

      this.buildPath = function(pos) {
        if (self.inputPhase == Module.InputPhase.Begin)
          self.smoothener.reset();

        self.pathBuilder = isNaN(self.pressure)?self.speedPathBuilder:self.pressurePathBuilder;
        var pathPart = self.pathBuilder.addPoint(self.inputPhase, pos, Date.now()/1000);
        var smoothedPathPart = self.smoothener.smooth(pathPart, self.inputPhase === Module.InputPhase.End);
        var pathContext = self.pathBuilder.addPathPart(smoothedPathPart);

        self.pathPart = pathContext.getPathPart();
        self.path = pathContext.getPath();

        var preliminaryPathPart = self.pathBuilder.createPreliminaryPath();
        var preliminarySmoothedPathPart = self.smoothener.smooth(preliminaryPathPart, true);

        self.preliminaryPathPart = self.pathBuilder.finishPreliminaryPath(preliminarySmoothedPathPart);
      };

      this.drawPoint = function() {
        self.buildPath(self.pointerPos);

        self.strokeRenderer.draw(self.pathPart, false);
        self.strokeRenderer.drawPreliminary(self.preliminaryPathPart);

        self.canvas.clearArea(self.strokeRenderer.updatedArea, self.backgroundColor);
        self.canvas.blendWithRect(self.userLayer, self.strokeRenderer.updatedArea, Module.BlendMode.NORMAL);

        self.strokeRenderer.blendUpdatedArea();
      };

      this.undo = function() {
        removedStroke = self.strokes.pop();
        if(removedStroke) self.redraw(removedStroke.bounds);
      };

      this.redraw = function(dirtyArea) {
        if (!dirtyArea) dirtyArea = self.canvas.bounds;
        dirtyArea = RectTools.ceil(dirtyArea);

        self.userLayer.clearArea(dirtyArea, self.backgroundColor);

        self.strokes.forEach(function(stroke) {
          var affectedArea = RectTools.intersect(stroke.bounds, dirtyArea);
          if (affectedArea) self.userLayer.draw(stroke);
        }, this);

        self.refresh(dirtyArea);
      };

      this.refresh = function(dirtyArea) {
        if (dirtyArea)
          self.canvas.blendWithRect(self.userLayer, RectTools.ceil(dirtyArea), Module.BlendMode.NORMAL);
        else
          self.canvas.blendWithMode(self.userLayer, Module.BlendMode.NORMAL);
      };

      this.clear = function() {
        self.strokes = [];
        self.redrawStrokesArray = [];

        self.userLayer.clear(self.backgroundColor);
        self.autoDrawLayer.clear(self.backgroundColor);

        self.canvas.clear(self.backgroundColor);
      };

      this.loadAndRedraw = function(dirtyArea) {
        if (!dirtyArea) dirtyArea = self.canvas.bounds;
        dirtyArea = RectTools.ceil(dirtyArea);

        self.autoDrawLayer.clearArea(dirtyArea, self.backgroundColor);

        self.drawToAutoStrokeId = 2;
        self.currentStrokeId = 0;

        self.redrawStroke(0);
      };

      this.drawAStrokeSlowly = function(stroke, start, callback, id) {
        var points = [];
        var end = 0;
        if (start === 0) {
          end = 12;
        }
        // next 8 points is not the end?
        else if (start + 3 < stroke.path.points.length) {
          // yes, do only 4 points
          end = start + 3;
        } else {
          // no, do from current to end
          end = stroke.path.points.length;
        }
        for (var index = 0; index < end; index++) {
          points.push(stroke.path.points[index]);
        }
        self.pathBuilder = isNaN(self.pressure)?self.speedPathBuilder:self.pressurePathBuilder;
        var path = self.pathBuilder.createPath(points);
        self.autoDrawStrokeRenderer.draw(path);
        self.canvas.blendWithRect(self.autoDrawLayer, self.autoDrawStrokeRenderer.updatedArea, Module.BlendMode.NORMAL);
        self.autoDrawStrokeRenderer.blendStroke(self.autoDrawLayer, Module.BlendMode.NORMAL);
        if (end < stroke.path.points.length) {
          $timeout( function() {
            self.drawAStrokeSlowly(stroke, end, callback, id);
          }, 10);
        } else {
          callback(id+1);
        }
      };

      this.redrawStroke = function(strokeId) {
        console.log(strokeId  + " >= " + self.redrawStrokesArray.length);
        if (strokeId < self.redrawStrokesArray.length) {
          self.currentStrokeId = strokeId;
          var i = 0;
          var color = Module.color.from(255, 255, 255);
          color.red = self.redrawStrokesArray[strokeId].color.red;
          color.green = self.redrawStrokesArray[strokeId].color.green;
          color.blue = self.redrawStrokesArray[strokeId].color.blue;
          color.alpha = self.redrawStrokesArray[strokeId].color.alpha;

          self.autoDrawStrokeRenderer.configure({brush: self.autoDrawBrush, color: color});
          var stroke = self.redrawStrokesArray[strokeId];
          self.drawAStrokeSlowly(stroke, 0, self.redrawStroke, strokeId);
        }
      };

      this.loadWill = function(filename) {
        var url = location.toString();
        url = url.substring(0, url.lastIndexOf("/")) + "/will/" + filename;

        var request = new XMLHttpRequest();

        request.onreadystatechange = function() {
           if (this.readyState == this.DONE) {
            self.restore(this.response);
          }
        };

        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.send();
      };

      this.load = function(file) {
        var reader = new FileReader();

        reader.onload = function(e) {
          self.clear();
          Module.InkDecoder.getStrokeBrush = function(paint) {
            return self.autoDrawBrush;
          };
          var strokes = Module.InkDecoder.decode(new Uint8Array(e.target.result), self.autoDrawBrush);
          self.redrawStrokesArray.pushArray(strokes);
          self.loadAndRedraw(strokes.dirtyArea);
          // self.redraw(strokes.dirtyArea);
        };

        reader.readAsArrayBuffer(file);
      };

      this.restore = function(fileBuffer) {
        var fileDecoder = new Module.WILLDecoder(fileBuffer);
        fileDecoder.decode();
        Module.InkDecoder.getStrokeBrush = function(paint) {
          return self.autoDrawBrush;
        };
        var strokes = Module.InkDecoder.decode(fileDecoder.ink, self.autoDrawBrush);
        // self.strokes.pushArray(strokes);
        // console.log(strokes);
        // self.redraw(strokes.dirtyArea);
        self.redrawStrokesArray.pushArray(strokes);
        self.loadAndRedraw(self.redrawStrokesArray.dirtyArea);
      };

      this.save = function() {
        var data = Module.InkEncoder.encode(self.strokes);
        saveAs(data, "export.data", "application/octet-stream");
      };

      return this;
    }
  ]);
