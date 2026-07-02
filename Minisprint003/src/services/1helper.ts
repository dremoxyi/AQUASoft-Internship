function DistanceHaversineKM(lat1Deg:number, lon1Deg:number, lat2Deg:number, lon2Deg:number):number {
    function toRad(degree:number):number {
        return degree * Math.PI / 180;
    }
    
    const lat1 = toRad(lat1Deg);
    const lon1 = toRad(lon1Deg);
    const lat2 = toRad(lat2Deg);
    const lon2 = toRad(lon2Deg);
    
    const { sin, cos, sqrt, atan2 } = Math;
    
    const R = 6371; // earth radius in km 
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = sin(dLat / 2) * sin(dLat / 2)
            + cos(lat1) * cos(lat2)
            * sin(dLon / 2) * sin(dLon / 2);
    const c = 2 * atan2(sqrt(a), sqrt(1 - a)); 
    const d = R * c;
    return d; // distance in km
}

function DistanceComparison(lat1Deg:number, lon1Deg:number, lat2Deg:number, lon2Deg:number):number {
    const dLat = lat2Deg-lat1Deg;
    let dLon = lon2Deg-lon1Deg;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360; 

    const scale = Math.cos((lat1Deg + lat2Deg)*Math.PI/360);
    const score = dLat * dLat + (dLon * scale) ** 2;
    return score
}

export {DistanceHaversineKM, DistanceComparison}

/* Test with `npx ts-node .\src\services\helper.ts ` 
type Point = { name: string; lat: number; lon: number };

const points: Point[] = [
  { name: "Bucharest", lat: 44.4268, lon: 26.1025 }, //1
  { name: "Sofia",     lat: 42.6977, lon: 23.3219 }, //2
  { name: "Budapest",  lat: 47.4979, lon: 19.0402 }, //4
  { name: "Vienna",    lat: 48.2082, lon: 16.3738 }, //5
  { name: "Paris",     lat: 48.8589, lon: 2.3200 }, //6
  { name: "Iasi",      lat: 47.1585, lon: 27.6014 } //3
];

const query = { lat: 44.57216, lon: 26.10218 }; // Bucharest Airport OTP
let res: { name: string; d: number }[] = []
let res2: { name: string; d: number }[] = []

points.forEach(element => {
    res.push({name: element.name, d: DistanceHaversineKM(element.lat,element.lon,query.lat,query.lon)})
    res2.push({name: element.name, d: DistanceComparison(element.lat,element.lon,query.lat,query.lon)})
});

console.log(res)
console.log(res2)
*/
