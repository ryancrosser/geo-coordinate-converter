var converter = require('../lib/coordinate-converter.js');

function geoCoordinateConverter(input){
    var output = {};
    var geo = converter.getGeodeticFromUnknown(input);

    if(!geo){
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

function errorHandler(input){
    return 'Error: Could not convert input: ' + input;
}

module.exports = geoCoordinateConverter;
