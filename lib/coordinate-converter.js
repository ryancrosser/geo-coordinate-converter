var p = {};

var degToRad = Math.PI / 180;
var radToDeg = 180.0 / Math.PI;
var wgs84a = 6378137.0; //Radius of the equator of the WGS 84 projection (i.e. semi-major axis)
var wgs84iF = 298.257223563; //Inverse flattening (1/f) of the WGS 84 projection
var kSub0 = 0.9996; // scale factor at the central meridian
var eSq = 0.00669437999014132; // first eccentricity squared. eSq = 2f - f^2
var eFourth = Math.pow(eSq, 2); //(eSq)^2
var eSixth = Math.pow(eSq, 3); // (eSq)^3
var ePrimeSq = 0.00673949674227643; //second eccentricity squared. ePrimeSq = eSq / (1-eSq)
var eSub1 = (1 - Math.sqrt(1 - eSq)) / (1 + Math.sqrt(1 - eSq));
var eSub1Sq = Math.pow(eSub1, 2);
var eSub1Third = Math.pow(eSub1, 3);
var eSub1Fourth = Math.pow(eSub1Sq, 2);
var falseEasting = 500000.0;
var falseNorthing = 10000000.0;
var gridZoneSize = 100000;
var gzSetColSize = 8;  // column width of grid square set
var gzSetRowSize = 20; // row height of grid square set
var gzdA = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
var gzdB = 'ABCDEFGHJKLMNPQRSTUV';
var latBands = 'CDEFGHJKLMNPQRSTUVWX';

//=========================================================================
// Coordinate Types
//=========================================================================

p.Coordinate = function pCoordinateConstructor() {

};

p.Geodetic = function pGeodeticConstructor(lat, lon) { //Represents a decimal degrees formatted geodetic coordinate
    if (isNaN(lat)) {
        throw 'Latitude is not a number';
    }
    if (isNaN(lon)) {
        throw 'Longitude is not a number';
    }

    this.lat = Number(lat);
    this.lon = Number(lon);

    if (lat < -90 || lat > 90) {
        throw 'Latitude out of range';
    }
    if (lon < -180 || lon > 180) {
        throw 'Longitude out of range';
    }
};

p.Geodetic.prototype = new p.Coordinate();

p.geodeticFromDM = function pGeodeticFromDM(latDeg, latMin, lonDeg, lonMin) {
    if (isNaN(latDeg)) {
        throw 'Latitude degrees is not a number';
    }
    if (isNaN(latMin)) {
        throw 'Latitude minute is not a number';
    }
    if (isNaN(lonDeg)) {
        throw 'Longitude degrees is not a number';
    }
    if (isNaN(lonMin)) {
        throw 'Longitude minute is not a number';
    }

    latDeg = parseInt(latDeg, 10);
    lonDeg = parseInt(lonDeg, 10);
    latMin = parseFloat(latMin);
    lonMin = parseFloat(lonMin);

    if (latDeg < -90 || latDeg > 90) {
        throw 'Latitude degree out of range';
    }
    if (latMin < 0 || latMin >= 60) {
        throw 'Latitude minute out of range';
    }
    if (lonDeg < -180 || lonDeg > 180) {
        throw 'Longitude degree out of range';
    }
    if (lonMin < 0 || lonMin >= 60) {
        throw 'Longitude minute out of range';
    }

    return new p.Geodetic((latDeg < 0 ? -1 : 1) * (Math.abs(latDeg) + (latMin / 60)), (lonDeg < 0 ? -1 : 1) * (Math.abs(lonDeg) + (lonMin / 60)));
};

