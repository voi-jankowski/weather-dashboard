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
          .attr("onclick", "getWeather(event);")
          .text(this.name + " , " + this.state + " , " + this.country);
        $(".location-searches").append(createChoiceBtns);
      });
    });
}
// Retrieve the weather conditions for the coordinates.
function getWeather(event) {
  // Fetching coordinates from data attributes of the selected location.
  var lat = $(event.target).data("lat").toString();
  var lon = $(event.target).data("lon").toString();
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

      // Remove the selection of results under search button.
      $(".removable").remove();
    });
}

// Display city name, the date, icon representation of the weather, temp, humidity and wind speed
function displayWeather(data) {
  // Separate forecasts for different days
  // Setting variables and object
  var timezone = data.city.timezone;
  var firstDayForecast = [];
  var secondDayForecast = [];
  var thirdDayForecast = [];
  var fourthDayForecast = [];
  var fifthDayForecast = [];
  var firstDay = dayjs.unix(data.list[0].dt).utc().add(timezone, "second");
  console.log(firstDay.format(printFormat));
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
  console.log(firstDayForecast);
  console.log(secondDayForecast);
  console.log(fifthDayForecast);

  // Display city name
  $("#location-name").text(data.city.name + " , " + data.city.country);
  // Display the date in a Monday, March 30 format.
  var day1 = dayjs
    .unix(data.list[0].dt)
    .utc()
    .add(timezone, "second")
    .format("dddd, MMMM D");
  $("#day1-date").text(day1);
  // Display the icon of the weather
  // collect the weather ids from the first day in an array.
  var weather = [];
  $.each(firstDayForecast, function () {
    var weatherId = this.weather[0].id;
    weather.push(weatherId);
  });
  console.log(weather);
  // Display min and max temp
  // collect the temps from the first day
  var temperatures = [];
  $.each(firstDayForecast, function () {
    // Converting the values into integers
    var temp = Math.floor(this.main.temp);
    temperatures.push(temp);
  });

  // // Filter out any non-numeric values from the temperatures array
  // var numericTemperatures = temperatures.filter(
  //   (value) => typeof value === "number"
  // );
  // // Get the highest temperature from the numericTemperatures array
  // var highTemp =
  //   numericTemperatures.length > 0 ? Math.max(...numericTemperatures) : null;
  // Get the highest and lowest temepatures from the temperatures array
  var highTemp = Math.max(...temperatures);
  var lowTemp = Math.min(...temperatures);

  // display them
  $("#day1-temp").text("Temp " + highTemp + "° / " + lowTemp + "°");
  // Display humidity
  // collect the humidity from the first day array
  var humidity = [];
  $.each(firstDayForecast, function () {
    var humid = Math.floor(this.main.humidity);
    humidity.push(humid);
  });

  // Calulate average humidity for the day
  var total = 0;
  var count = 0;

  $.each(humidity, function () {
    total += this;
    count++;
  });
  console.log(total / count);
  var humidAverage = total / count;
  $("#day1-humid").text(" " + humidAverage + "%");
  // Display wind speed
  var windSpeeds = [];
  $.each(firstDayForecast, function () {
    var wind = Math.floor(this.wind.speed);
    windSpeeds.push(wind);
  });
  console.log(windSpeeds);
  // Get the highest windspeed forecast for the day
  var highWind = Math.max(...windSpeeds);

  // Display the wind
  $("#day1-wind").text(" " + highWind + " m/s");

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
}

// Display city name, the datem, icon representation of the weather, temp, humidity and wind speed for the 5 day forecast

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
  // Retrieve the recent searches
  var savedSearch = JSON.parse(localStorage.getItem("savedSearch"));
  // Check if data is returned, if not exit out of the function
  if (savedSearch !== null) {
    $.each(savedSearch, function () {
      var div1 = $("<div>")
        .addClass("card recent-card")

        .css({ width: "15rem", height: "5rem" });
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

renderSearches();

// Add event listener for the recent searches and present the forecast for the selected one and pass the parameter of event to getWeather.
recentSearches.on("click", ".card", function (event) {
  getWeather(event);
});
