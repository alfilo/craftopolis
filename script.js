"use strict";

function handleCSV() {
  Papa.parse("crafts.csv", {
    download: true,
    delimiter: "|",
    header: true,
    //dynamicTyping: true,
    skipEmptyLines: true,
    complete: function (results) {
      var content = results.data; // Save the CSV data
      var idKeys = ["Name"];
      var contentDisplay = new ContentDisplay(content, idKeys, {});
      // If the location includes a search entry, we're customizing the
      // details page for the requested craft; otherwise, we're
      // setting up the search (using autocomplete) and category images
      // with links to crafts on the main crafts page (crafts.html).
      if (location.search) {
        contentDisplay.details.generate();
      } else {
        contentDisplay.search.configureSearch("side", {}, ["Year"]);
        contentDisplay.categories.generateCatView();
      }
    },
  });
}

$(function () {
  // Call this from DOM's .ready()
  // Define header, topnav, and footer in one place (load.html) and
  // reuse them for every page (for consistency and easier updates)
  var placeholders = ["#header", "#topnav", "#footer"];
  // Replace placeholders with matching shared elements in load.html
  for (var i = 0; i < placeholders.length; i++) {
    var sharedEltUrl = "load.html " + placeholders[i] + "-shared";
    // Call customize for plant pages (plants.html & plant-details.html).
    // Do this after the header load is completed because
    // the header is the only loaded element that may be updated
    if (
      i == 0 &&
      (location.pathname.includes("crafts.html") ||
        location.pathname.includes("details.html"))
    ) {
      $(placeholders[i]).load(sharedEltUrl, handleCSV);
    } else {
      $(placeholders[i]).load(sharedEltUrl);
    }
    if (
      location.pathname.includes("faq") ||
      location.pathname.includes("contact")
    ) {
      // Register slideToggle for buttons on FAQ and contact pages
      var $slideBtn = $(".slide-down-btn");
      $slideBtn.click(function () {
        $(this).next().slideToggle();
      });
    }
  }
});
