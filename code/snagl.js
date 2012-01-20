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
    this.adjacencies = adjacencies;
    this.attributes = attributes;
}

Node.prototype.draw = function (context) {
    var image = new Image();
    var node = this; // Needed for the image onload event handler

    image.id = this.nodeId; 
    image.src = this.attributes.hasOwnProperty("imageUrl") ? this.attributes.imageUrl : "/images/phoneDoc.png"; // TODO: Replace with a more universal default image

    image.onload = function () {
        context.drawImage(image, node.attributes.position.x, node.attributes.position.y);
    };
};

// Initializes drag and drop for nodes
Node.prototype.initDrag = function () {
    
}

function Snagl(graphCanvas) {
    this.graphDb = new GraphDb();
    this.graphCanvas = graphCanvas;

    this.addNode = function (node) {
        this.graphDb.addNode(node);
    };

    this.clearGraphCanvas = function (graphCanvas) {
        var context = graphCanvas.getContext("2d");

        context.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    };

    this.draw = function (graphData) {
        var context = this.graphCanvas.getContext("2d");

        this.graphCanvas.draggable = true;
        //graphCanvas.style.cursor = 'move';

        this.drawNodes(this.graphDb.nodes, context);
        this.drawEdges(this.graphDb.nodes, context);
    };

    this.layoutGraph = function () {
        forceDirected(this.graphdB.nodes);
    };

    this.load = function (graphData) {
        this.processNodes(graphData.graph.nodes);
    };
}

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
        nodes[x].velocity.x = 0;
        nodes[x].velocity.y = 0;

        // Spread out all the nodes so none of them have the exact same position
        nodes[x].position.x = x * 10;
        nodes[x].position.y = x * 10;
    }

    for (var x in nodes) {
        
    }
};
