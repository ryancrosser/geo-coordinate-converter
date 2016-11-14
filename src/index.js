/* eslint-disable no-console */
var converter = require('../lib/coordinate-converter.js');

import MGRS from './mgrs.new.js';
import UTM from './utm.new.js';

var mgrs = new MGRS();
var utm = new UTM();

try {
    // console.log(mgrs.toPoint('33UXP04'))
    console.log(mgrs.toMGRS({ lat: 16.627382, lon: -32.668788 }))
    // console.log(mgrs.toMGRS([16.41450040258237, 48.24949021548379], 2))
    // console.log(mgrs.toBbox('33UXP04'))
    console.log(utm.LLtoUTM({ lat: 48.627382, lon: -32.668788 }));

} catch (e) {
    console.log(e.message);
}

// fromUnknown(input : string) : GeoObject
// fromMGRS(input : string) : GeoObject
// fromUTM(input : string) : GeoObject
// fromLatLon(lat : number, lon : number) : GeoObject

// toMGRSBbox()
// toPoint()
// toMGRS()
// toLatLon()
// toUTM()

function geoCoordinateConverter(input) {
    var output = {};
    var geo = converter.getGeodeticFromUnknown(input);

    if (!geo) {
        // handle error
        output = {
            geo: errorHandler(input),
            mgrs: errorHandler(input),
            utm: errorHandler(input),
            original: input
        };
    } else {
        output = {
            geo: geo,
            mgrs: converter.convertGeodeticToMGRS(geo).toString(),
            utm: converter.convertGeodeticToUTM(geo).toString(),
            original: input
        };
    }

    return output;
}

function errorHandler(input) {
    return 'Error: Could not convert input: ' + input;
}

module.exports = geoCoordinateConverter;
