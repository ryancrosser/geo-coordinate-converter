/**
 * Conversion from degrees to radians.
 *
 * @private
 * @param {number} deg the angle in degrees.
 * @return {number} the angle in radians.
 */
exports.degToRad = function degToRad(deg) {
    return (deg * (Math.PI / 180.0));
}

/**
 * Conversion from radians to degrees.
 *
 * @private
 * @param {number} rad the angle in radians.
 * @return {number} the angle in degrees.
 */
exports.radToDeg = function radToDeg(rad) {
    return (180.0 * (rad / Math.PI));
}

/**
 * Calculates the MGRS letter designator for the given latitude.
 *
 * @private
 * @param {number} lat The latitude in WGS84 to get the letter designator
 *     for.
 * @return {char} The letter designator.
 */
exports.getLetterDesignator = function getLetterDesignator(lat) {
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
