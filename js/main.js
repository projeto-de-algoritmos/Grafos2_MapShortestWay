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
    let p = p;
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
