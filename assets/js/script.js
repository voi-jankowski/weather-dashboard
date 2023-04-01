// GLOBAL VARIABLES
// Variables for DOM elements
var recentSearches = $("#recent-searches");
// Button toggle to switch between celcius and farenheit.

$(".btn-toggle").click(function () {
  $(this).find(".btn").toggleClass("active");
  $(this).find(".btn").toggleClass("btn-primary");
  $(this).find(".btn").toggleClass("btn-default");
});

var weatherUnits = "metric";
if ($("#imperial").hasClass("active")) {
  var weatherUnits = "imperial";
}
console.log(weatherUnits);

// Retrieve the current data and time.
var today = dayjs(1680373924 * 1000);
console.log(today.format("MMM D, YYYY"));
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
let printFormat = "DD/MM/YYYY H:mm";
let hourFormat = "H:mm";

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
      // Convert date and time to text format that can be used in display.
      var date = dayjs.unix(data.list[0].dt);
      console.log(date.format("YYYY MMMM DD"));
      var city = data.city.name;
      saveCity(lat, lon, city);
      displayWeather(data);

      // Remove the selection of results under search button.
      $(".removable").remove();
    });
}

// Display city name, the date, icon representation of the weather, temp, humidity and wind speed
function displayWeather(data) {
  console.log(data);
  // Display city name
  $("#location-name").text(data.city.name + " , " + data.city.country);
  // Display the date
  // Display the icon of the weather
  // Display min and max temp
  // Display humidity
  // Display wind speen
  // Display sunrise and sunset times
  console.log(data.city.sunrise);
  console.log(data.city.sunset);
  var timezone = data.city.timezone;
  console.log(timezone);
  var sunrise = dayjs(data.city.sunrise * 1000)
    .utc()
    .add(timezone, "second")
    .format(hourFormat);
  var sunset = dayjs(data.city.sunset * 1000)
    .utc()
    .add(timezone, "second")
    .format(hourFormat);
  console.log(sunrise);
  console.log(sunset);

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
  console.log(savedSearch);
  // Check if data is returned, if not exit out of the function
  if (savedSearch !== null) {
    $.each(savedSearch, function () {
      var div1 = $("<div>")
        .addClass("card recent-card")

        .css({ width: "10rem", height: "10rem" });
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
