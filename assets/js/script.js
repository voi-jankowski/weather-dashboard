// GLOBAL VARIABLES

const recentSearches = $("#recent-searches");
let weatherUnits = "metric";

// DAYJS GLOBAL
// dayjs plugins
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
// dayjs variables
const printFormat = "DD/MM/YYYY H:mm";
const hourFormat = "H:mm";

// Button toggle to switch between celcius and farenheit.

$(".btn-toggle").click(function () {
  $(this).find(".btn").toggleClass("active");
  $(this).find(".btn").toggleClass("btn-primary");
  $(this).find(".btn").toggleClass("btn-default");

  // On changing the units refresh the search that is being displayed so it is presented with the chosen unit of measure
  let savedSearch = JSON.parse(localStorage.getItem("savedSearch"));
  let i = savedSearch.length - 1;
  let lat = savedSearch[i].lat;
  let lon = savedSearch[i].lon;

  getWeather(lat, lon);
});

// Retrieve coordinates for a city name.
function getLocation() {
  // Clear possible previous display of search options
  $(".removable").remove();
  let searchPhrase = $("#search-phrase").val();

  let locationUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    searchPhrase +
    "&limit=5&appid=61a66bab5454a1423d5dd78c2e92913e";

  fetch(locationUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // If there are no results for that search phrase display no result warning.
      if ($.isEmptyObject(data)) {
        let createWarning = $("<h5></h5>")
          .addClass("removable")
          .css({ "padding-top": "2rem" })
          .text("No results for that search. Try a different name!");
        $("#search-box").append(createWarning);
      } else {
        //   Creating display of results for user to choose desired location.
        let createInstruction = $("<h3></h3>").text(
          "Select the location from below:"
        );
        $(createInstruction).addClass("removable");
        $("#search-box").append(createInstruction);
        let createList = $("<div></div>").addClass(
          "list-group location-searches removable"
        );
        $("#search-box").append(createList);
        // Display selection of results as selectable buttons with data attributes with coordinates of the location.
        $.each(data, function () {
          let createChoiceBtns = $("<button></button>")
            .attr("type", "button")
            .addClass("list-group-item btn btn-outline-primary removable")
            .attr("data-lat", this.lat.toFixed(2))
            .attr("data-lon", this.lon.toFixed(2))
            .attr("onclick", "getCoordinates(event);")
            .text(this.name + " , " + this.state + " , " + this.country);
          $(".location-searches").append(createChoiceBtns);
        });
      }
    });
}

// Fetching coordinates from data attributes of the selected location.
function getCoordinates(event) {
  let lat = $(event.target).data("lat").toString();
  let lon = $(event.target).data("lon").toString();
  getWeather(lat, lon);
}

// Retrieve the weather conditions for the coordinates.
function getWeather(lat, lon) {
  // Checking for the seection of units of measure
  if ($("#imperial").hasClass("active")) {
    weatherUnits = "imperial";
  } else {
    weatherUnits = "metric";
  }

  let currentWeatherUrl =
    "https://api.openweathermap.org/data/2.5/weather?lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=61a66bab5454a1423d5dd78c2e92913e&units=" +
    weatherUnits;
  let weatherUrl =
    "https://api.openweathermap.org/data/2.5/forecast?lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=61a66bab5454a1423d5dd78c2e92913e&units=" +
    weatherUnits;

  fetch(weatherUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let city = data.city.name;
      saveCity(lat, lon, city);
      displayWeather(data, weatherUnits);
      renderSearches();
      // Remove the selection of results under search button and remove the search phrase from search box.
      $(".removable").remove();
      $(".search-phrase").val("");
    });
  fetch(currentWeatherUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (currentData) {
      displayCurrentWeather(currentData, weatherUnits);
    });
}

// CURRENT WEATHER
// Create function for displaying current weather in the present weather-card.

