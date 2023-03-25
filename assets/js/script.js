// GLOBAL VARIABLES
// Variables for DOM elements

// Button toggle to switch between celcius and farenheit.

$(".btn-toggle").click(function () {
  $(this).find(".btn").toggleClass("active");
  $(this).find(".btn").toggleClass("btn-primary");
  $(this).find(".btn").toggleClass("btn-default");
});

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
      $("#search-box").append(createInstruction);
      var createList = $("<div></div>").addClass(
        "list-group location-searches"
      );
      $("#search-box").append(createList);
      // Display selection of results as selectable buttons with data attributes with coordinates of the location.
      $.each(data, function () {
        var createChoiceBtns = $("<button></button>")
          .attr("type", "button")
          .addClass("list-group-item btn btn-outline-primary")
          .attr("data-lat", this.lat)
          .attr("data-lon", this.lon)
          .attr("onclick", "getWeather(event);")
          .text(this.name + " , " + this.state + " , " + this.country);
        $(".location-searches").append(createChoiceBtns);
      });
    });
}
// Retrieve the weather conditions for the coordinates.
function getWeather(event) {
    // Fetching coordinates from data attributes of the selected location.
  var lat = $(event.target).data("lat");
  var lon = $(event.target).data("lon");
  console.log(lat);
  console.log(lon);
  var waetherUrl =
    "api.openweathermap.org/data/2.5/forecast?lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=61a66bab5454a1423d5dd78c2e92913eS";
}

// Retrieve the current data and time.

// Display city name, the datem, icon representation of the weather, temp, humidity and wind speed

// Display city name, the datem, icon representation of the weather, temp, humidity and wind speed for the 5 day forecast

// Save the search in the local storage.

// Retrieve the recent searches from the local storage and display them on the page.

// Add event listener for the recent searches and present the forecast for the selected one.
