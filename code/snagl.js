/*  snagl.js JavaScript application, version 0.0.1
 *  (c) 2011 Sean Fao <sfao@42six.com>
 *
 *  snagl.js is freely distributable under the terms of the Microsoft Public
 *  License (Ms-PL). For details, please see LICENSE.TXT at the root of this
 *  project.
 *
/*--------------------------------------------------------------------------*/

var snagl = new Snagl();
var graphDb = new GraphDb();

function GraphDb() {
    this.nodes = [];

    this.addNode = function (node) {
        this.nodes.push(node);
    };
}

function Node(nodeId, adjacencies, attributes) {
    this.nodeId = nodeId;
    this.adjacencies = adjacencies;
    this.attributes = attributes;
}

function Snagl() {
    this.addNode = function (node) {
        graphDb.addNode(node);
    };

    this.clearGraphCanvas = function (graphCanvas) {
        var context = graphCanvas.getContext("2d");

        context.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    };

    this.draw = function (graphCanvas, graphData) {
        var context = graphCanvas.getContext("2d");

        drawNodes(graphDb.nodes, context);
        drawEdges(graphDb.nodes, context);
    };

    this.layoutGraph = function () {
        forceDirected(graphdB.nodes);
    };

    this.load = function (graphData) {
        processNodes(graphData.graph.nodes);
    };
}

function processNodes(nodes) {
    for (var x in nodes) {
        var tempNode = nodes[x];
        var node = new Node(tempNode.nodeId, tempNode.adjacencies, tempNode.attributes);

        if (!node.attributes.hasOwnProperty("position")) {
            node.attributes.position.x = 0;
            node.attributes.position.y = 0;
        }

        graphDb.addNode(node);
    }
}

function drawNodes(nodes, context) {
    for (var x in nodes) {
        // Create a closure to prevent a modified closure with the image.onload event handler
        var f = (function (node) {
            var image = new Image();

            image.id = nodeImageIdHelper(node.nodeId);
            image.src = node.attributes.hasOwnProperty("imageUrl") ? node.attributes.imageUrl : "/images/phoneDoc.png"; // TODO: Replace with a more universal default image
            image.onload = function () {
                context.drawImage(image, node.attributes.position.x, node.attributes.position.y);
            };
        });

        f(nodes[x]);
    }
}

function drawEdges(nodes, context) {
    for (var x in nodes) {
        var node = nodes[x];

        if (node.hasOwnProperty("adjacencies")) {
            context.beginPath();
            context.moveTo(node.attributes.position.x, node.attributes.position.y);

            for (var a in node.adjacencies) {
                var adjacencentNode = getNodeById(node.adjacencies[a]);

                context.lineTo(adjacencentNode.attributes.position.x, adjacencentNode.attributes.position.y);
            }

            context.closePath();
            context.stroke();
        }
    }
}

function getNodeById(nodeId) {
    for (var x in graphDb.nodes) {
        if (graphDb.nodes[x].nodeId == nodeId) {
            return graphDb.nodes[x];
        }
    }

    return null;
}

function forceDirected(nodes) {
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
}

function nodeImageIdHelper(nodeId) {
    return nodeId;
}
