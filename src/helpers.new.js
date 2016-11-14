import CONSTANTS from './constants';
import LatLon from './lat-lon';

/**
 * Conversion from degrees to radians.
 *
 * @public
 * @param {number} deg the angle in degrees.
 * @return {number} the angle in radians.
 */
export function degToRad(deg) {
    return (deg * (Math.PI / 180.0));
}

/**
 * Conversion from radians to degrees.
 *
 * @public
 * @param {number} rad the angle in radians.
 * @return {number} the angle in degrees.
 */
export function radToDeg(rad) {
    return (180.0 * (rad / Math.PI));
}

/**
 * Calculates the MGRS letter designator for the given latitude.
 *
 * @public
 * @param {number} lat The latitude in WGS84 to get the letter designator
 *     for.
 * @return {char} The letter designator.
 */
export function getLetterDesignator(lat) {
    //This is here as an error flag to show that the Latitude is
    //outside MGRS limits
    var LetterDesignator = 'Z';

    if ((84 >= lat) && (lat >= 72)) {
        LetterDesignator = 'X';
    }
    else if ((72 > lat) && (lat >= 64)) {
        LetterDesignator = 'W';
    }
    else if ((64 > lat) && (lat >= 56)) {
        LetterDesignator = 'V';
    }
    else if ((56 > lat) && (lat >= 48)) {
        LetterDesignator = 'U';
    }
    else if ((48 > lat) && (lat >= 40)) {
        LetterDesignator = 'T';
    }
    else if ((40 > lat) && (lat >= 32)) {
        LetterDesignator = 'S';
    }
    else if ((32 > lat) && (lat >= 24)) {
        LetterDesignator = 'R';
    }
    else if ((24 > lat) && (lat >= 16)) {
        LetterDesignator = 'Q';
    }
    else if ((16 > lat) && (lat >= 8)) {
        LetterDesignator = 'P';
    }
    else if ((8 > lat) && (lat >= 0)) {
        LetterDesignator = 'N';
    }
    else if ((0 > lat) && (lat >= -8)) {
        LetterDesignator = 'M';
    }
    else if ((-8 > lat) && (lat >= -16)) {
        LetterDesignator = 'L';
    }
    else if ((-16 > lat) && (lat >= -24)) {
        LetterDesignator = 'K';
    }
    else if ((-24 > lat) && (lat >= -32)) {
        LetterDesignator = 'J';
    }
    else if ((-32 > lat) && (lat >= -40)) {
        LetterDesignator = 'H';
    }
    else if ((-40 > lat) && (lat >= -48)) {
        LetterDesignator = 'G';
    }
    else if ((-48 > lat) && (lat >= -56)) {
        LetterDesignator = 'F';
    }
    else if ((-56 > lat) && (lat >= -64)) {
        LetterDesignator = 'E';
    }
    else if ((-64 > lat) && (lat >= -72)) {
        LetterDesignator = 'D';
    }
    else if ((-72 > lat) && (lat >= -80)) {
        LetterDesignator = 'C';
    }
    return LetterDesignator;
}

/**
 * Get the two letter 100k designator for a given UTM easting,
 * northing and zone number value.
 *
 * @private
 * @param {number} easting
 * @param {number} northing
 * @param {number} zoneNumber
 * @return the two letter 100k designator for the given UTM location.
 */
export function get100kID(easting, northing, zoneNumber) {
    var setParm = get100kSetForZone(zoneNumber);
    var setColumn = Math.floor(easting / 100000);
    var setRow = Math.floor(northing / 100000) % 20;
    return getLetter100kID(setColumn, setRow, setParm);
}

/**
 * Given a UTM zone number, figure out the MGRS 100K set it is in.
 *
 * @private
 * @param {number} i An UTM zone number.
 * @return {number} the 100k set the UTM zone is in.
 */