function displayCurrentWeather(currentData, weatherUnits) {
  let timezone = currentData.timezone;

  // Display city name
  $("#location-name").text(currentData.name + " , " + currentData.sys.country);

  // Display the date in a 'Monday, March 30' format.
  let presentDay = dayjs
    .unix(currentData.dt)
    .utc()
    .add(timezone, "second")
    .format("dddd, MMMM D");
  $("#present-date").text(presentDay);

  // Display current weather icon
  let presentIcon = currentData.weather[0].icon;

  let presentImg = $("#present-icon");

  // Display the icon
  if (presentIcon.includes("01d")) {
    presentImg.attr("src", "./assets/images/01d-clear-icon.png");
  }
  if (presentIcon.includes("01n")) {
    presentImg.attr("src", "./assets/images/01n-clear-icon.png");
  }
  if (presentIcon.includes("02d")) {
    presentImg.attr("src", "./assets/images/02d-few-clouds-icon.png");
  }
  if (presentIcon.includes("02n")) {
    presentImg.attr("src", "./assets/images/02n-few-clouds-icon.png");
  }
  if (presentIcon.includes("03")) {
    presentImg.attr("src", "./assets/images/03-scattered-clouds-icon.png");
  }
  if (presentIcon.includes("04")) {
    presentImg.attr("src", "./assets/images/04-broken-clouds-icon.png");
  }
  if (presentIcon.includes("09")) {
    presentImg.attr("src", "./assets/images/09-shower-rain-icon.png");
  }
  if (presentIcon.includes("10")) {
    presentImg.attr("src", "./assets/images/10-rain-icon.png");
  }
  if (presentIcon.includes("11")) {
    presentImg.attr("src", "./assets/images/11-thunderstorm-icon.png");
  }
  if (presentIcon.includes("13")) {
    presentImg.attr("src", "./assets/images/13-snow-icon.png");
  }
  if (presentIcon.includes("50")) {
    presentImg.attr("src", "./assets/images/50-mist-icon.png");
  }

  // Display current temperature
  let presentTemp = Math.round(currentData.main.temp);

  let tempNow = $("#present-temp");
  if (weatherUnits === "imperial") {
    tempNow.text("Temp: " + presentTemp + "°F");
  } else {
    tempNow.text("Temp: " + presentTemp + "°C");
  }

  // Display current humidity
  let presentHumid = currentData.main.humidity;
  let humidNow = $("#present-humid");
  humidNow.text(" " + presentHumid + "%");

  // Display current wind speed
  let presentWind = Math.round(currentData.wind.speed);
  let windNow = $("#present-wind");
  if (weatherUnits === "imperial") {
    windNow.text(" " + presentWind + " mi/h");
  } else {
    windNow.text(" " + presentWind + " m/s");
  }

  // Display sunrise and sunset times
  // translate the unix time into the local time for the city
  let sunrise = dayjs(currentData.sys.sunrise * 1000)
    .utc()
    .add(timezone, "second")
    .format(hourFormat);
  let sunset = dayjs(currentData.sys.sunset * 1000)
    .utc()
    .add(timezone, "second")
    .format(hourFormat);
  // Display results
  $("#sunrise").text(sunrise);
  $("#sunset").text(sunset);
}

// FORECAST FOR 5 DAYS

