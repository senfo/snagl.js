/*  snagl.js JavaScript application, version 0.0.1
 *  (c) 2011 Sean Fao <sfao@42six.com>
 *
 *  snagl.js is freely distributable under the terms of the Microsoft Public
 *  License (Ms-PL). For details, please see LICENSE.TXT at the root of this
 *  project.
 *
/*--------------------------------------------------------------------------*/

function GraphDb() {
    this.nodes = [];
}

GraphDb.prototype.addNode = function (node) {
    this.nodes.push(node);
};

function Node(nodeId, adjacencies, attributes) {
    this.nodeId = nodeId;
    this.visible = true;
    this.adjacencies = adjacencies;
    this.attributes = attributes;
    this.eventListeners = {};

    this.drag = {
            x: false,
            y: false
        };
}

Node.prototype.draw = function (context) {
    var node = this; // Needed for the image onload event handler
    this.image = new Image();

    this.image.id = this.nodeId; 
    this.image.src = this.attributes.hasOwnProperty("imageUrl") ? this.attributes.imageUrl : "/images/phoneDoc.png"; // TODO: Replace with a more universal default image
    this.draggable(true);

    // add cursor styling             
    this.on("mouseover", function (){
        document.body.style.cursor = 'move';
    });
    this.on("mouseout", function (){
        document.body.style.cursor = 'default';
    });

    this.image.onload = function () {
        context.drawImage(node.image, node.attributes.position.x, node.attributes.position.y);
    };
};

Node.prototype.on = function(typesStr, handler){
    var types = typesStr.split(" ");
    /*
     * loop through types and attach event listeners to
     * each one.  eg. "click mouseover.namespace mouseout"
     * will create three event bindings
     */
    for (var n = 0; n < types.length; n++) {
        var type = types[n];
        var event = (type.indexOf('touch') == -1) ? 'on' + type : type;
        var parts = event.split(".");
        var baseEvent = parts[0];
        var name = parts.length > 1 ? parts[1] : "";
        
        if (!this.eventListeners[baseEvent]) {
            this.eventListeners[baseEvent] = [];
        }
        
        this.eventListeners[baseEvent].push({
            name: name,
            handler: handler
        });
    }
};

Node.prototype.off = function(type){
    var event = (type.indexOf('touch') == -1) ? 'on' + type : type;
    var parts = event.split(".");
    var baseEvent = parts[0];
    
    if (this.eventListeners[baseEvent] && parts.length > 1) {
        var name = parts[1];
        
        for (var i = 0; i < this.eventListeners[baseEvent].length; i++) {
            if (this.eventListeners[baseEvent][i].name == name) {
                this.eventListeners[baseEvent].splice(i, 1);
                if (this.eventListeners[baseEvent].length === 0) {
                    this.eventListeners[baseEvent] = undefined;
                }
                break;
            }
        }
    }
    else {
        this.eventListeners[baseEvent] = undefined;
    }
};

// Initializes drag and drop for nodes
Node.prototype.initDrag = function () {
    var that = this;
    var types = ["mousedown", "touchstart"];
    
    for (var n = 0; n < types.length; n++) {
        var pubType = types[n];
        (function(){
            var type = pubType;
            that.on(type + ".initdrag", function(evt){
                var stage = that.graphCanvas.stage;
                var pos = stage.getUserPosition();
                
                if (pos) {
                    stage.shapeDragging = that;
                    stage.shapeDragging.offset = {};
                    stage.shapeDragging.offset.x = pos.x - that.x;
                    stage.shapeDragging.offset.y = pos.y - that.y;
                    
                    // execute dragstart events if defined
                    var dragstart = that.eventListeners.ondragstart;
                    if (dragstart) {
                        var events = dragstart;
                        for (var i = 0; i < events.length; i++) {
                            events[i].handler.apply(that, [evt]);
                        }
                    }
                }
            });
        })();
    }
}

