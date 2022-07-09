function LatandLong(lat, lon) {
    this.lat = Number(lat);
    this.lon = Number(lon);
}

LatandLong.prototype.distanceTo = function (point, radius) {
    if (!(point instanceof LatandLong)) throw new TypeError('ponto não é objeto');
    radius = (radius === undefined) ? 6378137 : Number(radius);
    if (Number.prototype.toRadians === undefined) {
        Number.prototype.toRadians = function () { return this * Math.PI / 180; };
    }
    if (Number.prototype.toDegrees === undefined) {
        Number.prototype.toDegrees = function () { return this * 180 / Math.PI; };
    }
    var R = radius;
    var a1 = this.lat.toRadians(), b1 = this.lon.toRadians();
    var a2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var a3 = a2 - a1;
    var a4 = λ2 - b1;
    var a = Math.sin(a3 / 2) * Math.sin(a3 / 2)
        + Math.cos(a1) * Math.cos(a2)
        * Math.sin(a4 / 2) * Math.sin(a4 / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};


var drawManager = d3.behavior.drag()
    .on('dragstart', arrastaNoStart())
    .on('drag', arrastaNo())
    .on('dragend', arrastaNoEnd());

$("#coordenada").on('click',function () {
   
    var valuelat = $("#latitude").val();
    var valuelong = $("#longitude").val();
    LimparMapa();

    if (valuelat == '' || valuelong == '' ){
      alert("Entre com a latitude e a longitude");  
    }
    else {
        maps.setView(new L.LatLng(valuelat, valuelong), 10);
    }

});

$('#getMenorCaminho').on('click', function () {
    d3.selectAll("line").classed({ "shortest": false });
    calculadistancianodes();
    if (!$(mapdata.getui.htmlSelectStartingNode).val() || !$(mapdata.getui.htmlSelectEndNode).val()) return;
    var sourceNode = $(mapdata.getui.htmlSelectStartingNode).val();
    var targetNode = $(mapdata.getui.htmlSelectEndNode).val();
    var results = dijkstra(sourceNode, targetNode);
    if (results.path) {
        results.path.forEach(function (step) {

            var dist = mapdata.distancia[step.source][step.target]
            stepLine = d3.select(
                "line.from" + step.source + "to" + step.target + ","
                + "line.from" + step.target + "to" + step.source
            );
            stepLine.classed({ "shortest": true });

        });
    }

});


$('#limparMapa').on('click', function () {
    LimparMapa();

});


function addNoSelecionado(noSelecionado) {
    $(mapdata.getui.htmlSelectStartingNode).append($("<option></option>").attr("value", noSelecionado).text(noSelecionado));
    $(mapdata.getui.htmlSelectEndNode).append($("<option></option>").attr("value", noSelecionado).text(noSelecionado));
};

function LimparMapa() {
    mapdata.allNodes = [];
    mapdata.caminhos = [];
    $(mapdata.getui.htmlSelectStartingNode).empty();
    $(mapdata.getui.htmlSelectEndNode).empty();
    $("#results").empty();
    $('#svg-map').css({
        'background-image': 'url(' + null + ')'

    });
    lerTodosNos();
    lertodasLinhas();

};



function nodeClick(d, i) {
    console.log("node:click %s", i);
    console.log(d);

    d3.event.preventDefault();
    d3.event.stopPropagation();
};

function arrastaNoStart() {
    return function (d, i) {
        console.log("dragging node " + i);

    }
};


function arrastaNoEnd() {
    return function (d, i) {
        console.log("node " + i + " repositioned");
    }
};

function killEvent() {
    if (d3.event.preventDefault) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
    }
};