// Display city name, the date, icon representation of the weather, temp, humidity and wind speed
function displayWeather(data, weatherUnits) {
  // Display the cards in case they were not visible on loading the page.
  $("#forecast-area").css({ visibility: "visible" });
  // SEPARATE FORECAST FOR DIFFERENT DAYS

  // Setting variables and object
  let timezone = data.city.timezone;
  const firstDayForecast = [];
  const secondDayForecast = [];
  const thirdDayForecast = [];
  const fourthDayForecast = [];
  const fifthDayForecast = [];

  // Get the dates for each day of the forecast
  var firstDay = dayjs.unix(data.list[0].dt).utc().add(timezone, "second");
  var secondDay = dayjs.unix(data.list[8].dt).utc().add(timezone, "second");
  var thirdDay = dayjs.unix(data.list[16].dt).utc().add(timezone, "second");
  var fourthDay = dayjs.unix(data.list[24].dt).utc().add(timezone, "second");
  var fifthDay = dayjs.unix(data.list[32].dt).utc().add(timezone, "second");
  // Grouping the data into separate days objects
  $.each(data.list, function () {
    var givenDay = dayjs.unix(this.dt).utc().add(timezone, "second");
    if (givenDay.isSame(firstDay, "day")) {
      firstDayForecast.push(this);
    } else if (givenDay.isSame(secondDay, "day")) {
      secondDayForecast.push(this);
    } else if (givenDay.isSame(thirdDay, "day")) {
      thirdDayForecast.push(this);
    } else if (givenDay.isSame(fourthDay, "day")) {
      fourthDayForecast.push(this);
    } else if (givenDay.isSame(fifthDay, "day")) {
      fifthDayForecast.push(this);
    }
  });

  firstDayForecast.push(data.list[0]);

  // FUNCTIONS FOR SELECTING WEATHER DATA TO DISPLAY
  // Function for selecting the weather icon for a given day
  function getWeatherIcon(dayForecast, iconImg) {
    // collect the weather icon code from the given day in an array.
    const weather = [];
    // Collect only day weather icons from the forecast
    $.each(dayForecast, function () {
      let weatherId = this.weather[0].icon;
      if (weatherId.includes("d")) {
        weather.push(weatherId);
      }
    });
    // If no day weather icons, collect the last evening icon
    if (weather.length === 0) {
      let eveningForecast = dayForecast.pop();
      let weatherId = eveningForecast.weather[0].icon;
      weather.push(weatherId);
    }
    // Find the most frequent icon in weather array. Solution sourced at https://amjustsam.medium.com/how-to-find-most-frequent-item-of-an-array-12015df68c65
    var counts = {};
    var compare = 0;
    var mostFrequent;
    (function (weather) {
      for (var i = 0; i < weather.length; i++) {
        var word = weather[i];

        if (counts[word] === undefined) {
          counts[word] = 1;
        } else {
          counts[word] += 1;
        }
        if (counts[word] > compare) {
          compare = counts[word];
          mostFrequent = weather[i];
        }
      }
      return mostFrequent;
    })(weather);

    // Final selection of the icon to display: if it storms or snows at any point of the day, display that icon, otherwise display most frequent icon.
    var weatherIcon;
    if (weather.includes("13d") && !weather.includes("11d")) {
      weatherIcon = "13d";
    } else if (weather.includes("11d")) {
      weatherIcon = "11d";
    } else {
      weatherIcon = mostFrequent;
    }

    // Display the icon
    if (weatherIcon.includes("01d")) {
      iconImg.attr("src", "./assets/images/01d-clear-icon.png");
    }
    if (weatherIcon.includes("01n")) {
      iconImg.attr("src", "./assets/images/01n-clear-icon.png");
    }
    if (weatherIcon.includes("02d")) {
      iconImg.attr("src", "./assets/images/02d-few-clouds-icon.png");
    }
    if (weatherIcon.includes("02n")) {
      iconImg.attr("src", "./assets/images/02n-few-clouds-icon.png");
    }
    if (weatherIcon.includes("03")) {
      iconImg.attr("src", "./assets/images/03-scattered-clouds-icon.png");
    }
    if (weatherIcon.includes("04")) {
      iconImg.attr("src", "./assets/images/04-broken-clouds-icon.png");
    }
    if (weatherIcon.includes("09")) {
      iconImg.attr("src", "./assets/images/09-shower-rain-icon.png");
    }
    if (weatherIcon.includes("10")) {
      iconImg.attr("src", "./assets/images/10-rain-icon.png");
    }
    if (weatherIcon.includes("11")) {
      iconImg.attr("src", "./assets/images/11-thunderstorm-icon.png");
    }
    if (weatherIcon.includes("13")) {
      iconImg.attr("src", "./assets/images/13-snow-icon.png");
    }
    if (weatherIcon.includes("50")) {
      iconImg.attr("src", "./assets/images/50-mist-icon.png");
    }
  }

  // Function for getting the min and max tem for the given day
  function getTemeratures(dayForecast, tempEl) {
    // collect the temps from the given day
    let temperatures = [];
    $.each(dayForecast, function () {
      // Convert the values into integers
      let temp = Math.round(this.main.temp);
      temperatures.push(temp);
    });

    // Get the highest and lowest temepatures from the temperatures array
    let highTemp = Math.max(...temperatures);
    let lowTemp = Math.min(...temperatures);

    // display them
    if (weatherUnits === "imperial") {
      tempEl.text(" " + highTemp + "°F / " + lowTemp + "°F");
    } else {
      tempEl.text(" " + highTemp + "°C / " + lowTemp + "°C");
    }
  }

  // Function for getting the humidity on the given day
  function getHumidity(dayForecast, humidEl) {
    // collect the humidity data from the given day array
    let humidity = [];
    $.each(dayForecast, function () {
      let humid = Math.round(this.main.humidity);
      humidity.push(humid);
    });

    // Calulate average humidity for the day
    let total = 0;
    let count = 0;

    $.each(humidity, function () {
      total += this;
      count++;
    });
    // Get the integer of calculated average
    let humidAverage = Math.round(total / count);

    // Display the average
    humidEl.text(" " + humidAverage + "%");
  }

  // Create function for getting the wind speen on the given day
  function getWindSpeed(dayForecast, windEl) {
    let windSpeeds = [];
    $.each(dayForecast, function () {
      let wind = Math.round(this.wind.speed);
      windSpeeds.push(wind);
    });

    // Get the highest windspeed forecast for the day
    let highWind = Math.max(...windSpeeds);

    // Display the wind
    if (weatherUnits === "imperial") {
      windEl.text(" " + highWind + " mi/h");
    } else {
      windEl.text(" " + highWind + " m/s");
    }
  }

  // DISPLAYING DATA FOR FIRST DAY

  // Display the day of the week
  let day1 = firstDay.format("dddd");
  $("#day1-date").text(day1);

  // Display the icon of the weather
  let day1Icon = $("#day1-icon");
  getWeatherIcon(firstDayForecast, day1Icon);

  // Display min and max temp
  let day1Temp = $("#day1-temp");
  getTemeratures(firstDayForecast, day1Temp);

  // Display humidity
  let day1Humid = $("#day1-humid");
  getHumidity(firstDayForecast, day1Humid);

  // Display wind speed
  let day1Wind = $("#day1-wind");
  getWindSpeed(firstDayForecast, day1Wind);

  // DISPLAYING DATA FOR SECOND DAY
  // Display the day of the week
  let day2 = secondDay.format("dddd");
  $("#day2-date").text(day2);

  // Display the icon of the weather
  let day2Icon = $("#day2-icon");
  getWeatherIcon(secondDayForecast, day2Icon);

  // Display min and max temp
  let day2Temp = $("#day2-temp");
  getTemeratures(secondDayForecast, day2Temp);

  // Display humidity
  let day2Humid = $("#day2-humid");
  getHumidity(secondDayForecast, day2Humid);

  // Display wind speed
  let day2Wind = $("#day2-wind");
  getWindSpeed(secondDayForecast, day2Wind);

  // DISPLAYING DATA FOR THIRD DAY
  // Display the day of the week
  let day3 = thirdDay.format("dddd");
  $("#day3-date").text(day3);

  // Display the icon of the weather
  let day3Icon = $("#day3-icon");
  getWeatherIcon(thirdDayForecast, day3Icon);

  // Display min and max temp
  let day3Temp = $("#day3-temp");
  getTemeratures(thirdDayForecast, day3Temp);

  // Display humidity
  let day3Humid = $("#day3-humid");
  getHumidity(thirdDayForecast, day3Humid);

  // Display wind speed
  let day3Wind = $("#day3-wind");
  getWindSpeed(thirdDayForecast, day3Wind);

  // DISPLAYING DATA FOR FOURTH DAY
  // Display the day of the week
  let day4 = fourthDay.format("dddd");
  $("#day4-date").text(day4);

  // Display the icon of the weather
  let day4Icon = $("#day4-icon");
  getWeatherIcon(fourthDayForecast, day4Icon);

  // Display min and max temp
  let day4Temp = $("#day4-temp");
  getTemeratures(fourthDayForecast, day4Temp);

  // Display humidity
  let day4Humid = $("#day4-humid");
  getHumidity(fourthDayForecast, day4Humid);

  // Display wind speed
  let day4Wind = $("#day4-wind");
  getWindSpeed(fourthDayForecast, day4Wind);

  // DISPLAYING DATA FOR FIFTH DAY
  // Display the day of the week
  let day5 = fifthDay.format("dddd");
  $("#day5-date").text(day5);

  // Display the icon of the weather
  let day5Icon = $("#day5-icon");
  getWeatherIcon(fifthDayForecast, day5Icon);

  // Display min and max temp
  let day5Temp = $("#day5-temp");
  getTemeratures(fifthDayForecast, day5Temp);

  // Display humidity
  let day5Humid = $("#day5-humid");
  getHumidity(fifthDayForecast, day5Humid);

  // Display wind speed
  let day5Wind = $("#day5-wind");
  getWindSpeed(fifthDayForecast, day5Wind);
}

