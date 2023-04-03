// GLOBAL VARIABLES
// Variables for DOM elements
var recentSearches = $("#recent-searches");

// DAYJS GLOBAL
// dayjs plugins
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
// dayjs variables
let printFormat = "DD/MM/YYYY H:mm";
let hourFormat = "H:mm";

// Button toggle to switch between celcius and farenheit.
var weatherUnits = "metric";
$(".btn-toggle").click(function () {
  $(this).find(".btn").toggleClass("active");
  $(this).find(".btn").toggleClass("btn-primary");
  $(this).find(".btn").toggleClass("btn-default");
  if ($("#imperial").hasClass("active")) {
    var weatherUnits = "imperial";
  } else {
    var weatherUnits = "metric";
  }
  console.log(weatherUnits);
});

// Retrieve coordinates for a city name.
function getLocation() {
  // Clear possible previous display of search options
  $(".removable").remove();
  var searchPhrase = $("#search-phrase").val();
  console.log(searchPhrase);

  var locationUrl =
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
    searchPhrase +
    "&limit=5&appid=61a66bab5454a1423d5dd78c2e92913e";

  fetch(locationUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      // If there are no results for that search phrase display no result warning.
      if ($.isEmptyObject(data)) {
        var createWarning = $("<h5></h5>")
          .addClass("removable")
          .css({ "padding-top": "2rem" })
          .text("No results for that search. Try a different name!");
        $("#search-box").append(createWarning);
      } else {
        //   Creating display of results for user to choose desired location.
        var createInstruction = $("<h3></h3>").text(
          "Select the location from below:"
        );
        $(createInstruction).addClass("removable");
        $("#search-box").append(createInstruction);
        var createList = $("<div></div>").addClass(
          "list-group location-searches removable"
        );
        $("#search-box").append(createList);
        // Display selection of results as selectable buttons with data attributes with coordinates of the location.
        $.each(data, function () {
          var createChoiceBtns = $("<button></button>")
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
  var lat = $(event.target).data("lat").toString();
  var lon = $(event.target).data("lon").toString();
  getWeather(lat, lon);
}

// Retrieve the weather conditions for the coordinates.
function getWeather(lat, lon) {
  console.log(lat);
  console.log(lon);
  console.log(weatherUnits);

  var weatherUrl =
    "https://api.openweathermap.org/data/2.5/forecast?lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=61a66bab5454a1423d5dd78c2e92913e&units=" +
    weatherUnits;
  console.log(weatherUrl);

  fetch(weatherUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      console.log(data.city.name);
      console.log(data.city.state);
      console.log(data.city.country);
      console.log(data.city.timezone);
      console.log(data.city.sunrise);
      console.log(data.city.sunset);
      console.log(data.list[0].dt);

      var city = data.city.name;
      saveCity(lat, lon, city);
      displayWeather(data);
      renderSearches();
      // Remove the selection of results under search button and remove the search phrase from search box.
      $(".removable").remove();
      $(".search-phrase").val("");
    });
}

// Display city name, the date, icon representation of the weather, temp, humidity and wind speed
function displayWeather(data) {
  // Display the cards in case they were not visible on loading the page.
  $("#forecast-area").css({ display: "block" });
  // SEPARATE FORECAST FOR DIFFERENT DAYS
  // Setting variables and object
  var timezone = data.city.timezone;
  var firstDayForecast = [];
  var secondDayForecast = [];
  var thirdDayForecast = [];
  var fourthDayForecast = [];
  var fifthDayForecast = [];
  // Get the dates for each day of the forecast
  var firstDay = dayjs.unix(data.list[0].dt).utc().add(timezone, "second");
  console.log(firstDay.format(printFormat));
  var secondDay = dayjs.unix(data.list[8].dt).utc().add(timezone, "second");
  var thirdDay = dayjs.unix(data.list[16].dt).utc().add(timezone, "second");
  var fourthDay = dayjs.unix(data.list[24].dt).utc().add(timezone, "second");
  var fifthDay = dayjs.unix(data.list[32].dt).utc().add(timezone, "second");
  // Grouping the data into separate days objects
  $.each(data.list, function () {
    var givenDay = dayjs.unix(this.dt).utc().add(timezone, "second");
    // console.log(givenDay.format(printFormat));
    // console.log(givenDay.isSame(firstDay, "day"));
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
  // console.log(firstDayForecast);
  console.log(secondDayForecast);
  console.log(thirdDayForecast);
  console.log(fourthDayForecast);
  console.log(fifthDayForecast);

  // FUNCTIONS FOR SELECTING WEATHER DATA TO DISPLAY
  // Function for selecting the weather icon for a given day
  function getWeatherIcon(dayForecast, iconImg) {
    // collect the weather icon code from the given day in an array.
    var weather = [];
    // Collect only day weather icons from the forecast
    $.each(dayForecast, function () {
      var weatherId = this.weather[0].icon;
      if (weatherId.includes("d")) {
        weather.push(weatherId);
      }
    });
    // If no day weather icons, collect the last evening icon
    if (weather.length === 0) {
      var eveningForecast = dayForecast.pop();
      var weatherId = eveningForecast.weather[0].icon;
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
    console.log(weather);
    // Final selection of the icon to display: if it storms or snows at any point of the day, display that icon, otherwise display most frequent icon.
    var weatherIcon;
    if (weather.includes("13d") && !weather.includes("11d")) {
      weatherIcon = "13d";
    } else if (weather.includes("11d")) {
      weatherIcon = "11d";
    } else {
      weatherIcon = mostFrequent;
    }
    console.log(weatherIcon);

    // Display the icon
    if (weatherIcon.includes("01")) {
      iconImg.attr("src", "./assets/images/01-clear-icon.png");
    }
    if (weatherIcon.includes("02")) {
      iconImg.attr("src", "./assets/images/02-few-clouds-icon.png");
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
    var temperatures = [];
    $.each(dayForecast, function () {
      // Convert the values into integers
      var temp = Math.floor(this.main.temp);
      temperatures.push(temp);
    });
    // console.log(temperatures);

    // Get the highest and lowest temepatures from the temperatures array
    var highTemp = Math.max(...temperatures);
    var lowTemp = Math.min(...temperatures);

    // display them
    tempEl.text(" " + highTemp + "° / " + lowTemp + "°");
  }

  // Function for getting the humidity on the given day
  function getHumidity(dayForecast, humidEl) {
    // collect the humidity data from the given day array
    var humidity = [];
    $.each(dayForecast, function () {
      var humid = Math.floor(this.main.humidity);
      humidity.push(humid);
    });
    console.log(humidity);
    // Calulate average humidity for the day
    var total = 0;
    var count = 0;

    $.each(humidity, function () {
      total += this;
      count++;
    });
    // Get the integer of calculated average
    var humidAverage = Math.trunc(total / count);

    // Display the average
    humidEl.text(" " + humidAverage + "%");
  }

  // Create function for getting the wind speen on the given day
  function getWindSpeed(dayForecast, windEl) {
    var windSpeeds = [];
    $.each(dayForecast, function () {
      var wind = Math.floor(this.wind.speed);
      windSpeeds.push(wind);
    });

    // Get the highest windspeed forecast for the day
    var highWind = Math.max(...windSpeeds);

    // Display the wind
    windEl.text(" " + highWind + " m/s");
  }

  // DISPLAYING DATA FOR FIRST DAY
  // Display city name
  $("#location-name").text(data.city.name + " , " + data.city.country);
  // Display the date in a 'Monday, March 30' format.
  var day1 = firstDay.format("dddd, MMMM D");
  $("#day1-date").text(day1);

  // Display the icon of the weather
  var day1Icon = $("#day1-icon");
  getWeatherIcon(firstDayForecast, day1Icon);

  // Display min and max temp
  var day1Temp = $("#day1-temp");
  getTemeratures(firstDayForecast, day1Temp);

  // Display humidity
  var day1Humid = $("#day1-humid");
  getHumidity(firstDayForecast, day1Humid);

  // Display wind speed
  var day1Wind = $("#day1-wind");
  getWindSpeed(firstDayForecast, day1Wind);

  // Display sunrise and sunset times
  // translate the unix time into the local time for the city
  var sunrise = dayjs(data.city.sunrise * 1000)
    .utc()
    .add(timezone, "second")
    .format(hourFormat);
  var sunset = dayjs(data.city.sunset * 1000)
    .utc()
    .add(timezone, "second")
    .format(hourFormat);
  // Display results
  $("#sunrise").text(sunrise);
  $("#sunset").text(sunset);

  // DISPLAYING DATA FOR SECOND DAY
  // Display the day of the week
  var day2 = secondDay.format("dddd");
  $("#day2-date").text(day2);

  // Display the icon of the weather
  var day2Icon = $("#day2-icon");
  getWeatherIcon(secondDayForecast, day2Icon);

  // Display min and max temp
  var day2Temp = $("#day2-temp");
  getTemeratures(secondDayForecast, day2Temp);

  // Display humidity
  var day2Humid = $("#day2-humid");
  getHumidity(secondDayForecast, day2Humid);

  // Display wind speed
  var day2Wind = $("#day2-wind");
  getWindSpeed(secondDayForecast, day2Wind);

  // DISPLAYING DATA FOR THIRD DAY
  // Display the day of the week
  var day3 = thirdDay.format("dddd");
  $("#day3-date").text(day3);

  // Display the icon of the weather
  var day3Icon = $("#day3-icon");
  getWeatherIcon(thirdDayForecast, day3Icon);

  // Display min and max temp
  var day3Temp = $("#day3-temp");
  getTemeratures(thirdDayForecast, day3Temp);

  // Display humidity
  var day3Humid = $("#day3-humid");
  getHumidity(thirdDayForecast, day3Humid);

  // Display wind speed
  var day3Wind = $("#day3-wind");
  getWindSpeed(thirdDayForecast, day3Wind);

  // DISPLAYING DATA FOR FOURTH DAY
  // Display the day of the week
  var day4 = fourthDay.format("dddd");
  $("#day4-date").text(day4);

  // Display the icon of the weather
  var day4Icon = $("#day4-icon");
  getWeatherIcon(fourthDayForecast, day4Icon);

  // Display min and max temp
  var day4Temp = $("#day4-temp");
  getTemeratures(fourthDayForecast, day4Temp);

  // Display humidity
  var day4Humid = $("#day4-humid");
  getHumidity(fourthDayForecast, day4Humid);

  // Display wind speed
  var day4Wind = $("#day4-wind");
  getWindSpeed(fourthDayForecast, day4Wind);

  // DISPLAYING DATA FOR FIFTH DAY
  // Display the day of the week
  var day5 = fifthDay.format("dddd");
  $("#day5-date").text(day5);

  // Display the icon of the weather
  var day5Icon = $("#day5-icon");
  getWeatherIcon(fifthDayForecast, day5Icon);

  // Display min and max temp
  var day5Temp = $("#day5-temp");
  getTemeratures(fifthDayForecast, day5Temp);

  // Display humidity
  var day5Humid = $("#day5-humid");
  getHumidity(fifthDayForecast, day5Humid);

  // Display wind speed
  var day5Wind = $("#day5-wind");
  getWindSpeed(fifthDayForecast, day5Wind);
}

// Save the search in the local storage.
function saveCity(lat, lon, city) {
  var newSearch = {
    lat,
    lon,
    city,
  };
  var savedSearch = JSON.parse(localStorage.getItem("savedSearch")) || [];

  // Check if the object with those coordinates already exists
  if (
    savedSearch.some(
      (savedSearch) =>
        savedSearch.lat === newSearch.lat && savedSearch.lon === newSearch.lon
    )
  ) {
    // Get the index number of the object if that object exists
    var arrayIndex = savedSearch.findIndex(
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
  var savedSearch = JSON.parse(localStorage.getItem("savedSearch"));
  // Check if data is returned, if not exit out of the function
  if (savedSearch !== null) {
    $.each(savedSearch, function () {
      var div1 = $("<div>")
        .addClass("card recent-card")
        .css({ width: "15rem", height: "5rem", "flex-grow": "1" });
      var div2 = $("<div>")
        .addClass("card-body text-center d-flex align-items-center")
        .attr({
          "data-lat": this.lat,
          "data-lon": this.lon,
        });
      var h3 = $("<h3>")
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
  } else {
    $("#forecast-area").css({ display: "none" });
  }
}
// Save the local coorinates as parameters for getWeather to display the local weather upon loading the page.
function getPosition(position) {
  var localLat = position.coords.latitude.toFixed(2);
  var localLon = position.coords.longitude.toFixed(2);
  console.log(localLat);
  console.log(localLon);
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
