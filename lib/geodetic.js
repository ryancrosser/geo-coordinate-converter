class Geodetic {
    constructor(lat, lon){
        if(isNaN(lat))
            throw 'Latitude is not a number';
        if(isNaN(lon))
            throw 'Longitude is not a number';

        this.lat = Number(lat);
        this.lng = Number(lon);

        if(lat < -90 || lat > 90)
            throw 'Latitude out of range';
        if(lon < -180 || lon > 180)
            throw 'Longitude out of range';
    }

    geodeticFromDM(latDeg, latMin, lngDeg, lngMin){
        if(isNaN(latDeg))
            throw 'Latitude degrees is not a number';
        if(isNaN(latMin))
            throw 'Latitude minute is not a number';
        if(isNaN(lngDeg))
            throw 'Longitude degrees is not a number';
        if(isNaN(lngMin))
            throw 'Longitude minute is not a number';

        latDeg = parseInt(latDeg, 10);
        lngDeg = parseInt(lngDeg, 10);
        latMin = parseFloat(latMin);
        lngMin = parseFloat(lngMin);

        if(latDeg < -90 || latDeg > 90)
            throw 'Latitude degree out of range';
        if(latMin < 0 || latMin >= 60)
            throw 'Latitude minute out of range';
        if(lngDeg < -180 || lngDeg > 180)
            throw 'Longitude degree out of range';
        if(lngMin < 0 || lngMin >= 60)
            throw 'Longitude minute out of range';

        return new p.Geodetic((latDeg < 0 ? -1 : 1) * (Math.abs(latDeg) + (latMin / 60)), (lngDeg < 0 ? -1 : 1) * (Math.abs(lngDeg) + (lngMin / 60)));
    }

    geodeticFromDMS(latDeg, latMin, latSec, lngDeg, lngMin, lngSec){
        if(isNaN(latMin))
            throw 'Latitude minute is not a number';
        if(isNaN(latSec))
            throw 'Latitude second is not a number';
        if(isNaN(lngMin))
            throw 'Longitude minute is not a number';
        if(isNaN(lngSec))
            throw 'Longitude second is not a number';

        this.latDeg = parseInt(latDeg, 10);
        this.latMin = parseInt(latMin, 10);
        this.latSec = parseFloat(latSec);
        this.lngDeg = parseInt(lngDeg, 10);
        this.lngMin = parseInt(lngMin, 10);
        this.lngSec = parseFloat(lngSec);

        if(latDeg < -90 || latDeg > 90)
            throw 'Latitude degree out of range';
        if(latMin < 0 || latMin >= 60)
            throw 'Latitude minute out of range';
        if(latSec < 0 || latSec >= 60)
            throw 'Latitude second out of range';
        if(lngDeg < -180 || lngDeg > 180)
            throw 'Longitude degree out of range';
        if(lngMin < 0 || lngMin >= 60)
            throw 'Longitude minute out of range';
        if(lngSec < 0 || lngSec >= 60)
            throw 'Longitude second out of range';

        return p.geodeticFromDM(latDeg, latMin + (latSec/60), lngDeg, lngMin + (lngSec/60));
    }

    toString(sigDig){
        sigDig = sigDig || 5;
        return (this.lat < 0 ? 'S' : 'N') + Math.abs(this.lat).toFixed(sigDig) + (this.lng < 0 ? ' W' : ' E') + Math.abs(this.lng).toFixed(sigDig);
    }

    toStringDM(sigDig){
        var dmsLat = toDMHelper(this.lat);
        var dmsLng = toDMHelper(this.lng);
        sigDig = sigDig || 1; //Default to three significant digits, e.g. 34.2342351234' -> 34.2'

        return (dmsLat.deg < 0 ? 'S' : 'N') + Math.abs(dmsLat.deg) + ' ' + dmsLat.min.toFixed(sigDig) +
            (dmsLng.deg < 0 ? ' W' : ' E') + Math.abs(dmsLng.deg) + ' ' + dmsLng.min.toFixed(sigDig);
    }

    toStringDMS(sigDig){
        var dmsLat = toDMSHelper(this.lat);
        var dmsLng = toDMSHelper(this.lng);
        sigDig = sigDig || 1; //Default to three significant digits, e.g. 34.2342351234" -> 34.2"

        return (dmsLat.deg < 0 ? 'S' : 'N') + Math.abs(dmsLat.deg) + ' ' + dmsLat.min + ' ' + dmsLat.sec.toFixed(sigDig) +
            (dmsLng.deg < 0 ? ' W' : ' E') + Math.abs(dmsLng.deg) + ' ' + dmsLng.min + ' ' + dmsLng.sec.toFixed(sigDig);
    }

    static geodeticFromString(string){
        var result = false;
        if(string){
            string = string.replace(/\s+/g,' ').replace(/^\s*|\s*$/,''); //trim and remove: ? + replace multi-spaces with single space
            var cardAfter = /^(90|[0-8]?\d(\.\d*)?)[d\u00b0]?\s?(N|S)?\,?\s?(180|1?[0-7]?\d(\.\d*)?)[d\u00b0]?\s?(E|W)?$/i.exec(string);
            var cardBefore = /^(N|S|-|\+)?\s?(90|[0-8]?\d(\.\d*)?)[d\u00b0]?\s?(E|W|\-|\s)?\,?\s?(180|1?[0-7]?\d(\.\d*)?)[d\u00b0]?$/i.exec(string);


            if(cardAfter !== false) {
                result = new p.Geodetic(geoParseHelper(cardAfter[3]) * parseFloat(cardAfter[1]),
                    geoParseHelper(cardAfter[6]) * parseFloat(cardAfter[4]));
            } else if (cardBefore !== false) {
                result = new p.Geodetic(geoParseHelper(cardBefore[1]) * parseFloat(cardBefore[2]),
                    geoParseHelper(cardBefore[4]) * parseFloat(cardBefore[5]));
            }
        }
        return result;
    }

    static geodeticFromStringDegMin(string){
        var result = false;
        if(string){
            string = string.replace(/\s+/g,' ').replace(/^\s*|\s*$/,''); //Replace multi-space with single space
            var cardAfter = /^(90|[0-8]\d|\d\d|\d(?!\d))[d:\u00b0]?\s?([0-5]?\d(\.\d*)?)'?\s?(N|S)\,?\s?(180|1[0-7]\d|0\d\d|\d\d(?!\d)|\d(?!\d))[d:\u00b0]?\s?([0-5]?\d(\.\d*)?)'?\s?(E|W)$/i.exec(string);

            var cardBefore = /^(N|S|-|\+)?\s?(90|[0-8]\d|\d\d|\d(?!\d))[d:\u00b0]?\s?([0-5]?\d(\.\d*)?)'?\,?\s?(E|W|-|\+)?\s?(180|1[0-7]\d|0\d\d|\d\d(?!\d)|\d(?!\d))[d:\u00b0]?\s?([0-5]?\d(\.\d*)?)'?\s?$/i.exec(string);

            if(cardAfter != false) {
                result = p.geodeticFromDM(geoParseHelper(cardAfter[4]) * parseInt(cardAfter[1], 10), parseFloat(cardAfter[2]),
                    geoParseHelper(cardAfter[8]) * parseInt(cardAfter[5], 10), parseFloat(cardAfter[6]));
            } else if (cardBefore !== false) {
                result = p.geodeticFromDM(geoParseHelper(cardBefore[1]) * parseInt(cardBefore[2], 10), parseFloat(cardBefore[3]),
                    geoParseHelper(cardBefore[5]) * parseInt(cardBefore[6], 10), parseFloat(cardBefore[7]));
            }
        }
        return result;
    }

    static geodeticFromStringDegMinSec(string){
        var result = false;
        if(string){
            string = string.replace(/\s+/g,' ').replace(/^\s*|\s*$/,''); //Replace multi-space with single space
            var cardAfter = /^(90|[0-8]\d|\d\d|\d(?!\d))[d:\u00b0]?\s?([0-5]\d|\d(?!\d))[':]?\s?([0-5]?\d(\.\d*)?)"?\s?(N|S)(?:[\,|\s|\/]+)?(180|1[0-7]\d|(?:0)?\d\d|\d\d(?!\d)|\d(?!\d))[d:\u00b0]?\s?([0-5]\d|\d(?!\d))[':]?\s?([0-5]?\d(\.\d*)?)"?\s?(E|W)$/i.exec(string);

            var cardBefore = /^(N|S|-|\+)?\s?(90|[0-8]\d|\d\d|\d(?!\d))[d:\u00b0]?\s?([0-5]\d|\d(?!\d))[':]?\s?([0-5]?\d(\.\d*)?)"?\,?\s?(E|W|-|\+)?\s?(180|1[0-7]\d|0\d\d|\d\d(?!\d)|\d(?!\d))[d:\u00b0]?\s?([0-5]\d|\d(?!\d))[':]?\s?([0-5]?\d(\.\d*)?)"?\s?$/i.exec(string);

            if(cardAfter !== false) {
                result = p.geodeticFromDMS(geoParseHelper(cardAfter[5]) * parseInt(cardAfter[1], 10), parseInt(cardAfter[2], 10), parseFloat(cardAfter[3]),
                    geoParseHelper(cardAfter[10]) * parseInt(cardAfter[6], 10), parseInt(cardAfter[7], 10), parseFloat(cardAfter[8]));
            } else if (cardBefore !== false) {
                result = p.geodeticFromDMS(geoParseHelper(cardBefore[1]) * parseInt(cardBefore[2], 10), parseInt(cardBefore[3], 10), parseFloat(cardBefore[4]),
                    geoParseHelper(cardBefore[6]) * parseInt(cardBefore[7], 10), parseInt(cardBefore[8], 10), parseFloat(cardBefore[9]));
            }
        }
        return result;
    }
}