p.geodeticFromDMS = function pGeodeticFromDMS(latDeg, latMin, latSec, lonDeg, lonMin, lonSec) {
    if (isNaN(latMin)) {
        throw 'Latitude minute is not a number';
    }
    if (isNaN(latSec)) {
        throw 'Latitude second is not a number';
    }
    if (isNaN(lonMin)) {
        throw 'Longitude minute is not a number';
    }
    if (isNaN(lonSec)) {
        throw 'Longitude second is not a number';
    }

    this.latDeg = parseInt(latDeg, 10);
    this.latMin = parseInt(latMin, 10);
    this.latSec = parseFloat(latSec);
    this.lonDeg = parseInt(lonDeg, 10);
    this.lonMin = parseInt(lonMin, 10);
    this.lonSec = parseFloat(lonSec);

    if (latDeg < -90 || latDeg > 90) {
        throw 'Latitude degree out of range';
    }
    if (latMin < 0 || latMin >= 60) {
        throw 'Latitude minute out of range';
    }
    if (latSec < 0 || latSec >= 60) {
        throw 'Latitude second out of range';
    }
    if (lonDeg < -180 || lonDeg > 180) {
        throw 'Longitude degree out of range';
    }
    if (lonMin < 0 || lonMin >= 60) {
        throw 'Longitude minute out of range';
    }
    if (lonSec < 0 || lonSec >= 60) {
        throw 'Longitude second out of range';
    }

    return p.geodeticFromDM(latDeg, latMin + (latSec / 60), lonDeg, lonMin + (lonSec / 60));
};

p.Geodetic.prototype.toString = function pGeodeticToString(sigDig) {
    sigDig = sigDig || 5;
    return (this.lat < 0 ? 'S' : 'N') + Math.abs(this.lat)
        .toFixed(sigDig) + (this.lon < 0 ? ' W' : ' E') + Math.abs(this.lon).toFixed(sigDig);
};

p.Geodetic.prototype.toStringDM = function pGeodeticToStringDM(sigDig) {
    var dmsLat = toDMHelper(this.lat);
    var dmsLon = toDMHelper(this.lon);
    sigDig = sigDig || 1; //Default to three significant digits, e.g. 34.2342351234' -> 34.2'

    return (dmsLat.deg < 0 ? 'S' : 'N') + Math.abs(dmsLat.deg) + ' ' + dmsLat.min.toFixed(sigDig) +
        (dmsLon.deg < 0 ? ' W' : ' E') + Math.abs(dmsLon.deg) + ' ' + dmsLon.min.toFixed(sigDig);
};

p.Geodetic.prototype.toStringDMS = function pGeodeticToStringDMS(sigDig) {
    var dmsLat = toDMSHelper(this.lat);
    var dmsLon = toDMSHelper(this.lon);
    sigDig = sigDig || 1; //Default to three significant digits, e.g. 34.2342351234" -> 34.2"

    return (dmsLat.deg < 0 ? 'S' : 'N') + Math.abs(dmsLat.deg) + ' ' + dmsLat.min + ' ' + dmsLat.sec.toFixed(sigDig) +
        (dmsLon.deg < 0 ? ' W' : ' E') + Math.abs(dmsLon.deg) + ' ' + dmsLon.min + ' ' + dmsLon.sec.toFixed(sigDig);
};

p.geodeticFromString = function pGeodeticFromString(string) {
    var result = false;
    if (string) {
        string = string.replace(/\s+/g, ' ').replace(/^\s*|\s*$/, ''); //trim and remove: ? + replace multi-spaces with single space
        var cardAfter = /^(90|[0-8]?\d(\.\d*)?)[d\u00b0]?\s?(N|S)?\,?\s?(180|1?[0-7]?\d(\.\d*)?)[d\u00b0]?\s?(E|W)?$/i.exec(string);
        var cardBefore = /^(N|S|-|\+)?\s?(90|[0-8]?\d(\.\d*)?)[d\u00b0]?\s?(E|W|\-|\s)?\,?\s?(180|1?[0-7]?\d(\.\d*)?)[d\u00b0]?$/i.exec(string);

        if (cardAfter) {
            result = new p.Geodetic(geoParseHelper(cardAfter[3]) * parseFloat(cardAfter[1]),
                geoParseHelper(cardAfter[6]) * parseFloat(cardAfter[4]));
        } else if (cardBefore) {
            result = new p.Geodetic(geoParseHelper(cardBefore[1]) * parseFloat(cardBefore[2]),
                geoParseHelper(cardBefore[4]) * parseFloat(cardBefore[5]));
        }
    }
    return result;
};