function inicioFinalCaminho(index) {
    d3.event.stopPropagation();
    d3.event.preventDefault();
    if (mapdata.getstate.fromNode === null) {

        mapdata.getstate.fromNode = index;
    }
    else {
        if (mapdata.getstate.fromNode === index) {

            return;
        }

        mapdata.getstate.toNode = index;
        console.log(index + " Node lar");
        var pathDatum = {
            id: mapdata.caminhos.length,
            from: mapdata.getstate.fromNode,
            to: index
        };
        mapdata.caminhos.push(pathDatum);
        calculadistancianodes();
        lertodasLinhas();
        lerTodosNos();
        mapdata.getstate.fromNode = null;
        mapdata.getstate.toNode = null;
    }
};

function calculadistancianodes() {
    mapdata.distancia = [];
    for (var i = 0; i < mapdata.allNodes.length; i++) {
        mapdata.distancia[i] = [];
        for (var j = 0; j < mapdata.allNodes.length; j++)
            mapdata.distancia[i][j] = 'x';
    }
    for (var i = 0; i < mapdata.caminhos.length; i++) {
        var sourceNodeId = parseInt(mapdata.caminhos[i].from);
        var targetNodeId = parseInt(mapdata.caminhos[i].to);
        var sourceNode = mapdata.allNodes[sourceNodeId];
        var targetNode = mapdata.allNodes[targetNodeId];
        var p1 = new LatandLong(sourceNode.x, sourceNode.y);
        var p2 = new LatandLong(targetNode.x, targetNode.y);
        var d = p1.distanceTo(p2);
        mapdata.distancia[sourceNodeId][targetNodeId] = d;
        mapdata.distancia[targetNodeId][sourceNodeId] = d;
    };
};

// no de inici e no final
function dijkstra(inicio, final) {

    //conta os nós
    var nodeCount = mapdata.distancia.length,
        infinity = 99999, // infinity
        // armazena os menores caminhos
        shortestPath = new Array(nodeCount),
        // marca o no como visitado
        nodeChecked = new Array(nodeCount),
        pred = new Array(nodeCount);

    // armazena o menor caminho
    for (var i = 0; i < nodeCount; i++) {
        shortestPath[i] = infinity;
        pred[i] = null;
        nodeChecked[i] = false;
    }

    shortestPath[inicio] = 0;

    for (var i = 0; i < nodeCount; i++) {

        var minDist = infinity;
        var closestNode = null;

        for (var j = 0; j < nodeCount; j++) {

            if (!nodeChecked[j]) {
                if (shortestPath[j] <= minDist) {
                    minDist = shortestPath[j];
                    closestNode = j;
                }
            }
        }

        // fecha o nó
        nodeChecked[closestNode] = true;

        for (var k = 0; k < nodeCount; k++) {
            if (!nodeChecked[k]) {
                // ve as distâncias
                var nextDistance = distanciaentrenos(closestNode, k, mapdata.distancia);
                if ((parseInt(shortestPath[closestNode]) + parseInt(nextDistance)) < parseInt(shortestPath[k])) {
                    // ve o mais longe
                    soFar = parseInt(shortestPath[closestNode]);
                    extra = parseInt(nextDistance);
                    shortestPath[k] = soFar + extra;
                    pred[k] = closestNode;
                }
            }
        }

    }

    if (shortestPath[final] < infinity) {

        var newPath = [];
        var step = {
            target: parseInt(final)
        };

        var v = parseInt(final);

        while (v >= 0) {
            v = pred[v];
            if (v !== null && v >= 0) {
                step.source = v;
                newPath.unshift(step);
                step = {
                    target: v
                };
            }
        }
        // Vê a disancia  total
        totalDistance = shortestPath[final];

        return {
            mesg: 'Status: OK',
            path: newPath,
            source: inicio,
            target: final,
            distance: totalDistance
        };
    } else {
        return {
            mesg: 'Sorry nenhum caminho encontrado',
            path: null,
            source: inicio,
            target: final,
            distance: 0
        };
    }

    function distanciaentrenos(fromNode, toNode, distancia) {
        dist = distancia[fromNode][toNode];
        if (dist === 'x') dist = infinity;
        return dist;
    }

};
