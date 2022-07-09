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
