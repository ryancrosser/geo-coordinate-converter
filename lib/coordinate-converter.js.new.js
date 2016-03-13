import Geodetic from './geodetic.js';
import MGRS from './mgrs.js';
import UTM from './utm.js';

import helpers from './helpers.js';

class CoordinateConverter {
    const degToRad = Math.PI / 180;
    const radToDeg = 180.0 / Math.PI;
    const wgs84a = 6378137.0; //Radius of the equator of the WGS 84 projection (i.e. semi-major axis)
    const wgs84iF = 298.257223563; //Inverse flattening (1/f) of the WGS 84 projection
    const kSub0 = 0.9996; // scale factor at the central meridian
    const eSq = 0.00669437999014132; // first eccentricity squared. eSq = 2f - f^2
    const eFourth = Math.pow(eSq,2); //(eSq)^2
    const eSixth = Math.pow(eSq,3); // (eSq)^3
    const ePrimeSq = 0.00673949674227643; //second eccentricity squared. ePrimeSq = eSq / (1-eSq)
    const eSub1 = (1 - Math.sqrt(1 - eSq)) / (1 + Math.sqrt(1 - eSq));
    const eSub1Sq = Math.pow(eSub1,2);
    const eSub1Third = Math.pow(eSub1,3);
    const eSub1Fourth = Math.pow(eSub1Sq,2);
    const falseEasting = 500000.0;
    const falseNorthing = 10000000.0;
    const gridZoneSize = 100000;
    const gzSetColSize = 8;  // column width of grid square set
    const gzSetRowSize = 20; // row height of grid square set
    const gzdA = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const gzdB = 'ABCDEFGHJKLMNPQRSTUV';
    const latBands = 'CDEFGHJKLMNPQRSTUVWX';

    constructor(){

    }

    convertGeodeticToMGRS(geo, precision) {
        var result = false;

        if(geo instanceof Geodetic) {
            var utm = p.convertGeodeticToUTM(geo);
            result = p.convertUTMToMGRS(utm, precision);
        }

        return result;
    }


    convertGeodeticToUTMpConvertGeodeticToUTM(geo) {
        var result = false;

        if(geo instanceof Geodetic) {
            var latRad, lngRad, lngOriginRad, utmZone, easting, northing, n, t, c, a, m, sinLatRad, cosLatRad, tanLatRad;

            if(geo.lat > 84 || geo.lat < -80){
                throw 'Not supported. Lat must be between 80 degrees south and 84 degrees north';
            }

            if(geo.lng > 180 || geo.lng < -180) {
                throw 'Invalid longitude';
            }

            latRad = geo.lat * degToRad;
            lngRad = geo.lng * degToRad;
            utmZone = helpers.getZoneNumber(geo.lat,geo.lng);

            sinLatRad = Math.sin(latRad);
            cosLatRad = Math.cos(latRad);
            tanLatRad = Math.tan(latRad);
            lngOriginRad = ((utmZone - 1) * 6 - 180 + 3) * degToRad;

            n = wgs84a / Math.sqrt(1 - eSq * Math.pow(sinLatRad,2));
            t = Math.pow(tanLatRad, 2);
            c = ePrimeSq * Math.pow(cosLatRad,2);
            a = cosLatRad * (lngRad - lngOriginRad);
            m = wgs84a * (( 1 - eSq / 4 - 3 * eFourth / 64 - 5 * eSixth / 256) * latRad -
                ( 3 * eSq / 8 + 3 * eFourth / 32 + 45 * eSixth / 1024) * Math.sin(2 * latRad) +
                (15 * eFourth / 256 + 45 * eSixth / 1024) * Math.sin(4 * latRad) -
                (35 * eSixth / 3072) * Math.sin(6 * latRad));

            easting = (kSub0 * n * (a + (1 - t + c) * Math.pow(a,3) / 6 + (5 - 18 * Math.pow(t,3) + 72 * c - 58 * ePrimeSq ) * Math.pow(a,5) / 120) + falseEasting);
            northing = (kSub0 * (m + n * tanLatRad * (Math.pow(a,2) / 2 + (5 - t + 9 * c + 4 * Math.pow(c,2)) * Math.pow(a,4) / 24 +
            (61 - 58 * Math.pow(t,3) + 600 * c - 330 * ePrimeSq) * Math.pow(a,6) / 720)));

            if(geo.lat < 0)
                northing += falseNorthing;

            result = new UTM(utmZone, utmLatBand(geo.lat), easting, northing);
        }

        return result;
    }

    convertMGRSToGeodetic(mgrs) {
        var result = false;

        if(mgrs instanceof MGRS) {
            var utm = this.convertMGRSToUTM(mgrs);
            result = this.convertUTMToGeodetic(utm);
        }

        return result;
    };

    convertMGRSToUTMpConvertMGRSToUTM(mgrs) {
        var result = false;

        if(mgrs instanceof p.MGRS) {
            var utmNorthing, utmEasting, zoneBase, segBase, appxEast, appxNorth, letNorth, nSqrs, zoneStart;

            //Starts (southern edge) of N-S zones in millons of meters
            zoneBase = [1.1,2.0,2.9,3.8,4.7,5.6,6.5,7.3,8.2,9.1,0,0.8,1.7,2.6,3.5,4.4,5.3,6.2,7.0,7.9];
            segBase = [0,2,2,2,4,4,6,6,8,8,0,0,0,2,2,4,4,6,6,6];  //Starts of 2 million meter segments, indexed by zone
            appxEast=1+(gzdA.indexOf(mgrs.gridZone.substr(0,1)))%gzSetColSize; // convert easting to UTM

            // convert northing to UTM
            if (mgrs.utmZone%2)  //odd number zone
                nSqrs="ABCDEFGHJKLMNPQRSTUV".indexOf(mgrs.gridZone.substr(1));
            else        // even number zone
                nSqrs="FGHJKLMNPQRSTUVABCDE".indexOf(mgrs.gridZone.substr(1));

            letNorth = latBands.indexOf(mgrs.latBand);
            zoneStart = zoneBase[letNorth];
            appxNorth = Number(segBase[letNorth])+nSqrs/10;
            if (appxNorth < zoneStart)
                appxNorth += 2;

            utmNorthing = appxNorth*1000000+Number(mgrs.northing)*Math.pow(10,5-mgrs.northing.length);
            utmEasting = appxEast*100000+Number(mgrs.easting)*Math.pow(10,5-mgrs.easting.length);

            result = new UTM(mgrs.utmZone, mgrs.latBand, utmEasting, utmNorthing);
        }
        return result;
    }