p.geodeticFromStringDegMin = function pGeodeticFromStringDegMin(string) {
    var result = false;
    if (string) {
        string = string.replace(/\s+/g, ' ').replace(/^\s*|\s*$/, ''); //Replace multi-space with single space
        var cardAfter = /^(90|[0-8]\d|\d\d|\d(?!\d))[d:\u00b0]?\s?([0-5]?\d(\.\d*)?)'?\s?(N|S)\,?\s?(180|1[0-7]\d|0\d\d|\d\d(?!\d)|\d(?!\d))[d:\u00b0]?\s?([0-5]?\d(\.\d*)?)'?\s?(E|W)$/i.exec(string);

        var cardBefore = /^(N|S|-|\+)?\s?(90|[0-8]\d|\d\d|\d(?!\d))[d:\u00b0]?\s?([0-5]?\d(\.\d*)?)'?\,?\s?(E|W|-|\+)?\s?(180|1[0-7]\d|0\d\d|\d\d(?!\d)|\d(?!\d))[d:\u00b0]?\s?([0-5]?\d(\.\d*)?)'?\s?$/i.exec(string);

        if (cardAfter) {
            result = p.geodeticFromDM(geoParseHelper(cardAfter[4]) * parseInt(cardAfter[1], 10), parseFloat(cardAfter[2]),
                geoParseHelper(cardAfter[8]) * parseInt(cardAfter[5], 10), parseFloat(cardAfter[6]));
        } else if (cardBefore) {
            result = p.geodeticFromDM(geoParseHelper(cardBefore[1]) * parseInt(cardBefore[2], 10), parseFloat(cardBefore[3]),
                geoParseHelper(cardBefore[5]) * parseInt(cardBefore[6], 10), parseFloat(cardBefore[7]));
        }
    }
    return result;
};

p.geodeticFromStringDegMinSec = function pGeodeticFromStringDegMinSec(string) {
    var result = false;
    if (string) {
        string = string.replace(/\s+/g, ' ').replace(/^\s*|\s*$/, ''); //Replace multi-space with single space
        var cardAfter = /^(90|[0-8]\d|\d\d|\d(?!\d))[d:\u00b0]?\s?([0-5]\d|\d(?!\d))[':]?\s?([0-5]?\d(\.\d*)?)"?\s?(N|S)(?:[\,|\s|\/]+)?(180|1[0-7]\d|(?:0)?\d\d|\d\d(?!\d)|\d(?!\d))[d:\u00b0]?\s?([0-5]\d|\d(?!\d))[':]?\s?([0-5]?\d(\.\d*)?)"?\s?(E|W)$/i.exec(string);

        var cardBefore = /^(N|S|-|\+)?\s?(90|[0-8]\d|\d\d|\d(?!\d))[d:\u00b0]?\s?([0-5]\d|\d(?!\d))[':]?\s?([0-5]?\d(\.\d*)?)"?\,?\s?(E|W|-|\+)?\s?(180|1[0-7]\d|0\d\d|\d\d(?!\d)|\d(?!\d))[d:\u00b0]?\s?([0-5]\d|\d(?!\d))[':]?\s?([0-5]?\d(\.\d*)?)"?\s?$/i.exec(string);

        if (cardAfter) {
            result = p.geodeticFromDMS(geoParseHelper(cardAfter[5]) * parseInt(cardAfter[1], 10), parseInt(cardAfter[2], 10), parseFloat(cardAfter[3]),
                geoParseHelper(cardAfter[10]) * parseInt(cardAfter[6], 10), parseInt(cardAfter[7], 10), parseFloat(cardAfter[8]));
        } else if (cardBefore) {
            result = p.geodeticFromDMS(geoParseHelper(cardBefore[1]) * parseInt(cardBefore[2], 10), parseInt(cardBefore[3], 10), parseFloat(cardBefore[4]),
                geoParseHelper(cardBefore[6]) * parseInt(cardBefore[7], 10), parseInt(cardBefore[8], 10), parseFloat(cardBefore[9]));
        }
    }
    return result;
};

