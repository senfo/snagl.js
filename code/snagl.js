/*  snagl.js JavaScript application, version 0.0.1
 *  (c) 2011 Sean Fao <sfao@42six.com>
 *
 *  snagl.js is freely distributable under the terms of the Microsoft Public
 *  License (Ms-PL). For details, please see LICENSE.TXT at the root of this
 *  project.
 *
/*--------------------------------------------------------------------------*/

include('sgraph.js');

var snagl = new Snagl();
var graphDb = new GraphDb();

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
