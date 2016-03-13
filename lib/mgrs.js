class MGRS {
    constructor(utmZone, latBand, gridZone, easting, northing){
        if(String(easting).length !== String(northing).length)
            throw 'MGRS: precision difference';
        if(Number(utmZone) < 1 || Number(utmZone) > 60)
            throw 'MGRS: Invalid UTM zone';
        if(!/[C-H]|[J-N]|[P-X]/i.test(latBand))
            throw 'MGRS: Invalid latBand';
        if(!/[A-H]|[J-N]|[P-Z][A-H]|[J-N]|[P-V]/i.test(gridZone))
            throw 'MGRS: Invalid grid zone';
        if(isNaN(easting))
            throw 'MGRS: Invalid easting';
        if(isNaN(northing))
            throw 'MGRS: Invalid northing';

        this.utmZone = utmZone;
        this.latBand = latBand.toUpperCase();
        this.gridZone = gridZone.toUpperCase();
        this.easting = easting;
        this.northing = northing;
    }

    toString(){
        var e = String(Math.round(this.easting));
        var n = String(Math.round(this.northing));

        while (e.length < 5) {
            e = '0' + e;
        }

        while (n.length < 5) {
            n = '0' + n;
        }

        return this.utmZone + this.latBand + ' ' + this.gridZone + ' ' + this.easting + ' ' + this.northing;
    }

    static mgrsFromString(string) {
        var result = false;
        if(string){
            string = string.replace(/ /g,'');

            var pattern = /^([1-5]\d|60|[1-9])([C-H]|[J-N]|[P-X])(([A-H]|[J-N]|[P-Z])([A-H]|[J-N]|[P-V]))(\d{2}|\d{4}|\d{6}|\d{8}|\d{10})$/i;
            var temp = pattern.exec(string);
            var easting, northing;

            if(temp !== false) {
                easting = temp[6].substr(0,temp[6].length/2);
                northing = temp[6].substr(temp[6].length/2);

                result = new p.MGRS(temp[1],temp[2],temp[3],easting, northing);
            }
        }
        return result;
    }
}