    convertUTMToGeodetic(utm) {
        var result = false;

        if(utm instanceof p.UTM) {
            var x, y, lng0, m, upsilon, phiSub1, nSub1, cSub1, cSub1Sq, rSub1, d;
            var lat, lng, sinPhiSub1Sq, tSub1, tSub1Sq;

            x = utm.easting - falseEasting; // remove 500,000 meter offset for longitude
            y = utm.northing;

            if(latBands.indexOf(utm.latBand) < 10) //Remove northing offset for southern hemisphere
                y -= falseNorthing;

            lng0 = ((utm.zone - 1) * 6 - 180 + 3) * degToRad; // origin longitude for the zone (+3 puts origin in zone center)

            m = y / kSub0; // M is the true distance along the central meridian from the Equator to the latitude
            upsilon = m / ( wgs84a * (1 - eSq / 4 - 3 * eFourth / 64 - 5 * eSixth / 256 ));

            // phi1 is the "footprint latitude" or the latitude at the central meridian which
            // has the same y coordinate as that of the point (phi (lat), lambda (lon) ).
            phiSub1 = upsilon + (3 * eSub1 / 2 - 27 * eSub1Third / 32) * Math.sin(2 * upsilon)
                + (21 * eSub1Sq / 16 - 55 * eSub1Fourth / 32) * Math.sin(4 * upsilon)
                + (151 * eSub1Third / 96) * Math.sin(6 * upsilon) + (1097 * eSub1Fourth / 512) * Math.sin(8 * upsilon);

            sinPhiSub1Sq = Math.pow(Math.sin(phiSub1),2);
            tSub1 = Math.pow(Math.tan(phiSub1),2);
            tSub1Sq = Math.pow(tSub1,2);

            rSub1 = wgs84a * (1 - eSq) / Math.pow(1 - eSq * sinPhiSub1Sq, 1.5);
            nSub1 = wgs84a / Math.sqrt( 1 - eSq * sinPhiSub1Sq);
            d = x / (nSub1 * kSub0);
            cSub1 = ePrimeSq * Math.pow(Math.cos(phiSub1),2);
            cSub1Sq = Math.pow(cSub1,2);

            // Calculate latitude, in decimal degrees
            lat = phiSub1 - (nSub1*Math.tan(phiSub1)/rSub1)*
                (Math.pow(d,2)/2-(5+3*tSub1+10*cSub1-4*cSub1Sq-9*ePrimeSq)*Math.pow(d,4)/24+(61+90*tSub1+298*cSub1+45*tSub1-252*ePrimeSq-3*cSub1Sq)*Math.pow(d,6)/720);
            lat = lat * radToDeg;

            // Calculate longitude, in decimal degrees
            lng = lng0 + ((d - (1 + 2 * tSub1 + cSub1) * Math.pow(d,3) / 6 + (5 - 2 * cSub1 + 28 * tSub1 - 3 *
                cSub1Sq + 8 * ePrimeSq + 24 * tSub1Sq) * Math.pow(d,5) / 120) / Math.cos(phiSub1));
            lng = lng * radToDeg;

            return new Geodetic(lat, lng);
        }

        return result;
    }

    convertUTMToMGRS(utm, precision) {
        var result = false;

        if(utm instanceof p.UTM) {
            var lat, lng, utmZone, utmEasting, utmNorthing, latBand, gridZone, mgrsEasting, mgrsNorthing;

            utmEasting = utm.easting;
            utmNorthing = utm.northing;
            latBand = utm.latBand;
            utmZone = utm.zone < 10 ? '0' + utm.zone : utm.zone; //Pad the utm zone if less than 10 to ensure the MGRS zone is two digits

            gridZone = helpers.findGridZone(utm.zone ,utmEasting, utmNorthing);
            mgrsEasting = String(Math.round(utmEasting) % gridZoneSize).slice(0,precision);
            mgrsNorthing = String(Math.round(utmNorthing) % gridZoneSize).slice(0,precision);

            while(mgrsEasting.length < 5) {
                mgrsEasting = '0' + mgrsEasting;
            }

            while(mgrsNorthing.length < 5) {
                mgrsNorthing = '0' + mgrsNorthing;
            }

            result = new MGRS(utmZone,latBand,gridZone,mgrsEasting,mgrsNorthing);
        }

        return result;
    }

    getGeodeticFromUnknown(string) {
        var result = false;

        result = Geodetic.geodeticFromStringDegMinSec(string);

        if(result === false)
            result = Geodetic.geodeticFromStringDegMin(string);
        if(result === false)
            result = Geodetic.geodeticFromString(string);
        if(result === false)
            result = Geodetic.convertMGRSToGeodetic(MGRS.mgrsFromString(string));
        if(result === false)
            result = Geodetic.convertUTMToGeodetic(UTM.utmFromString(string));

        return result;
    }

}