p.MGRS = function pMGRSConstructor(utmZone, latBand, gridZone, easting, northing) {
    if (String(easting).length !== String(northing).length) {
        throw 'MGRS: precision difference';
    }
    if (Number(utmZone) < 1 || Number(utmZone) > 60) {
        throw 'MGRS: Invalid UTM zone';
    }
    if (!/[C-H]|[J-N]|[P-X]/i.test(latBand)) {
        throw 'MGRS: Invalid latBand';
    }
    if (!/[A-H]|[J-N]|[P-Z][A-H]|[J-N]|[P-V]/i.test(gridZone)) {
        throw 'MGRS: Invalid grid zone';
    }
    if (isNaN(easting)) {
        throw 'MGRS: Invalid easting';
    }
    if (isNaN(northing)) {
        throw 'MGRS: Invalid northing';
    }

    this.utmZone = utmZone;
    this.latBand = latBand.toUpperCase();
    this.gridZone = gridZone.toUpperCase();
    this.easting = easting;
    this.northing = northing;
};

p.MGRS.prototype = new p.Coordinate();

p.MGRS.prototype.toString = function pMGRSToString() {
    var e = String(Math.round(this.easting));
    var n = String(Math.round(this.northing));

    while (e.length < 5) {
        e = '0' + e;
    }

    while (n.length < 5) {
        n = '0' + n;
    }

    return this.utmZone + this.latBand + ' ' + this.gridZone + ' ' + this.easting + ' ' + this.northing;
};

p.mgrsFromString = function pMGRSFromString(string) {
    var result = false;
    if (string) {
        string = string.replace(/ /g, '');

        var pattern = /^([1-5]\d|60|[1-9])([C-H]|[J-N]|[P-X])(([A-H]|[J-N]|[P-Z])([A-H]|[J-N]|[P-V]))(\d{2}|\d{4}|\d{6}|\d{8}|\d{10})$/i;
        var temp = pattern.exec(string);
        var easting, northing;

        if (temp) {
            easting = temp[6].substr(0, temp[6].length / 2);
            northing = temp[6].substr(temp[6].length / 2);

            result = new p.MGRS(temp[1], temp[2], temp[3], easting, northing);
        }
    }
    return result;
};

p.UTM = function pUTMConstructor(zone, latBand, easting, northing) {
    zone = parseInt(zone, 10);
    if (zone < 1 || zone > 60) {
        throw 'Zone out of range';
    }
    if (latBands.indexOf(latBand) === -1) {
        throw 'Invalid latBand';
    }
    if (isNaN(easting)) {
        throw 'Invalid easting';
    }
    if (isNaN(northing)) {
        throw 'Invalid northing';
    }

    this.zone = zone;
    this.latBand = latBand.toUpperCase();
    this.easting = Number(easting);
    this.northing = Number(northing);
};

p.UTM.prototype = new p.Coordinate();

p.UTM.prototype.toString = function pUTMToString() {
    var e = String(Math.round(this.easting));
    var n = String(Math.round(this.northing));

    while (e.length < 6) {
        e = '0' + e;
    }

    while (n.length < 7) {
        n = '0' + n;
    }

    return this.zone + this.latBand + ' ' + e + ' ' + n;
};

p.utmFromString = function pUTMFromString(string) {
    var result = false;
    if (string) {
        var temp = /^([0-5]\d|60)\u0020?([C-H]|[J-N]|[P-X])\u0020?(\d{6})\u0020?(\d{7})$/i.exec(string);

        if (temp) {
            result = new p.UTM(temp[1], temp[2], temp[3], temp[4]);
        }
    }
    return result;
};

