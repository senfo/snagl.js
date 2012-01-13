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
    this.edges = [];

    this.addNode = function (node) {
        this.nodes.push(node);
    };

    this.addEdge = function (edge) {
        this.edges.push(edge);
    };
}

function Node(nodeId, attributes) {
    this.nodeId = nodeId;
    this.attributes = attributes;
}

function Edge(parentNodeId, targetNodeId, attributes) {
    this.parentNodeId = parentNodeId;
    this.targetNodeId = targetNodeId;
    this.attributes = attributes;
}

function Snagl() {
    this.addNode = function (node) {
        graphDb.addNode(node);
    };

    this.addEdge = function (edge) {
        graphDb.addEdge(edge);
    };

    this.clearGraphCanvas = function (graphCanvas) {
        var context = graphCanvas.getContext("2d");

        context.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    };

    this.draw = function (graphCanvas, graphData) {
        var context = graphCanvas.getContext("2d");

        processNodes(graphData.graph.nodes, context);
    };
}

function processNodes(nodes, context) {
    for (var x in nodes) {
        // Create a closure to prevent a modified closure with the image.onload event handler
        var f = (function (node) {
            var image = new Image();

            if (!node.attributes.hasOwnProperty("position")) {
                node.attributes.position.x = 0;
                node.attributes.position.y = 0;
            }

            image.id = nodeImageIdHelper(node.nodeId);
            image.src = node.attributes.hasOwnProperty("imageUrl") ? node.attributes.imageUrl : "/Content/Images/phoneDoc.png"; // TODO: Replace with a more universal default image
            image.onload = function () {
                context.drawImage(image, node.attributes.position.x, node.attributes.position.y);
            };
        });

        f(nodes[x]);
    }
}

function nodeImageIdHelper(nodeId) {
    return nodeId;
}