// Save the search in the local storage.
function saveCity(lat, lon, city) {
  let newSearch = {
    lat,
    lon,
    city,
  };
  let savedSearch = JSON.parse(localStorage.getItem("savedSearch")) || [];

  // Check if the object with those coordinates already exists
  if (
    savedSearch.some(
      (savedSearch) =>
        savedSearch.lat === newSearch.lat && savedSearch.lon === newSearch.lon
    )
  ) {
    // Get the index number of the object if that object exists
    let arrayIndex = savedSearch.findIndex(
      (savedSearch) =>
        savedSearch.lat === newSearch.lat && savedSearch.lon === newSearch.lon
    );
    // Remove the old object
    savedSearch.splice(arrayIndex, 1);
  }

  // If there is 6 locations saved remove the first saved location and add a new one, if less then 6 just add a new one.
  if (savedSearch.length < 6) {
    savetoLocal();
  } else {
    savedSearch.splice(0, 1);
    savetoLocal();
  }

  function savetoLocal() {
    savedSearch.push(newSearch);

    localStorage.setItem("savedSearch", JSON.stringify(savedSearch));
  }
}

// Retrieve the recent searches from the local storage and display them on the page.
function renderSearches() {
  // Clear the recent-searches cards if any are displayed.
  recentSearches.empty();
  // Retrieve the recent searches
  let savedSearch = JSON.parse(localStorage.getItem("savedSearch"));
  // Check if data is returned, if not exit out of the function
  if (savedSearch !== null) {
    $.each(savedSearch, function () {
      let div1 = $("<div>")
        .addClass("card recent-card")
        .css({ width: "20rem", height: "5rem", "flex-grow": "1" });
      let div2 = $("<div>")
        .addClass("card-body text-center d-flex align-items-center")
        .attr({
          "data-lat": this.lat,
          "data-lon": this.lon,
        });
      let h3 = $("<h3>")
        .addClass("card-title")
        .attr({
          "data-lat": this.lat,
          "data-lon": this.lon,
        })
        .css({ margin: "0 auto" })
        .text(this.city);

      div2.append(h3);
      div1.append(div2);
      recentSearches.append(div1);
    });
  } else {
    return;
  }
}

// Get the location of the user to get their coordinates

function getLocalCoordinates() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition);
    $("#forecast-area").css({ visibility: "visible" });
  }
}
// Save the local coorinates as parameters for getWeather to display the local weather upon loading the page.
function getPosition(position) {
  let localLat = position.coords.latitude.toFixed(2);
  let localLon = position.coords.longitude.toFixed(2);

  getWeather(localLat, localLon);
}

renderSearches();
getLocalCoordinates();

// Add event listener for the recent searches and present the forecast for the selected one and pass the parameter of event to getCoordinates.
recentSearches.on("click", ".card", function (event) {
  getCoordinates(event);
});

// Add event listener to enter button for the search-box.
$("#search-phrase").keyup(function (event) {
  if (event.keyCode === 13) {
    $("#search-btn").click();
  }
});
