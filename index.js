const http = require('http')
const fs = require('fs')
var requests = require("requests");

const indexFile = fs.readFileSync('index.html', "utf-8")
const InsertVal = (destination, source) => {
    let details = destination.replace("{%temp_val%}", kelvinToCelcius(source.main.temp));
    details = details.replace("{%humidity%}", source.main.humidity);
    details = details.replace("{%feels_like%}", kelvinToCelcius(source.main.feels_like).bold());
    details = details.replace("{%location%}", source.name);
    details = details.replace("{%country%}", source.sys.country);
    details = details.replace("{%tempStatus%}", source.weather[0].main);
    details = details.replace("{%wind%}", convertMetersPerSecToMPH(source.wind.speed).bold());
    details = details.replace("{%direction%}", convertDegreeToCompassPoint(source.wind.deg).bold());
    return details;
};
const kelvinToCelcius = (Ftemp) => {
    return (Ftemp - 273).toFixed(2) + "°C";
}

const convertMetersPerSecToMPH = (mps) => {
    const mph = +((2.23694 * mps).toFixed(2));
    return mph + "mph";
};
const convertDegreeToCompassPoint = (wind_deg) => {
    const compassPoints = ["North", "North North East", "North East", "East North East",
        "East", "East South East", "South East", "South South East",
        "South", "South South West", "South West", "West South West",
        "West", "West North West", "North West", "North North West"
    ];
    const rawPosition = Math.floor((wind_deg / 22.5) + 0.5);
    const arrayPosition = (rawPosition % 16);
    return compassPoints[arrayPosition];
};




const server = http.createServer((req, res) => {
    if (req.url == "/") {
        requests("https://api.openweathermap.org/data/2.5/weather?q=kolkata&appid=ae6b2dfd805d971d93624d8fbc9ff81d")
            .on("data", (chunk) => {
                const objData = JSON.parse(chunk);
                const arrData = [objData];
                const RealTimeData = arrData.map((value) => InsertVal(indexFile, value)).join("");
                res.write(RealTimeData);
            })
            .on("end", (err) => {
                if (err) return console.log(("connection closed due to errors", err));
                res.end();
            });
    }
});

server.listen(process.env.PORT || 5000, '127.0.0.1', () => {
    console.log("Listening on port 5000")
})