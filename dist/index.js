'use strict';

var _coordinateConverter = require('./../lib/coordinate-converter.js');

var _coordinateConverter2 = _interopRequireDefault(_coordinateConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function geoCoordinateConverter(input) {
    var geodetic = _coordinateConverter2.default.getGeodeticFromUnknown(input);
    console.log(geodetic);
}

geoCoordinateConverter('30N60W');

module.exports = geoCoordinateConverter;