//=========================================================================
// Coordinate converters
//=========================================================================

p.convertGeodeticToMGRS = function pConvertGeodeticToMGRS(geo, precision) {
    var result = false;

    if (geo instanceof p.Geodetic) {
        var utm = p.convertGeodeticToUTM(geo);
        result = p.convertUTMToMGRS(utm, precision);
    }

    return result;
};

p.convertGeodeticToUTM = function pConvertGeodeticToUTM(geo) {
    var result = false;

    if (geo instanceof p.Geodetic) {
        var latRad, lonRad, lonOriginRad, utmZone, easting, northing, n, t, c, a, m, sinLatRad, cosLatRad, tanLatRad;

        if (geo.lat > 84 || geo.lat < -80) {
            throw 'Not supported. Lat must be between 80 degrees south and 84 degrees north';
        }

        if (geo.lon > 180 || geo.lon < -180) {
            throw 'Invalid longitude';
        }

        latRad = geo.lat * degToRad;
        lonRad = geo.lon * degToRad;
        utmZone = getZoneNumber(geo.lat, geo.lon);

        sinLatRad = Math.sin(latRad);
        cosLatRad = Math.cos(latRad);
        tanLatRad = Math.tan(latRad);
        lonOriginRad = ((utmZone - 1) * 6 - 180 + 3) * degToRad;

        n = wgs84a / Math.sqrt(1 - eSq * Math.pow(sinLatRad, 2));
        t = Math.pow(tanLatRad, 2);
        c = ePrimeSq * Math.pow(cosLatRad, 2);
        a = cosLatRad * (lonRad - lonOriginRad);
        m = wgs84a * ((1 - eSq / 4 - 3 * eFourth / 64 - 5 * eSixth / 256) * latRad -
            (3 * eSq / 8 + 3 * eFourth / 32 + 45 * eSixth / 1024) * Math.sin(2 * latRad) +
            (15 * eFourth / 256 + 45 * eSixth / 1024) * Math.sin(4 * latRad) -
            (35 * eSixth / 3072) * Math.sin(6 * latRad));

        easting = (kSub0 * n * (a + (1 - t + c) * Math.pow(a, 3) / 6 + (5 - 18 * Math.pow(t, 3) + 72 * c - 58 * ePrimeSq) * Math.pow(a, 5) / 120) + falseEasting);
        northing = (kSub0 * (m + n * tanLatRad * (Math.pow(a, 2) / 2 + (5 - t + 9 * c + 4 * Math.pow(c, 2)) * Math.pow(a, 4) / 24 +
            (61 - 58 * Math.pow(t, 3) + 600 * c - 330 * ePrimeSq) * Math.pow(a, 6) / 720)));

        if (geo.lat < 0) {
            northing += falseNorthing;
        }

        result = new p.UTM(utmZone, utmLatBand(geo.lat), easting, northing);
    }

    return result;
};

p.convertMGRSToGeodetic = function pConvertMGRSToGeodetic(mgrs) {
    var result = false;

    if (mgrs instanceof p.MGRS) {
        var utm = p.convertMGRSToUTM(mgrs);
        result = p.convertUTMToGeodetic(utm);
    }

    return result;
};