Node.prototype.dragCleanup = function () {
    if (!this.drag.x && !this.drag.y) {
        this.off("mousedown.initdrag");
        this.off("touchstart.initdrag");
    }
};

Node.prototype.draggable = function(setDraggable){
    if (setDraggable) {
        var needInit = !this.drag.x && !this.drag.y;

        this.drag = {
            x: true,
            y: true
        };

        if (needInit) {
            this.initDrag();
        }
    }
    else {
        this.drag = {
            x: false,
            y: false
        };

        this.dragCleanup();
    }
};

function Snagl(graphCanvas) {
    this.graphDb = new GraphDb();
    this.graphCanvas = graphCanvas;

    // desktop flags
    this.mousePos = null;
    this.mouseDown = false;
    this.mouseUp = false;
    
    // mobile flags
    this.touchPos = null;
    this.touchStart = false;
    this.touchEnd = false;

    // Support for multiple graphs
    this.layers = [];

    //this.listen();

    this.addNode = function (node) {
        this.graphDb.addNode(node);
    };

    this.draw = function (graphData) {
        var context = this.graphCanvas.getContext("2d");

        this.drawNodes(this.graphDb.nodes, context);
        this.drawEdges(this.graphDb.nodes, context);
    };

    this.layoutGraph = function (layout) {
        var context = this.graphCanvas.getContext("2d");

        if (layout == 'forceDirected') {
            this.forceDirected(this.graphDb.nodes);
        }

        this.drawNodes(this.graphDb.nodes, context);
        this.drawEdges(this.graphDb.nodes, context);
    };

    this.load = function (graphData) {
        this.processNodes(graphData.graph.nodes);
    };

    this.graphCanvas.clear = function () {
        var context = this.getContext("2d");

        context.clearRect(0, 0, this.width, this.height);
    };
}

Snagl.prototype.getContext = function(){
    return this.tempLayer.getContext();
};