function get100kSetForZone(i) {
    var setParm = i % CONSTANTS.NUM_100K_SETS;
    if (setParm === 0) {
        setParm = CONSTANTS.NUM_100K_SETS;
    }

    return setParm;
}
/**
 * Get the two-letter MGRS 100k designator given information
 * translated from the UTM northing, easting and zone number.
 *
 * @private
 * @param {number} column the column index as it relates to the MGRS
 *        100k set spreadsheet, created from the UTM easting.
 *        Values are 1-8.
 * @param {number} row the row index as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM northing value. Values
 *        are from 0-19.
 * @param {number} parm the set block, as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM zone. Values are from
 *        1-60.
 * @return two letter MGRS 100k code.
 */
export function getLetter100kID(column, row, parm) {
    // colOrigin and rowOrigin are the letters at the origin of the set
    var index = parm - 1;
    var colOrigin = CONSTANTS.SET_ORIGIN_COLUMN_LETTERS.charCodeAt(index);
    var rowOrigin = CONSTANTS.SET_ORIGIN_ROW_LETTERS.charCodeAt(index);

    // colInt and rowInt are the letters to build to return
    var colInt = colOrigin + column - 1;
    var rowInt = rowOrigin + row;
    var rollover = false;

    if (colInt > CONSTANTS.Z) {
        colInt = colInt - CONSTANTS.Z + CONSTANTS.A - 1;
        rollover = true;
    }

    if (colInt === CONSTANTS.I || (colOrigin < CONSTANTS.I && colInt > CONSTANTS.I) || ((colInt > CONSTANTS.I || colOrigin < CONSTANTS.I) && rollover)) {
        colInt++;
    }

    if (colInt === CONSTANTS.O || (colOrigin < CONSTANTS.O && colInt > CONSTANTS.O) || ((colInt > CONSTANTS.O || colOrigin < CONSTANTS.O) && rollover)) {
        colInt++;

        if (colInt === CONSTANTS.I) {
            colInt++;
        }
    }

    if (colInt > CONSTANTS.Z) {
        colInt = colInt - CONSTANTS.Z + CONSTANTS.A - 1;
    }

    if (rowInt > CONSTANTS.V) {
        rowInt = rowInt - CONSTANTS.V + CONSTANTS.A - 1;
        rollover = true;
    }
    else {
        rollover = false;
    }

    if (((rowInt === CONSTANTS.I) || ((rowOrigin < CONSTANTS.I) && (rowInt > CONSTANTS.I))) || (((rowInt > CONSTANTS.I) || (rowOrigin < CONSTANTS.I)) && rollover)) {
        rowInt++;
    }

    if (((rowInt === CONSTANTS.O) || ((rowOrigin < CONSTANTS.O) && (rowInt > CONSTANTS.O))) || (((rowInt > CONSTANTS.O) || (rowOrigin < CONSTANTS.O)) && rollover)) {
        rowInt++;

        if (rowInt === CONSTANTS.I) {
            rowInt++;
        }
    }

    if (rowInt > CONSTANTS.V) {
        rowInt = rowInt - CONSTANTS.V + CONSTANTS.A - 1;
    }

    var twoLetter = String.fromCharCode(colInt) + String.fromCharCode(rowInt);
    return twoLetter;
}

export function convertToLatLonObj(llObj) {
    let latLonObject = null;
    if (llObj instanceof LatLon) {
        console.log('already an instance of LatLon');
        latLonObject = llObj;
    } else if (Array.isArray(llObj) && llObj.length === 2) {
        console.log('An array that needs to be converted');
        // convert an array, but only if it has two elements
        latLonObject = new LatLon(llObj[0], llObj[1]);
    } else if (typeof llObj === 'object' && !Array.isArray(llObj) && llObj.hasOwnProperty('lat') && llObj.hasOwnProperty('lon')) {
        console.log('An object that needs to be converted');

        // convert to LatLon Object
        latLonObject = new LatLon(llObj.lat, llObj.lon);
    } else {
        throw new Error('Invalid input format.');
    }
    console.log('converted llObj', latLonObject);

    return latLonObject;
}