p.convertMGRSToUTM = function pConvertMGRSToUTM(mgrs) {
    var result = false;

    if (mgrs instanceof p.MGRS) {
        var utmNorthing, utmEasting, zoneBase, segBase, appxEast, appxNorth, letNorth, nSqrs, zoneStart;

        //Starts (southern edge) of N-S zones in millons of meters
        zoneBase = [
            1.1,
            2.0,
            2.9,
            3.8,
            4.7,
            5.6,
            6.5,
            7.3,
            8.2,
            9.1,
            0,
            0.8,
            1.7,
            2.6,
            3.5,
            4.4,
            5.3,
            6.2,
            7.0,
            7.9
        ];
        segBase = [0, 2, 2, 2, 4, 4, 6, 6, 8, 8, 0, 0, 0, 2, 2, 4, 4, 6, 6, 6];  //Starts of 2 million meter segments, indexed by zone
        appxEast = 1 + (gzdA.indexOf(mgrs.gridZone.substr(0, 1))) % gzSetColSize; // convert easting to UTM

        // convert northing to UTM
        if (mgrs.utmZone % 2)  //odd number zone
        {
            nSqrs = "ABCDEFGHJKLMNPQRSTUV".indexOf(mgrs.gridZone.substr(1));
        } else        // even number zone
        {
            nSqrs = "FGHJKLMNPQRSTUVABCDE".indexOf(mgrs.gridZone.substr(1));
        }

        letNorth = latBands.indexOf(mgrs.latBand);
        zoneStart = zoneBase[letNorth];
        appxNorth = Number(segBase[letNorth]) + nSqrs / 10;
        if (appxNorth < zoneStart) {
            appxNorth += 2;
        }

        utmNorthing = appxNorth * 1000000 + Number(mgrs.northing) * Math.pow(10, 5 - mgrs.northing.length);
        utmEasting = appxEast * 100000 + Number(mgrs.easting) * Math.pow(10, 5 - mgrs.easting.length);

        result = new p.UTM(mgrs.utmZone, mgrs.latBand, utmEasting, utmNorthing);
    }
    return result;
};

p.convertUTMToGeodetic = function pConvertMGRSToUTM(utm) {
    var result = false;

    if (utm instanceof p.UTM) {
        var x, y, lon0, m, upsilon, phiSub1, nSub1, cSub1, cSub1Sq, rSub1, d;
        var lat, lon, sinPhiSub1Sq, tSub1, tSub1Sq;

        x = utm.easting - falseEasting; // remove 500,000 meter offset for longitude
        y = utm.northing;

        if (latBands.indexOf(utm.latBand) < 10) //Remove northing offset for southern hemisphere
        {
            y -= falseNorthing;
        }

        lon0 = ((utm.zone - 1) * 6 - 180 + 3) * degToRad; // origin longitude for the zone (+3 puts origin in zone center)

        m = y / kSub0; // M is the true distance along the central meridian from the Equator to the latitude
        upsilon = m / (wgs84a * (1 - eSq / 4 - 3 * eFourth / 64 - 5 * eSixth / 256));

        // phi1 is the "footprint latitude" or the latitude at the central meridian which
        // has the same y coordinate as that of the point (phi (lat), lambda (lon) ).
        phiSub1 = upsilon + (3 * eSub1 / 2 - 27 * eSub1Third / 32) * Math.sin(2 * upsilon)
            + (21 * eSub1Sq / 16 - 55 * eSub1Fourth / 32) * Math.sin(4 * upsilon)
            + (151 * eSub1Third / 96) * Math.sin(6 * upsilon) + (1097 * eSub1Fourth / 512) * Math.sin(8 * upsilon);

        sinPhiSub1Sq = Math.pow(Math.sin(phiSub1), 2);
        tSub1 = Math.pow(Math.tan(phiSub1), 2);
        tSub1Sq = Math.pow(tSub1, 2);

        rSub1 = wgs84a * (1 - eSq) / Math.pow(1 - eSq * sinPhiSub1Sq, 1.5);
        nSub1 = wgs84a / Math.sqrt(1 - eSq * sinPhiSub1Sq);
        d = x / (nSub1 * kSub0);
        cSub1 = ePrimeSq * Math.pow(Math.cos(phiSub1), 2);
        cSub1Sq = Math.pow(cSub1, 2);

        // Calculate latitude, in decimal degrees
        lat = phiSub1 - (nSub1 * Math.tan(phiSub1) / rSub1) *
            (Math.pow(d, 2) / 2 - (5 + 3 * tSub1 + 10 * cSub1 - 4 * cSub1Sq - 9 * ePrimeSq) * Math.pow(d, 4) / 24 + (61 + 90 * tSub1 + 298 * cSub1 + 45 * tSub1 - 252 * ePrimeSq - 3 * cSub1Sq) * Math.pow(d, 6) / 720);
        lat = lat * radToDeg;

        // Calculate longitude, in decimal degrees
        lon = lon0 + ((d - (1 + 2 * tSub1 + cSub1) * Math.pow(d, 3) / 6 + (5 - 2 * cSub1 + 28 * tSub1 - 3 *
            cSub1Sq + 8 * ePrimeSq + 24 * tSub1Sq) * Math.pow(d, 5) / 120) / Math.cos(phiSub1));
        lon = lon * radToDeg;

        return new p.Geodetic(lat, lon);
    }

    return result;
};

