// GLOBAL VARIABLES
// Variables for DOM elements

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

var today = dayjs();
console.log(today.format("MMM D, YYYY"));

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
  saveCity(lat, lon);
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

      displayWeather(data);

      // Remove the selection of results under search button.
      $(".removable").remove();
    });
}

// Display city name, the date, icon representation of the weather, temp, humidity and wind speed
function displayWeather(data) {
  $("#location-name").text(data.city.name + " , " + data.city.country);
}

// Display city name, the datem, icon representation of the weather, temp, humidity and wind speed for the 5 day forecast

// Save the search in the local storage.
function saveCity(lat, lon) {
  var newSearch = {
    lat,
    lon,
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

function renderLastGrade() {
  // Use JSON.parse() to convert text to JavaScript object
  var lastGrade = JSON.parse(localStorage.getItem("studentGrade"));
  console.log(lastGrade);
  // Check if data is returned, if not exit out of the function
  if (lastGrade !== null) {
    document.getElementById("saved-name").textContent = lastGrade.student;
    document.getElementById("saved-grade").innerHTML = lastGrade.grade;
    document.getElementById("saved-comment").innerHTML = lastGrade.comment;
  } else {
    return;
  }
}

// Retrieve the recent searches from the local storage and display them on the page.

// Add event listener for the recent searches and present the forecast for the selected one.
