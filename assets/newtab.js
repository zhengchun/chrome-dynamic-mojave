var theme = {
    sunriseImageList: [1, 2, 3],
    dayImageList: [4, 5, 6, 7, 8],
    sunsetImageList: [9, 10, 11, 12],
    nightImageList: [13, 14, 15, 16]
};

var DayEnum = {
    SUNRISE: 1,
    DAY: 2,
    SUNSET: 3,
    NIGHT: 4
};

function updateWallpaper(now, latitude, longitude) {
    //now = new Date(2019, 02, 8, 04, 21, 0, 0);
    var times = SunCalc.getTimes(now, latitude, longitude);
    var segment;
    if (times.nauticalDawn < now && now < times.goldenHourEnd) {
        segment = DayEnum.SUNRISE
    } else if (times.goldenHourEnd < now && now < times.goldenHour) {
        segment = DayEnum.DAY;
    } else if (times.goldenHour < now && now < times.nauticalDusk) {
        segment = DayEnum.SUNSET;
    } else {
        segment = DayEnum.NIGHT;
    }
    var imageList, segmentStart, segmentEnd;
    switch (segment) {
        case (DayEnum.SUNRISE): {
            imageList = theme.sunriseImageList;
            segmentStart = times.nauticalDawn;
            segmentEnd = times.goldenHourEnd;
            break;
        }
        case (DayEnum.DAY): {
            imageList = theme.dayImageList;
            segmentStart = times.goldenHourEnd;
            segmentEnd = times.goldenHour;
            break;
        }
        case (DayEnum.SUNSET): {
            imageList = theme.sunsetImageList;
            segmentStart = times.goldenHour;
            segmentEnd = times.nauticalDusk;
            break;
        }
        default: {
            imageList = theme.nightImageList;
            console.log(now < times.nauticalDawn);
            if (now < times.nauticalDawn) {
                var date = new Date(now.valueOf());
                var yesterdaysData = SunCalc.getTimes(date.setDate(date.getDate() - 1), latitude, longitude);
                segmentStart = yesterdaysData.nauticalDusk;
                segmentEnd = times.nauticalDawn;
            } else {
                segmentStart = times.nauticalDusk;
                var date = new Date(now.valueOf());
                var tomorrowsData = SunCalc.getTimes(date.setDate(date.getDate() + 1), latitude, longitude);
                segmentEnd = tomorrowsData.nauticalDawn;
            }
            break;
        }
    }
    var segmentLength = Math.abs(segmentEnd - segmentStart);// milliseconds;
    var timerLength = segmentLength / imageList.length;
    var elapsedTime = Math.abs(now - segmentStart);
    var i = Math.floor(elapsedTime / timerLength);
    var image = "./assets/wallpapers/" + imageList[i] + ".jpeg";
    setBackground(image);
}

function setBackground(image) {
    document.getElementById("fullscreen").style.backgroundImage = 'url("' + image + '")';
}

function startNewTab() {
    chrome.storage.local.get("options", function (result) {
        if (typeof result === "undefined" || Object.keys(result)==0) {
            fetch("http://www.geoplugin.net/json.gp")
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                    var latitude = data.geoplugin_latitude;
                    var longitude = data.geoplugin_longitude;
                    chrome.storage.local.set({
                        "options": {
                            latitude: latitude,
                            longitude: longitude
                        }
                    }, function () {
                        updateWallpaper(new Date(), latitude, longitude);
                    });
                }).catch(function (err) {
                    console.log(err);
                    updateWallpaper(new Date(),40.712784,-74.005943)// New York
                });
        } else {
            updateWallpaper(new Date(), result.options.latitude, result.options.longitude);
        }
    });
}
startNewTab();