p.convertUTMToMGRS = function pConvertUTMToMGRS(utm, precision) {
    var result = false;

    if (utm instanceof p.UTM) {
        var lat, lon, utmZone, utmEasting, utmNorthing, latBand, gridZone, mgrsEasting, mgrsNorthing;

        utmEasting = utm.easting;
        utmNorthing = utm.northing;
        latBand = utm.latBand;
        utmZone = utm.zone < 10 ? '0' + utm.zone : utm.zone; //Pad the utm zone if less than 10 to ensure the MGRS zone is two digits

        gridZone = findGridZone(utm.zone, utmEasting, utmNorthing);
        mgrsEasting = String(Math.round(utmEasting) % gridZoneSize).slice(0, precision);
        mgrsNorthing = String(Math.round(utmNorthing) % gridZoneSize).slice(0, precision);

        while (mgrsEasting.length < 5) {
            mgrsEasting = '0' + mgrsEasting;
        }

        while (mgrsNorthing.length < 5) {
            mgrsNorthing = '0' + mgrsNorthing;
        }

        result = new p.MGRS(utmZone, latBand, gridZone, mgrsEasting, mgrsNorthing);
    }

    return result;
};

p.getGeodeticFromUnknown = function pGetGeodeticFromUnknown(string) {
    var result = false;

    result = p.geodeticFromStringDegMinSec(string);

    if (!result) {
        result = p.geodeticFromStringDegMin(string);
    }
    if (!result) {
        result = p.geodeticFromString(string);
    }
    if (!result) {
        result = p.convertMGRSToGeodetic(p.mgrsFromString(string));
    }
    if (!result) {
        result = p.convertUTMToGeodetic(p.utmFromString(string));
    }

    return result;
};

//=========================================================================
// Area and Distance Helpers
//=========================================================================

/*
 * Given Two opposite corners of a bounding box, caculate the area of the box
 */
p.getGeodeticBoxArea = function pGetGeodeticBoxArea(cornerOne, cornerTwo) {
    var result = -1;
    if (cornerOne instanceof p.Geodetic && cornerTwo instanceof p.Geodetic) {
        result = (Math.PI / 180) * Math.pow(wgs84a, 2) * (Math.abs(Math.sin(cornerOne.lat * degToRad) - Math.sin(cornerTwo.lat * degToRad))) * Math.abs(cornerOne.lon - cornerTwo.lon);
    }

    return result;
};

//=========================================================================
// Conversion Helpers
//=========================================================================

function findGridZone(zone, easting, northing) {  //See TM 8358.1 Figure B-3
    var row = 0, col = 0, northingInt, eastingInt, l1, l2;
    var set = zone % 6;

    if (set === 0) {
        set = 6;
    }

    while (northing > 2000000) {
        northing -= 2000000;
    }

    col = Math.floor(Math.abs(easting) / gridZoneSize) - 1; // Get the col position for the square identifier that contains the point. -1 b/c strings are zero indexed
    row = Math.floor(Math.abs(northing) / gridZoneSize); // Get the row position for the square identifier that contains the point. -1 b/c strings are zero indexed

    l1 = gzdA.charAt(col + (((zone - 1) % 3) * gzSetColSize));
    l2 = gzdB.charAt((row + ((zone - 1) % 2 * 25)) % gzSetRowSize);

    return l1 + l2;
}

