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

    this.image.onload = function () {
        context.drawImage(node.image, node.attributes.position.x, node.attributes.position.y);
    };
};

function Snagl(graphCanvas) {
    this.graphDb = new GraphDb();
    this.graphCanvas = graphCanvas;

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
