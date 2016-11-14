import LatLon from './lat-lon';
import UTM from './utm.new.js';
import { convertToLatLonObj, get100kID } from './helpers.new.js';

import CONSTANTS from './constants';

export default class MGRS {
    constructor() {
        this.utm = new UTM();
    }
    /**
     * Conversion of lat/lon to MGRS.
     *
     * @param {object} ll Object literal with lat and lon properties on a
     *     WGS84 ellipsoid.
     * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
     *      100 m, 2 for 1000 m or 1 for 10000 m). Optional, default is 5.
     * @return {string} the MGRS string for the given location and accuracy.
     */
    toMGRS(llObj, accuracy) {
        // convert to LatLon Object, if necessary
        llObj = convertToLatLonObj(llObj);

        accuracy = accuracy || 5; // default accuracy 1m
        return this.encode(this.utm.LLtoUTM(llObj), accuracy);
    }

    /**
     * Conversion of MGRS to lat/lon.
     *
     * @param {string} mgrs MGRS string.
     * @return {array} An array with left (longitude), bottom (latitude), right
     *     (longitude) and top (latitude) values in WGS84, representing the
     *     bounding box for the provided MGRS reference.
     */
    toBbox(mgrs) {
        var bbox = this.utm.UTMtoLL(this.decode(mgrs.toUpperCase()));
        if (bbox.lat && bbox.lon) {

            return [bbox.lon, bbox.lat, bbox.lon, bbox.lat];
        }
        return {
            'bottom-left': new LatLon(bbox.bottom, bbox.left),
            'top-right': new LatLon(bbox.top, bbox.right)
        };
    }

    toPoint(mgrs) {
        var bbox = this.utm.UTMtoLL(this.decode(mgrs.toUpperCase()));
        if (bbox.lat && bbox.lon) {
            return [bbox.lon, bbox.lat];
        }
        return [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2];
    }

    /**
     * Decode the UTM parameters from a MGRS string.
     *
     * @param {string} mgrsString an UPPERCASE coordinate string is expected.
     * @return {object} An object literal with easting, northing, zoneLetter,
     *     zoneNumber and accuracy (in meters) properties.
     */
    decode(mgrsString) {
        if (mgrsString && mgrsString.length === 0) {
            throw new Error("MGRSPoint coverting from nothing");
        }

        var length = mgrsString.length;

        var hunK = null;
        var sb = "";
        var testChar;
        var i = 0;

        // get Zone number
        while (!(/[A-Z]/).test(testChar = mgrsString.charAt(i))) {
            if (i >= 2) {
                throw new Error("MGRSPoint bad conversion from: " + mgrsString);
            }
            sb += testChar;
            i++;
        }

        var zoneNumber = parseInt(sb, 10);

        if (i === 0 || i + 3 > length) {
            // A good MGRS string has to be 4-5 digits long,
            // ##AAA/#AAA at least.
            throw new Error("MGRSPoint bad conversion from: " + mgrsString);
        }

        var zoneLetter = mgrsString.charAt(i++);

        // Should we check the zone letter here? Why not.
        if (zoneLetter <= 'A' || zoneLetter === 'B' || zoneLetter === 'Y' || zoneLetter >= 'Z' || zoneLetter === 'I' || zoneLetter === 'O') {
            throw new Error("MGRSPoint zone letter " + zoneLetter + " not handled: " + mgrsString);
        }

        hunK = mgrsString.substring(i, i += 2);

        var set = this.get100kSetForZone(zoneNumber);

        var east100k = this.getEastingFromChar(hunK.charAt(0), set);
        var north100k = this.getNorthingFromChar(hunK.charAt(1), set);

        // We have a bug where the northing may be 2000000 too low.
        // How
        // do we know when to roll over?

        while (north100k < this.getMinNorthing(zoneLetter)) {
            north100k += 2000000;
        }

        // calculate the char index for easting/northing separator
        var remainder = length - i;

        if (remainder % 2 !== 0) {
            throw new Error("MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters" + mgrsString);
        }

        var sep = remainder / 2;

        var sepEasting = 0.0;
        var sepNorthing = 0.0;
        var accuracyBonus, sepEastingString, sepNorthingString, easting, northing;
        if (sep > 0) {
            accuracyBonus = 100000.0 / Math.pow(10, sep);
            sepEastingString = mgrsString.substring(i, i + sep);
            sepEasting = parseFloat(sepEastingString) * accuracyBonus;
            sepNorthingString = mgrsString.substring(i + sep);
            sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
        }

        easting = sepEasting + east100k;
        northing = sepNorthing + north100k;

        return {
            easting: easting,
            northing: northing,
            zoneLetter: zoneLetter,
            zoneNumber: zoneNumber,
            accuracy: accuracyBonus
        };
    }

    /**
     * Encodes a UTM location as MGRS string.
     *
     * @param {object} utm An object literal with easting, northing,
     *     zoneLetter, zoneNumber
     * @param {number} accuracy Accuracy in digits (1-5).
     * @return {string} MGRS string for the given UTM location.
     */
    encode(utm, accuracy) {
        // prepend with leading zeroes
        var seasting = "00000" + utm.easting,
            snorthing = "00000" + utm.northing;

        return {
            utmZone: utm.zoneNumber,
            latBand: utm.zoneLetter,
            gridZone: get100kID(utm.easting, utm.northing, utm.zoneNumber),
            easting: seasting.substr(seasting.length - 5, accuracy),
            northing: snorthing.substr(snorthing.length - 5, accuracy)
        }
    }

