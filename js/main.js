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
