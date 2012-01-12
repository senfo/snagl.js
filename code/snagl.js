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

    this.draw = function (graphCanvas) {
        var context = graphCanvas.getContext("2d");
        var image = new Image();

        image.src = "http://www.w3schools.com/html5/img_flwr.png";
        image.onload = function () {
            context.drawImage(image, 0, 0);
        };
    };
}