function getZoneNumber(lat, lon) {
    var result = parseInt((lon + 180) / 6, 10) + 1;
    var zoneNumber;
    lat = parseFloat(lat);
    lon = parseFloat(lon);

    // Handle special case of west coast of Norway
    if (lat >= 6.0 && lat < 64.0) {
        if (lon >= 0.0 && lon < 3.0) {
            zoneNumber = 31;
        }
        if (lon >= 3.0 && lon < 12.0) {
            zoneNumber = 32;
        }
    }

    // Special zones for Svalbard
    if (lat >= 72.0 && lat < 84.0) {
        if (lon >= 0.0 && lon < 9.0) {
            zoneNumber = 31;
        } else if (lon >= 9.0 && lon < 21.0) {
            zoneNumber = 33;
        } else if (lon >= 21.0 && lon < 33.0) {
            zoneNumber = 35;
        } else if (lon >= 33.0 && lon < 42.0) {
            zoneNumber = 37;
        }
    }

    return result;
}

function geoParseHelper(string) {
    var result = 1;

    if (/[SW-]/i.test(string)) {
        result = -1;
    }

    return result;
}

function toDMHelper(coord) {
    var deg, min;
    deg = coord < 0 ? Math.ceil(coord) : Math.floor(coord);
    min = Math.abs((coord - deg) * 60);

    return {
        deg: deg,
        min: Math.floor(min)
    };
}

function toDMSHelper(coord) {
    P.Tracing.trace(tracingLevels.Verbose);
    var deg = coord < 0 ? Math.ceil(coord) : Math.floor(coord);
    var min = Math.abs((coord - deg) * 60);
    var sec = ((min - Math.floor(min)) * 60);

    return {
        deg: deg,
        min: Math.floor(min),
        sec: sec
    };
}

function utmLatBand(lat) {
    var result = false;
    lat = parseFloat(lat);

    if ((84 >= lat) && (lat >= 72)) {
        result = 'X';
    } else if ((72 > lat) && (lat >= 64)) {
        result = 'W';
    } else if ((64 > lat) && (lat >= 56)) {
        result = 'V';
    } else if ((56 > lat) && (lat >= 48)) {
        result = 'U';
    } else if ((48 > lat) && (lat >= 40)) {
        result = 'T';
    } else if ((40 > lat) && (lat >= 32)) {
        result = 'S';
    } else if ((32 > lat) && (lat >= 24)) {
        result = 'R';
    } else if ((24 > lat) && (lat >= 16)) {
        result = 'Q';
    } else if ((16 > lat) && (lat >= 8)) {
        result = 'P';
    } else if ((8 > lat) && (lat >= 0)) {
        result = 'N';
    } else if ((0 > lat) && (lat >= -8)) {
        result = 'M';
    } else if ((-8 > lat) && (lat >= -16)) {
        result = 'L';
    } else if ((-16 > lat) && (lat >= -24)) {
        result = 'K';
    } else if ((-24 > lat) && (lat >= -32)) {
        result = 'J';
    } else if ((-32 > lat) && (lat >= -40)) {
        result = 'H';
    } else if ((-40 > lat) && (lat >= -48)) {
        result = 'G';
    } else if ((-48 > lat) && (lat >= -56)) {
        result = 'F';
    } else if ((-56 > lat) && (lat >= -64)) {
        result = 'E';
    } else if ((-64 > lat) && (lat >= -72)) {
        result = 'D';
    } else if ((-72 > lat) && (lat >= -80)) {
        result = 'C';
    }

    return result;
}

module.exports = p;
