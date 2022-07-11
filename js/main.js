
var svg, maps, g;

var mapdata = {
  allNodes: [],
  caminhos: [],
  distancia: [],
  getui: {
    htmlSelectStartingNode: "#inicio",
    htmlSelectEndNode: "#destino",
  },
  getstate: {
    selectedNode: null,
    fromNode: null,
    toNode: null,
  },
};

var initialPosition = [-15.793889, -47.882778];

var configs = {
  zoomControl: false,
};

maps = L.map("svg-map").setView(initialPosition, 12, configs);

mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink + " Contributors",
  maxZoom: 18,
  minZoom: 12,
}).addTo(maps);

maps._initPathRoot();

svg = d3
  .select("#svg-map")
  .select("svg")
  .attr("class", "svgmap")
  .on("contextmenu", function () {
    d3.event.preventDefault();
  });

maps.on("viewreset", viewChanges);

function viewChanges() {
  lerTodosNos();
  lertodasLinhas();
}

maps.on("click", function (e) {
  const nodeSelect = mapdata.allNodes.length;

  console.log(e.latlng.lat + ", " + e.latlng.lng);

  const nodeData = {
    name: nodeSelect,
    x: e.latlng.lat,
    y: e.latlng.lng,
  };

  mapdata.allNodes.push(nodeData);

  lerTodosNos();
  addNoSelecionado(nodeSelect);
});

function arrastaNo() {
  return function (p, i) {
    var p = p;
    let s = true;

    maps.on("mousemove", function (e) {
      if (golf == true) {
        const nodeData = {
          name: p.name,
          x: e.latlng.lat,
          y: e.latlng.lng,
        };

        mapdata.allNodes[i] = nodeData;

        calculadistancianodes();
        lertodasLinhas();
        lerTodosNos();
      } else {
        return;
      }
    });

    maps.on("mouseup", function (e) {
      s = false;
      return;
    });
  };
}

function lerTodosNos() {
  svg.selectAll("g.nodes").data([]).exit().remove();

  let elementos = svg
    .selectAll("g.nodes")
    .data(mapdata.allNodes, function (d, i) {
      return d.name;
    });

  let inseriorNode = elementos.enter().append("g").attr("class", "nodes");

  elementos.attr("transform", function (d, i) {
    return (
      "translate(" +
      maps.latLngToLayerPoint(new L.LatLng(d.x, d.y)).x +
      "," +
      maps.latLngToLayerPoint(new L.LatLng(d.x, d.y)).y +
      ")"
    );
  });

  inseriorNode
    .append("circle")
    .attr("nodeId", function (d, i) {
      return i;
    })
    .attr("r", "24")
    .attr("class", "node")
    .style("cursor", "pointer")
    .on("click", nodeClick)
    .on("mouseenter", function () {
      maps.dragging.disable();
    })
    .on("mouseout", function () {
      maps.dragging.enable();
    })
    .on("contextmenu", function (d, i) {
      inicioFinalCaminho(i);
    })
    .call(drawManager);

  inseriorNode
    .append("text")
    .attr("nodeLabelId", function (d, i) {
      return i;
    })
    .attr("dx", "-5")
    .attr("dy", "5")
    .attr("class", "label")
    .on("contextmenu", function (d, i) {
      inicioFinalCaminho(i);
    })
    .call(drawManager)
    .text(function (d, i) {
      return d.name;
    });

  elementos.exit().remove();
}

function lertodasLinhas() {
  svg.selectAll("g.line").data([]).exit().remove();

  const elementos = svg.selectAll("g.line").data(mapdata.caminhos, function (d) {
    return d.id;
  });

  const newelementos = elementos.enter();

  var group = newelementos.append("g").attr("class", "line");

  var line = group
    .append("line")
    .attr("class", function (d) {
      return (
        "from" +
        mapdata.allNodes[d.from].name +
        "to" +
        mapdata.allNodes[d.to].name
      );
    })
    .attr("x1", function (d) {
      return maps.latLngToLayerPoint(
        new L.LatLng(mapdata.allNodes[d.from].x, mapdata.allNodes[d.from].y)
      ).x;
    })
    .attr("y1", function (d) {
      return maps.latLngToLayerPoint(
        new L.LatLng(mapdata.allNodes[d.from].x, mapdata.allNodes[d.from].y)
      ).y;
    })
    .attr("x2", function (d) {
      return maps.latLngToLayerPoint(
        new L.LatLng(mapdata.allNodes[d.to].x, mapdata.allNodes[d.to].y)
      ).x;
    })
    .attr("y2", function (d) {
      return maps.latLngToLayerPoint(
        new L.LatLng(mapdata.allNodes[d.to].x, mapdata.allNodes[d.to].y)
      ).y;
    });

  var text = group
    .append("text")
    .attr("x", function (d) {
      return (
        parseInt(
          (maps.latLngToLayerPoint(
            new L.LatLng(mapdata.allNodes[d.from].x, mapdata.allNodes[d.from].y)
          ).x +
            maps.latLngToLayerPoint(
              new L.LatLng(mapdata.allNodes[d.to].x, mapdata.allNodes[d.to].y)
            ).x) /
            2
        ) + 5
      );
    })
    .attr("y", function (d) {
      return (
        parseInt(
          (maps.latLngToLayerPoint(
            new L.LatLng(mapdata.allNodes[d.from].x, mapdata.allNodes[d.from].y)
          ).y +
            maps.latLngToLayerPoint(
              new L.LatLng(mapdata.allNodes[d.to].x, mapdata.allNodes[d.to].y)
            ).y) /
            2
        ) - 5
      );
    })
    .attr("class", "line-label");

  elementos.selectAll("text").text(function (d) {
    return Math.round(mapdata.distancia[d.from][d.to]) + " Metros";
  });
  elementos.exit().remove();
}

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
