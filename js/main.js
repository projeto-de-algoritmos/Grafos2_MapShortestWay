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

var initialPosition = [
  -15.793889, 
  -47.882778
];

var configs = {
  zoomControl: false,
};

maps = L
  .map("svg-map")
  .setView(initialPosition, 12, configs);

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

maps.on('click', function (e) {
  var nodeSelect = mapdata.allNodes.length;
  console.log(e.latlng.lat + ", " + e.latlng.lng);

  mapdata.allNodes.push({
      name: nodeSelect, x: e.latlng.lat, y: e.latlng.lng
  });

  lerTodosNos();
  addNoSelecionado(nodeSelect);
});
