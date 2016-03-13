export function findGridZone(zone, easting, northing) {  //See TM 8358.1 Figure B-3
    var row = 0, col = 0, northingInt, eastingInt, l1, l2;
    var set = zone % 6;

    if(set === 0)
        set = 6;

    while(northing > 2000000) {
        northing -= 2000000;
    }

    col = Math.floor(Math.abs(easting)/gridZoneSize)-1; // Get the col position for the square identifier that contains the point. -1 b/c strings are zero indexed
    row = Math.floor(Math.abs(northing) / gridZoneSize); // Get the row position for the square identifier that contains the point. -1 b/c strings are zero indexed

    l1 = gzdA.charAt(col+(((zone-1)%3)*gzSetColSize));
    l2 = gzdB.charAt((row+((zone-1)%2*25))%gzSetRowSize);

    return l1 + l2;
}

export function getZoneNumber(lat, lng) {
    var result = parseInt((lng + 180) / 6, 10) + 1;
    var zoneNumber;
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    // Handle special case of west coast of Norway
    if ( lat >= 6.0 && lat < 64.0) {
        if(lng >= 0.0 && lng < 3.0)
            zoneNumber = 31;
        if(lng >= 3.0 && lng < 12.0)
            zoneNumber = 32;
    }

    // Special zones for Svalbard
    if ( lat >= 72.0 && lat < 84.0 ) {
        if ( lng >= 0.0  && lng <  9.0 ) {
            zoneNumber = 31;
        } else if ( lng >= 9.0  && lng < 21.0 ) {
            zoneNumber = 33;
        } else if ( lng >= 21.0 && lng < 33.0 ) {
            zoneNumber = 35;
        } else if ( lng >= 33.0 && lng < 42.0 ) {
            zoneNumber = 37;
        }
    }

    return result;
}

export function geoParseHelper(string) {
    var result = 1;

    if(/[SW-]/i.test(string))
        result = -1;

    return result;
}

export function toDMHelper(coord) {
    var deg, min;
    deg = coord < 0 ? Math.ceil(coord):Math.floor(coord);
    min = Math.abs((coord - deg) * 60);

    return {
        deg:deg,
        min:Math.floor(min)
    };
}

export function toDMSHelper(coord) {
    P.Tracing.trace(tracingLevels.Verbose);
    var deg = coord < 0 ? Math.ceil(coord):Math.floor(coord);
    var min = Math.abs((coord - deg) * 60);
    var sec = ((min-Math.floor(min))*60);

    return {
        deg:deg,
        min:Math.floor(min),
        sec:sec
    };
}

export function utmLatBand(lat) {
    var result = false;
    lat = parseFloat(lat);

    if ((84 >= lat) && (lat >= 72))
        result = 'X';
    else if ((72 > lat) && (lat >= 64))
        result = 'W';
    else if ((64 > lat) && (lat >= 56))
        result = 'V';
    else if ((56 > lat) && (lat >= 48))
        result = 'U';
    else if ((48 > lat) && (lat >= 40))
        result = 'T';
    else if ((40 > lat) && (lat >= 32))
        result = 'S';
    else if ((32 > lat) && (lat >= 24))
        result = 'R';
    else if ((24 > lat) && (lat >= 16))
        result = 'Q';
    else if ((16 > lat) && (lat >= 8))
        result = 'P';
    else if (( 8 > lat) && (lat >= 0))
        result = 'N';
    else if (( 0 > lat) && (lat >= -8))
        result = 'M';
    else if ((-8> lat) && (lat >= -16))
        result = 'L';
    else if ((-16 > lat) && (lat >= -24))
        result = 'K';
    else if ((-24 > lat) && (lat >= -32))
        result = 'J';
    else if ((-32 > lat) && (lat >= -40))
        result = 'H';
    else if ((-40 > lat) && (lat >= -48))
        result = 'G';
    else if ((-48 > lat) && (lat >= -56))
        result = 'F';
    else if ((-56 > lat) && (lat >= -64))
        result = 'E';
    else if ((-64 > lat) && (lat >= -72))
        result = 'D';
    else if ((-72 > lat) && (lat >= -80))
        result = 'C';

    return result;
}