Snagl.prototype.handleEvent = function (evt) {
    if (!evt) {
        evt = window.event;
    }
    
    this.setMousePosition(evt);
    this.setTouchPosition(evt);
    
    var backstageLayer = this.graphCanvas; // TODO: DELETE THIS COMMENT NOW this.backstageLayer;
    var backstageLayerContext = backstageLayer.getContext();
    var that = this;
    
    backstageLayer.clear();
    
    /*
     * loop through layers.  If at any point an event
     * is triggered, n is set to -1 which will break out of the
     * three nested loops
     */
    for (var n = this.graphDb.nodes.length - 1; n >= 0; n--) {
        var layer = this.graphDb.nodes[n];
        if (n >= 0 && layer.isListening) {
            var linkId = layer.tailId;
            
            // propapgate backwards through event links
            while (n >= 0 && linkId !== undefined) {
                var link = layer.linkHash[linkId];
                var pubShape = link.shape;
                (function() {
                    var shape = pubShape;
                    shape.draw(backstageLayer);
                    var pos = that.getUserPosition();
                    var el = shape.eventListeners;
                    
                    if (shape.visible && pos !== null && backstageLayerContext.isPointInPath(pos.x, pos.y)) {
                        // handle onmousedown
                        if (that.mouseDown) {
                            that.mouseDown = false;
                            that.clickStart = true;
                            
                            if (el.onmousedown) {
                                var events = el.onmousedown;
                                for (var i = 0; i < events.length; i++) {
                                    events[i].handler.apply(shape, [evt]);
                                }
                            }
                            n = -1;
                        }
                        // handle onmouseup & onclick
                        else if (that.mouseUp) {
                            that.mouseUp = false;
                            if (el.onmouseup) {
                                var events = el.onmouseup;
                                for (var i = 0; i < events.length; i++) {
                                    events[i].handler.apply(shape, [evt]);
                                }
                            }
                            
                            // detect if click or double click occurred
                            if (that.clickStart) {
                                if (el.onclick) {
                                    var events = el.onclick;
                                    for (var i = 0; i < events.length; i++) {
                                        events[i].handler.apply(shape, [evt]);
                                    }
                                }
                                
                                if (el.ondblclick && shape.inDoubleClickWindow) {
                                    var events = el.ondblclick;
                                    for (var i = 0; i < events.length; i++) {
                                        events[i].handler.apply(shape, [evt]);
                                    }
                                }
                                
                                shape.inDoubleClickWindow = true;
                                
                                setTimeout(function(){
                                    shape.inDoubleClickWindow = false;
                                }, that.dblClickWindow);
                            }
                            n = -1;
                        }
                        
                        // handle touchstart
                        else if (that.touchStart) {
                            that.touchStart = false;
                            if (el.touchstart) {
                                var events = el.touchstart;
                                for (var i = 0; i < events.length; i++) {
                                    events[i].handler.apply(shape, [evt]);
                                }
                            }
                            
                            if (el.ondbltap && shape.inDoubleClickWindow) {
                                var events = el.ondbltap;
                                for (var i = 0; i < events.length; i++) {
                                    events[i].handler.apply(shape, [evt]);
                                }
                            }
                            
                            shape.inDoubleClickWindow = true;
                            
                            setTimeout(function(){
                                shape.inDoubleClickWindow = false;
                            }, that.dblClickWindow);
                            n = -1;
                        }
                        
                        // handle touchend
                        else if (that.touchEnd) {
                            that.touchEnd = false;
                            if (el.touchend) {
                                var events = el.touchend;
                                for (var i = 0; i < events.length; i++) {
                                    events[i].handler.apply(shape, [evt]);
                                }
                            }
                            n = -1;
                        }
                        
                        // handle touchmove
                        else if (el.touchmove) {
                            var events = el.touchmove;
                            for (var i = 0; i < events.length; i++) {
                                events[i].handler.apply(shape, [evt]);
                            }
                            n = -1;
                        }
                        
                        /*
                         * this condition is used to identify a new target shape.
                         * A new target shape occurs if a target shape is not defined or
                         * if the current shape is different from the current target shape and
                         * the current shape is beneath the target
                         */
                        else if (that.targetShape.id === undefined || (that.targetShape.id != shape.id && that.targetShape.getZIndex() < shape.getZIndex())) {
                            /*
                             * check if old target has an onmouseout event listener
                             */
                            var oldEl = that.targetShape.eventListeners;
                            if (oldEl && oldEl.onmouseout) {
                                var events = oldEl.onmouseout;
                                for (var i = 0; i < events.length; i++) {
                                    events[i].handler.apply(that.targetShape, [evt]);
                                }
                            }
                            
                            // set new target shape
                            that.targetShape = shape;
                            
                            // handle onmouseover
                            if (el.onmouseover) {
                                var events = el.onmouseover;
                                for (var i = 0; i < events.length; i++) {
                                    events[i].handler.apply(shape, [evt]);
                                }
                            }
                            n = -1;
                        }
                        
                        // handle onmousemove
                        else if (el.onmousemove) {
                            var events = el.onmousemove;
                            for (var i = 0; i < events.length; i++) {
                                events[i].handler.apply(shape, [evt]);
                            }
                            n = -1;
                        }
                    }
                    // handle mouseout condition
                    else if (that.targetShape.id == shape.id) {
                        that.targetShape = {};
                        if (el.onmouseout) {
                            var events = el.onmouseout;
                            for (var i = 0; i < events.length; i++) {
                                events[i].handler.apply(shape, [evt]);
                            }
                        }
                        n = -1;
                    }
                }());
                
                linkId = link.prevId;
            } // end links loop
        }
    } // end layer loop
};