    /**
     * Given a UTM zone number, figure out the MGRS 100K set it is in.
     *
     * @param {number} utmZoneNumber An UTM zone number.
     * @return {number} the 100k set the UTM zone is in.
     */
    get100kSetForZone(utmZoneNumber) {
        var setParm = utmZoneNumber % CONSTANTS.NUM_100K_SETS;
        if (setParm === 0) {
            setParm = CONSTANTS.NUM_100K_SETS;
        }

        return setParm;
    }

    /**
     * Given the second letter from a two-letter MGRS 100k zone, and given the
     * MGRS table set for the zone number, figure out the northing value that
     * should be added to the other, secondary northing value. You have to
     * remember that Northings are determined from the equator, and the vertical
     * cycle of letters mean a 2000000 additional northing meters. This happens
     * approx. every 18 degrees of latitude. This method does *NOT* count any
     * additional northings. You have to figure out how many 2000000 meters need
     * to be added for the zone letter of the MGRS coordinate.
     *
     * @param {char} n Second letter of the MGRS 100k zone
     * @param {number} set The MGRS table set number, which is dependent on the
     *     UTM zone number.
     * @return {number} The northing value for the given letter and set.
     */
    getNorthingFromChar(n, set) {

        if (n > 'V') {
            throw new Error("MGRSPoint given invalid Northing " + n);
        }

        // rowOrigin is the letter at the origin of the set for the
        // column
        var curRow = CONSTANTS.SET_ORIGIN_ROW_LETTERS.charCodeAt(set - 1);
        var northingValue = 0.0;
        var rewindMarker = false;

        while (curRow !== n.charCodeAt(0)) {
            curRow++;
            if (curRow === CONSTANTS.I) {
                curRow++;
            }
            if (curRow === CONSTANTS.O) {
                curRow++;
            }
            // fixing a bug making whole application hang in this loop
            // when 'n' is a wrong character
            if (curRow > CONSTANTS.V) {
                if (rewindMarker) { // making sure that this loop ends
                    throw new Error("Bad character: " + n);
                }
                curRow = CONSTANTS.A;
                rewindMarker = true;
            }
            northingValue += 100000.0;
        }

        return northingValue;
    }

    /**
     * Given the first letter from a two-letter MGRS 100k zone, and given the
     * MGRS table set for the zone number, figure out the easting value that
     * should be added to the other, secondary easting value.
     *
     * @param {char} e The first letter from a two-letter MGRS 100´k zone.
     * @param {number} set The MGRS table set for the zone number.
     * @return {number} The easting value for the given letter and set.
     */
    getEastingFromChar(e, set) {
        // colOrigin is the letter at the origin of the set for the
        // column
        var curCol = CONSTANTS.SET_ORIGIN_COLUMN_LETTERS.charCodeAt(set - 1);
        var eastingValue = 100000.0;
        var rewindMarker = false;

        while (curCol !== e.charCodeAt(0)) {
            curCol++;
            if (curCol === CONSTANTS.I) {
                curCol++;
            }
            if (curCol === CONSTANTS.O) {
                curCol++;
            }
            if (curCol > CONSTANTS.Z) {
                if (rewindMarker) {
                    throw new Error("Bad character: " + e);
                }
                curCol = CONSTANTS.A;
                rewindMarker = true;
            }
            eastingValue += 100000.0;
        }

        return eastingValue;
    }

    /**
     * The function getMinNorthing returns the minimum northing value of a MGRS
     * zone.
     *
     * Ported from Geotrans' c Lattitude_Band_Value structure table.
     *
     * @param {char} zoneLetter The MGRS zone to get the min northing for.
     * @return {number}
     */
    getMinNorthing(zoneLetter) {
        var northing;
        switch (zoneLetter) {
            case 'C':
                northing = 1100000.0;
                break;
            case 'D':
                northing = 2000000.0;
                break;
            case 'E':
                northing = 2800000.0;
                break;
            case 'F':
                northing = 3700000.0;
                break;
            case 'G':
                northing = 4600000.0;
                break;
            case 'H':
                northing = 5500000.0;
                break;
            case 'J':
                northing = 6400000.0;
                break;
            case 'K':
                northing = 7300000.0;
                break;
            case 'L':
                northing = 8200000.0;
                break;
            case 'M':
                northing = 9100000.0;
                break;
            case 'N':
                northing = 0.0;
                break;
            case 'P':
                northing = 800000.0;
                break;
            case 'Q':
                northing = 1700000.0;
                break;
            case 'R':
                northing = 2600000.0;
                break;
            case 'S':
                northing = 3500000.0;
                break;
            case 'T':
                northing = 4400000.0;
                break;
            case 'U':
                northing = 5300000.0;
                break;
            case 'V':
                northing = 6200000.0;
                break;
            case 'W':
                northing = 7000000.0;
                break;
            case 'X':
                northing = 7900000.0;
                break;
            default:
                northing = -1.0;
        }
        if (northing >= 0.0) {
            return northing;
        }
        else {
            throw new Error("Invalid zone letter: " + zoneLetter);
        }
    }
}
