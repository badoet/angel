angular.module('davinc')
  .service('Will', [
    '$rootScope', "$timeout",

    function($rootScope, $timeout) {

      var self = this;

      self.backgroundColor = Module.Color.TRANSPERENT;
      self.brushColor = Module.Color.from(204, 204, 204);
      self.eraserColor =  Module.Color.from(255, 255, 255);

      self.color = self.brushColor;
      self.strokes = [];
      self.redrawStrokesArray = [];

      var canvas = document.getElementById("canvas");

      this.init = function(width, height) {
        self.drawToAutoStrokeId = 0;
        self.currentStrokeId = 0;
        self.redrawIntervalId = -1;
        self.canUpdate = false;



        self.initInkEngine(width, height);
        self.initEvents();
      };

      this.initInkEngine = function(width, height) {

        self.canvas = new Module.InkCanvas(canvas, width, height);
        self.teacherLayer = self.canvas.createLayer();
        self.autoDrawLayer = self.canvas.createLayer();
        self.userLayer = self.canvas.createLayer();

        self.clear();


        // init auto draw brush
        self.autoDrawBrush = new Module.DirectBrush();
        //this.autoDrawStrokeRenderer = new Module.StrokeRenderer(this.canvas, this.autoDrawLayer);
        self.autoDrawStrokeRenderer = new Module.StrokeRenderer(self.canvas, self.canvas);
        self.autoDrawStrokeRenderer.configure({brush: self.autoDrawBrush, color: this.color});




        self.blendNormal = Module.BlendMode.NORMAL;
        self.blendErase = Module.BlendMode.ERASE;
        self.blend = self.blendNormal;

        self.pathBuilder = new Module.SpeedPathBuilder();
        self.pathBuilder.setNormalizationConfig(5, 210);
        self.pathBuilder.setPropertyConfig(Module.PropertyName.Width, 1, 3.2, NaN, NaN, Module.PropertyFunction.Sigmoid, 0.6, true);

        self.smoothener = new Module.MultiChannelSmoothener(self.pathBuilder.stride);

        self.strokeRenderer = new Module.StrokeRenderer(self.canvas);
        self.useBrush(); // use brush as default
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
        if (self.redrawStrokesArray.length > 0 && self.canUpdate === true) {       
          self.drawToAutoStrokeId += 2;
        }

        if (self.redrawIntervalId == -1) {
          self.redrawStroke(self.currentStrokeId);      
        }




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
    self.redrawStrokesArray = [];

        self.userLayer.clear();
        self.autoDrawLayer.clear();

        self.canvas.clear();
      };






    this.loadAndRedraw = function(dirtyArea) {
      if (!dirtyArea) dirtyArea = self.canvas.bounds;
      dirtyArea = RectTools.ceil(dirtyArea);

      self.drawToAutoStrokeId = 2;
      self.currentStrokeId = 0;

      self.redrawStroke(0);

    };

    this.redrawStroke = function(strokeId) {
    if (strokeId >= self.redrawStrokesArray.length) {
      clearInterval(self.redrawIntervalId);
      self.redrawIntervalId = -1;
    } else {

      self.currentStrokeId = strokeId;

      var i = 0;

      var color = Module.color.WHITE;
      color.red = self.redrawStrokesArray[strokeId].color.red;
      color.green = self.redrawStrokesArray[strokeId].color.green;
      color.blue = self.redrawStrokesArray[strokeId].color.blue;
      color.alpha = self.redrawStrokesArray[strokeId].color.alpha;

      self.autoDrawStrokeRenderer.configure({brush: self.autoDrawBrush, color: color});

      self.redrawIntervalId = setInterval(function(self) {
        return function() {
          
          var stroke = self.redrawStrokesArray[strokeId];

          var points = [];

          var start = 0;//self.i;
          var end = 0;

          if (i === 0) {
            end = 12;
          }
          // next 8 points is not the end?
          else if (i + 3 < stroke.path.points.length) {
            // yes, do only 4 points
            end = i + 3;
          
          } else {        
            // no, do from current to end
            end = stroke.path.points.length;
          }

          for (var index = start; index < end; index++) {
            points.push(stroke.path.points[index]);
          }
          
          var path = self.pathBuilder.createPath(points);
          self.autoDrawStrokeRenderer.draw(path, true);
          //this.context.drawBezierPath(this.bezierPath);

          //self.canvas.clearArea(self.autoDrawStrokeRenderer.updatedArea, self.backgroundColor);
          self.canvas.blendWithRect(self.canvas, self.autoDrawStrokeRenderer.updatedArea, Module.BlendMode.NORMAL_REVERSE);
          self.autoDrawStrokeRenderer.blendUpdatedArea();


          i = end;

          self.canUpdate = true;

          if (i >= stroke.path.points.length) {
            //self.clear();
            clearInterval(self.redrawIntervalId);
            self.redrawIntervalId = -1;

            if (strokeId + 1 < self.redrawStrokesArray.length && strokeId + 1 < self.drawToAutoStrokeId) {
              self.redrawStroke(strokeId + 1);
            }
          }

        };
      }(self), 1);
    }
  };

      this.load = function(e) {
        var input = e.currentTarget;
        var file = input.files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
          self.clear();

          var fileDecoder = new Module.WILLDecoder(e.target.result);
          fileDecoder.decode();

          var strokes = Module.InkDecoder.decode(fileDecoder.ink);
          self.redrawStrokesArray.pushArray(strokes);
          self.loadAndRedraw(strokes.dirtyArea);
        };

        reader.readAsArrayBuffer(file);
      };

      return this;
    }
  ]);
