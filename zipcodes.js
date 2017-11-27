var hasStorage = true; //false if local storage is undefined
$(function() {
    $("#search").click(search);
    $("#search").prop('disabled', true); //Disable button until relevant data is present
    $("#countries").change(validate);
    document.getElementById("zipcode").oninput = validate; //No jquery method for oninput
    if (typeof(Storage) !== "undefined") { //Read search history if present
        var history = localStorage.getItem("historyList");
        $("#hItems").append(JSON.parse(history));
    } else {
        hasStorage = false;
    }


});

function search() {
    /* Call zippopotam.us for the country and zipcode defined. */
    var zipReqString = "http://api.zippopotam.us/" + $("#countries").val() + "/" + $("#zipcode").val();
    $.ajax({
        url: zipReqString,
        cache: false,
        dataType: "json",
        type: "GET",
        success: function(result, success) {
            parse(result, success);
        },
        error: function(result, success) {
            $("#zipcode").addClass('error');
        }
    });
};

function validate() {
    /* Check that a country is chosen and a zipcode entered 
     * before enabling search button */
    var disable = false;
    disable = ($("#countries").val() == "none");
    disable = ($("#zipcode").val() == "");
    $("#search").prop('disabled', disable);
}

function parse(result, success) {
    clearResult(); // Remove old markers and table

    // Create new table of positions and new markers
    for (i = 0; i < result.places.length; i++) {
        createLocation(result.places[i]);
        addMarker(result.places[i]['longitude'],
            result.places[i]['latitude']);
    }
    //Create a bounding box to adjust zoomlevel of the map
    mapBounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        mapBounds.extend(markers[i].position);
    }
    map.fitBounds(mapBounds); //Zoom the map around markers
    // Enforce reasonable zoom-in limit
    zoomChangeBoundsListener =
        google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
            if (this.getZoom() > 10) {
                this.setZoom(10);
            }
        });
    setTimeout(function() {
        google.maps.event.removeListener(zoomChangeBoundsListener)
    }, 2000);
    // This query was successful -> no alert on zip input.
    $("#zipcode").removeClass('error');
    addLocationHistory();
}

function addMarker(longitude, latitude) { // Create a single map marker and add it
    // to our array of markers.
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map
    });
    markers.push(marker);
}

function clearResult() { // Remove old table rows and markers.
    $("#coordTable .tableRow").not('.tableRow:first').remove();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null); //remove marker from map.
    }
    markers = [];
}

function createLocation(resultObject) {
    // Create the location table
    var row = $("#header").clone();
    row.attr('id', '');
    row.children('.col1').html(resultObject['place name']);
    row.children('.col2').html(resultObject['longitude']);
    row.children('.col3').html(resultObject['latitude']);
    $("#coordTable").append(row);
}

function addLocationHistory() {
    // write the new history to the DOM as well as local storage 
    // (Yes, it could be stored e.g. when the 
    // window is closing, but I doubt that would save much 
    // resources).
    var hCount = $("#hItems p").length;
    if (hCount == 10) {
        $("#hItems p:last").remove();
    }
    var locRow = "<p class='hitem'>" + $("#countries option:selected").text() +
        ", " + $("#zipcode").val() + "</p>";
    $("#hItems").prepend(locRow);
    if (hasStorage) {
        var paragraphs = $("#hItems").html();
        localStorage.setItem("historyList", JSON.stringify(paragraphs));
    }
}
