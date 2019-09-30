function makeId(name) {
    var res = name.toLowerCase()
        .split(';', 1)[0]  // Take only the part before ';', if present
        .replace(/[^a-z0-9 ]+/g, '')  // Keep alphanumeric chars and spaces
        .replace(/ /g, '-');  // Replace spaces with dashes
    console.log("ID for '" + name + "': " + res);
    return res;
}

function configureAutocomplete(data) {
    $("#csearch").autocomplete({
        source: function(request, response) {
            var year = $("#csearch-year").val();
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
            response($.grep(data, function(item) {
                // Filter by the selected year
                return item["Year"].includes(year)
                    && (matcher.test(item["Name"]));
            }));
        },
        minLength: 0,
        select: function(event, ui) {
            var craftId = makeId(ui.item["Name"]);

            // In bigger projects, it's safer to use window.location,
            // because location might be redefined.
            // Setting location and location.href has the same effect, if
            // location isn't set.  Both act as if the link is clicked, so
            // "Back" goes to current page).  location.replace(url) is like
            // HTTP redirect--it skips the current page for back navigation.
            // $(location).prop('href', url) is the jQuery way but it's not
            // an improvement over the below.

            // Navigate to the selected craft
            location.href = "craft-details.html?name=" + craftId;
        }
    }).autocomplete( "instance" )._renderItem = function(ul, item) {
        console.log("Autocomplete attempting to work")
        name = item["Name"];
        return $("<li>")
            .append("<div><i>" + name + "</i>" + "</div>")
            .appendTo(ul);
    };
}

function makeImg(className, name, id) {
    return $("<img>").addClass(className)
        .prop("src", "images/" + id + ".jpg")
        .prop("title", name)
        .prop("alt", name)
        .attr("onerror", "this.src='images/artisan-fair-table.jpg'");
}

function handleCSV() {
    Papa.parse("crafts.csv", {
        download: true,
        delimiter: '|',
        header: true,
        //dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log("CSV-file parse results:");
            console.log(results);

            // Save the CSV data in a global for filtering
            craftData = results.data;

            // If the location includes a search entry, we're customizing the
            // craft details page for the requested craft; otherwise, we're
            // setting up the craft search (using autocomplete) and explicit
            // links on the main crafts page (crafts.html).
            if (location.search) {
                customizeCraftDetailsPage(craftData);
            } else {
                configureAutocomplete(craftData);

                // Create explicit links and images for individual crafts,
                // separated by category
                for (var i = 0; i < craftData.length; i++) {
                    // Create an h3 & ul for this craft's category, if it
                    // hasn't been created yet
                    var category = craftData[i]["Category"];
                    var categoryId = makeId(category);
                    var $categoryUl = $('#' + categoryId);
                    if ($categoryUl.length === 0) {
                        var $mainColumn = $(".column.main");
                        $("<h3>").text(category).appendTo($mainColumn);
                        $categoryUl = $("<ul>").attr("id", categoryId).appendTo($mainColumn);
                    }

                    // Save info for the current craft
                    var name = craftData[i]["Name"];
                    var year = craftData[i]["Year"];
                    var about = craftData[i]["About"];
                    var titles = craftData[i]["Image"];
                    // Note that this ignores custom titles and uses the craft name
                    // to create the thumbnail and pop-up images for now
                    var imgTitles = (titles ? titles.split(':') : [name]);
                    console.log(name + ", " + year + ", " + about + ", " + imgTitles);

                    // Make links, images, and large-image pop-ups for the craft
                    var craftId = makeId(name);
                    var href = "craft-details.html?name=" + craftId;
                    // Add to the category's ul:
                    // <li><span><a></a><img ...thumbnail><img ...large></span></li><br>
                    $categoryUl
                        .append($("<li>")
                            .append($("<span>")
                                .append($("<a>")
                                    .prop("href", href)
                                    .addClass("link-text")
                                    .text(name))
                                .append(makeImg("thumb-img", name, craftId))
                                .append(makeImg("large-img", name, craftId))))
                        .append("<br>");
                }
            }
        }
    });
}

function customizeCraftDetailsPage(data) {
    // Find the entry for the requested craft (name search param)
    var urlParams = new URLSearchParams(location.search);
    var requestedCraftName = urlParams.get("name");
    console.log("Requested craft " + requestedCraftName);
    var craftInfo;  // Save the matching object in craftInfo
    for (var i = 0; i < data.length; i++) {
        if (makeId(data[i]["Name"]) === requestedCraftName) {
            craftInfo = data[i];
            break;
        }
    }
    console.log("Found requested craft info:");
    console.log(craftInfo);

    // Save non-standard image titles, make the full name of the craft, and delete values
    // that aren't used in the feature table
    var name = craftInfo["Name"];
    var titles = craftInfo["Image"];
    var imgTitles = titles ? titles.split(':') : [ name ];
    var about = craftInfo["About"]
    var year = craftInfo["Year"]
    delete craftInfo["Name"];
    delete craftInfo["Image"];

    // Update heading
    $("#header h1").text(name);
    //Update year
    $("h5").text("Sold in: " + year)
    // Update title
    $("h2").text(name)
    // Update p's
    $(".column.main p").text(about);

    

    // Update the craft image(s)
    var $rdiv = $("div.right");
    for (var i = 0; i < imgTitles.length; i++) {
        var title = imgTitles[i];
        var id = makeId(title);
        $("<img>")
            .prop("src", "images/" + id + ".jpg")
            .prop("title", title)
            .prop("alt", title)
            .attr("onerror", "this.src='images/artisan-fair-table.jpg'")
            .css({'width' : '100%', 'margin-left' : '15px'})
            .appendTo($rdiv);
        console.log(imgTitles);
    }
}

$(function() {// Call this from DOM's .ready()
  // Define header, topnav, and footer in one place (load.html) and
  // reuse them for every page (for consistency and easier updates)
  var placeholders = ["#header", "#topnav", "#footer"];
  // Replace placeholders with matching shared elements in load.html  
  for (var i = 0; i < placeholders.length; i++) {
    var sharedEltUrl = "load.html " + placeholders[i] + "-shared";
    // Call customize for plant pages (plants.html & plant-details.html).
    // Do this after the header load is completed because
    // the header is the only loaded element that may be updated
    if (i == 0 && location.pathname.includes("craft")) {
        $(placeholders[i]).load(sharedEltUrl, handleCSV);
    } else {
        $(placeholders[i]).load(sharedEltUrl);
    }
}})