Snagl.prototype.listen = function () {
    var that = this;
    
    // desktop events
    this.graphCanvas.addEventListener("mousedown", function (evt) {
        that.mouseDown = true;
        that.handleEvent(evt);
    }, false);
    
    this.graphCanvas.addEventListener("mousemove", function (evt) {
        that.mouseUp = false;
        that.mouseDown = false;
        that.handleEvent(evt);
    }, false);
    
    this.graphCanvas.addEventListener("mouseup", function (evt) {
        that.mouseUp = true;
        that.mouseDown = false;
        that.handleEvent(evt);
        
        that.clickStart = false;
    }, false);
    
    this.graphCanvas.addEventListener("mouseover", function (evt) {
        that.handleEvent(evt);
    }, false);
    
    this.graphCanvas.addEventListener("mouseout", function (evt) {
        that.mousePos = null;
    }, false);

    // mobile events
    this.graphCanvas.addEventListener("touchstart", function (evt) {
        evt.preventDefault();
        that.touchStart = true;
        that.handleEvent(evt);
    }, false);
    
    this.graphCanvas.addEventListener("touchmove", function (evt) {
        evt.preventDefault();
        that.handleEvent(evt);
    }, false);
    
    this.graphCanvas.addEventListener("touchend", function (evt) {
        evt.preventDefault();
        that.touchEnd = true;
        that.handleEvent(evt);
    }, false);
};

Snagl.prototype.setMousePosition = function(evt){
    var mouseX = evt.clientX - this.getContainerPosition().left + window.pageXOffset;
    var mouseY = evt.clientY - this.getContainerPosition().top + window.pageYOffset;
    this.mousePos = {
        x: mouseX,
        y: mouseY
    };
};
/*
 * set touch position for mobile apps
 */
Snagl.prototype.setTouchPosition = function(evt){
    if (evt.touches !== undefined && evt.touches.length == 1) {// Only deal with
        // one finger
        var touch = evt.touches[0];
        // Get the information for finger #1
        var touchX = touch.clientX - this.getContainerPosition().left + window.pageXOffset;
        var touchY = touch.clientY - this.getContainerPosition().top + window.pageYOffset;
        
        this.touchPos = {
            x: touchX,
            y: touchY
        };
    }
};

Snagl.prototype.getContainerPosition = function() {
    var obj = this.graphCanvas;
    var top = 0;
    var left = 0;

    while (obj && obj.tagName != "BODY") {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }
    return {
        top: top,
        left: left
    };
};

Snagl.prototype.processNodes = function (nodes) {
    for (var x in nodes) {
        var tempNode = nodes[x];
        var node = new Node(tempNode.nodeId, tempNode.adjacencies, tempNode.attributes);

        if (!node.attributes.hasOwnProperty("position")) {
            node.attributes.position.x = 0;
            node.attributes.position.y = 0;
        }

        this.graphDb.addNode(node);
    }
};

Snagl.prototype.drawNodes = function (nodes, context) {
    for (var x in nodes) {
        nodes[x].draw(context);
    }
};

Snagl.prototype.drawEdges = function (nodes, context) {
    for (var x in nodes) {
        var node = nodes[x];

        if (node.hasOwnProperty("adjacencies")) {
            context.beginPath();
            context.moveTo(node.attributes.position.x, node.attributes.position.y);

            for (var a in node.adjacencies) {
                var adjacencentNode = this.getNodeById(node.adjacencies[a]);

                context.lineTo(adjacencentNode.attributes.position.x, adjacencentNode.attributes.position.y);
            }

            context.closePath();
            context.stroke();
        }
    }
};

Snagl.prototype.getNodeById = function (nodeId) {
    for (var x in this.graphDb.nodes) {
        if (this.graphDb.nodes[x].nodeId == nodeId) {
            return this.graphDb.nodes[x];
        }
    }

    return null;
};

Snagl.prototype.forceDirected = function (nodes) {
    for (var x in nodes) {
        // Set initial velocity to 0, 0
        nodes[x].velocity = {
            x: 0,
            y: 0
        };

        // Spread out all the nodes so none of them have the exact same position
        nodes[x].attributes.position.x = x * 110;
        nodes[x].attributes.position.y = x * 110;

        this.graphCanvas.clear();
        nodes[x].draw();
    }

    for (var x in nodes) {
        
    }
};
