const MAX_LAT = 90;
const MAX_LON = 180;
export default class LatLon {
    constructor(lat, lon) {
        if (this.isValidLatLon(lat, lon)) {
            this.lat = lat;
            this.lon = lon;
        } else {
            throw new Error(`Invaid input => Lat: ${lat}, Lon: ${lon}`);
        }
    }

    isValidLatLon(lat, lon) {
        console.log(lat);

        if (Math.abs(lat) <= MAX_LAT && Math.abs(lon) <= MAX_LON) {
            return true;
        } else {
            return false;
        }
    }

    toString() {
        return `${this.lat} ${this.lon}`;
    }
}
