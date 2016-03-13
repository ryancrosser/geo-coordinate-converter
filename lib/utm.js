class UTM {
    constructor(zone, latBand, easting, northing){
        zone = parseInt(zone, 10);
        if(zone < 1 || zone > 60)
            throw 'Zone out of range';
        if(latBands.indexOf(latBand) === -1)
            throw 'Invalid latBand';
        if(isNaN(easting))
            throw 'Invalid easting';
        if(isNaN(northing))
            throw 'Invalid northing';

        this.zone = zone;
        this.latBand = latBand.toUpperCase();
        this.easting = Number(easting);
        this.northing = Number(northing);
    }

    toString() {
        var e = String(Math.round(this.easting));
        var n = String(Math.round(this.northing));

        while (e.length < 6) {
            e = '0' + e;
        }

        while (n.length < 7) {
            n = '0' + n;
        }

        return this.zone + this.latBand + ' ' + e + ' ' + n;
    };

    static utmFromString(string) {
        var result = false;
        if(string){
            var temp = /^([0-5]\d|60)\u0020?([C-H]|[J-N]|[P-X])\u0020?(\d{6})\u0020?(\d{7})$/i.exec(string);

            if(temp !== false) {
                result = new p.UTM(temp[1],temp[2],temp[3],temp[4]);
            }
        }
        return result;
    };

}