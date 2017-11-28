/* Written by Dan Björkgren as exercise 3 for the course 
 * Development of Interactive Web Applications fall 2017 
 * Åbo Akademi
 * Makes use of the Turku region public transport's transit
 * and timetable data. Used under license of Creative Commons
 * Attribution 4.0 International. */

var routePath; // route polygon if calculated and drawn
var lastRoute; // previous route, used to recognize change.

$(function() { //onLoad
    fetchRoutes(); //fetch available routes and fill the dropdown
    // initialize listeners.
    $("#routeBtn").click(showRoute);
    $("#busesBtn").click(showBuses);
    $("#refreshBtn").click(refresh);
    $("#routeSel").change(validate);
    // Initialize UI state
    validate();
});

function validate() { // Triggered whenever a route is selected
    // disable buttons if no route is selected
    var disable = $("#routeSel").val() == "none";
    var buttons = $(":button");
    for (var i = 0; i < buttons.length; i++) {
        $(buttons[i]).prop('disabled', disable);
    }
    // Clear the map if a new route is selected from dropdown
    if (lastRoute && lastRoute !== $("#routeSel").val()) {
        if (routePath) {
            routePath.setMap(null)
        };
        clearResult();
        clearMessage();
    }
    lastRoute = $("#routeSel").val();

}

function clearMessage() {
    $('#msg').html('');
    $("#msg").removeClass("hasMessage");
}

function showRoute() { // Triggered on Show Route button
    var route = $("#routeSel").val();
    if (routePath) { // remove any old polygon
        routePath.setMap(null)
    };
    // Trigger fetching a new route polygon
    // (several steps asynchronously)
    fetchTrips(route);
}

function fetchTrips(route) {
    //Fetch trips for this route, call parseTrips on success
    var url = "https://data.foli.fi/gtfs/trips/route/" + route;
    $.ajax({
        url: url,
        cache: false,
        dataType: "json",
        type: "GET",
        success: function(result, success) {
            parseTrips(result, success);
        },
        error: function(result, err) {
            displayError(result, err)
        }
    });
}

function fetchRoutes() {
    // Called on initial load to fill the dropdown.
    // calls parseRoutes on success.
	
/* experimental code */
$(document).ajaxSend(function(event, request, settings) {
    var test=1; //breakpoint 
});	
/*experiment end */
    $.ajax({
        url: "https://data.foli.fi/gtfs/routes",
        cache: true,
        dataType: "json",
        type: "GET",
        success: function(result, success, err) {
            parseRoutes(result, success, err);
        },
        error: function(result, success, err) {
            displayError(result, success, err)
        }
    });
}

function fetchCoordinates(shape_id) {

    // Fetches the shapes (coordinate array) for this
    // shape_id. Calls createMapPath upon success.
    $.ajax({
        url: "https://data.foli.fi/gtfs/shapes/" + shape_id,
        cache: true,
        dataType: "json",
        type: "GET",
        success: function(result, success) {
            createMapPath(result);
        },
        error: function(result, err) {
            displayError(result, err);
        }
    });

}

function createMapPath(result) {
    // Constructs a Google Maps polygon of the fetched
    // coordinates, draws it on the map and
    // zooms the map to fit the bounds of the
    // polygon.
    var routeCoordinates = result.map(function(el) {
        return {
            lat: el.lat,
            lng: el.lon
        };
    });

    routePath = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: '#ff0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    routePath.setMap(map);
    mapBounds = new google.maps.LatLngBounds();
    routeCoordinates.forEach(function(pos) {
        mapBounds.extend(pos);
    });
    map.fitBounds(mapBounds);
}

function parseTrips(result, success, err) {
    // on fetchTrips success, pick a random route.
    var shape_ids = result.map(function(el) {
        return el.shape_id;
    });
    var shape_id = findMostCommon(shape_ids);
    // Fetch the coordinates for the polygon
    // (Asynchronously)
    if (shape_id === null) {
	setMessage("There are no coordinates defined for this route");
    };
    fetchCoordinates(shape_id);
}

function findMostCommon(arr) {
    if (arr.length == 0) return null;
    var map = {};
    var max = arr[0],
        maxcount = 1;
    for (var i = 0; i < arr.length; i++) {
        var elem = arr[i];
        if (map[elem] == null)
            map[elem] = 1;
        else
            map[elem]++;
        if (map[elem] > maxcount) {
            max = elem;
            maxcount = map[elem];
        }
    }
    return max;
}


function displayError(result, success, error) {
    // Rudimentary error handling.
    // For some reason fetching
    // bus locations sometimes returns
    // 503 no access but infrequently 
    // enough to debug correctly.
    $("#msg").addClass("error");
    var errText;
    switch (result.status) {
        case 0:
            errText = "No Internet, make sure you are connected";
            break;
        case 404:
            errText = "No data received from server";
            break;
        case 503:
            errText = "Server error, try again later";
            break;
        default:
            errText = "Unknown error";
    }

    $("#msg").html(success + " " + result.status + " " + errText);
    //Show the error for 7 sec
    window.setTimeout(clearError, 7000);
}

function clearError() { // Reset the error message
    $("#msg").html("");
    $("#msg").removeClass("error");
}

function showBuses() {
    // Fetch vehicle information
    // (All buses are returned in the response)
    // Calls filterBuses on success.
    $.ajax({
        url: "https://data.foli.fi/siri/vm",
        cache: false,
        dataType: "json",
        type: "GET",
        success: function(result, success) {
            filterBuses(result, success);
        },
        error: function(result, err) {
            displayError(result, err);
        }
    });
}

function filterBuses(result, success) {
    // Screen the vehicles pertinent to the selected
    // route. (All vehicles are returned in the result)
    // Create a map marker for each relevant bus, connected 
    // to the map and store the markers in an array
    // so we can remove them later.
    clearResult();
    var route = $("#routeSel option:selected").text();
    $.each(result['result']['vehicles'], function(key, val) {
        if (val['publishedlinename'] == route) {
            var marker = new google.maps.Marker({
                map: map,
                draggable: false,
                title: key,
                position: {
                    lng: val['longitude'],
                    lat: val['latitude']
                }
            });
            markers.push(marker);
        }
    });
    if (markers.length === 0) {
	    setMessage("No vehicles are assigned to this route at the moment");
    } else {
        clearMessage();
    }


}
function setMessage(msg){
        $('#msg').html(msg);
        $("#msg").addClass("hasMessage");
}

function clearResult() {
    //Remove all markers from the map
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function refresh() {
    // refresh bus position markers
    // (only if we previously have
    // made an initial fetch)
    // Pressing Show Buses a second time
    // will naturally have the same effect.
    //
    if (markers.length > 0) {
        showBuses();
    }
}

function parseRoutes(result, success, err) {
    // Parse the result returned by the call to 
    // fetchRoutes. 
    var newOpt;
    var optArr = [];
    // Clone an option element for each
    // route returned and add it to the array
    for (var i = 0; i < result.length; i++) {
        newOpt = $("#optNone").clone();
        newOpt.html(result[i]['route_short_name']);
        newOpt.val(result[i]['route_id']);
        optArr.push(newOpt);
    }
    //Sort the array
    optArr.sort(function(a, b) {
        //Get the numeric part
        var numA = parseInt(a.text().match(/\d+/));
        var numB = parseInt(b.text().match(/\d+/));
        // Get the text part if present
        var textA = a.text().match(/^[A-z]+/);
        var textB = b.text().match(/^[A-z]+/);
        //get the sort order from numeric part
        var numDiff = numA - numB;
        //Get the sort order of the alphabetic part
        //if either is present
        var textDiff;
        if (textA && textB) {
            textDiff = (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        } else {
            textDiff = (textA) ? 1 : (textB) ? -1 : 0;
        }
        // Numeric part supercedes the text part if both are unequal.
        var diff = (numDiff === 0) ? textDiff : numDiff;
        return diff;
    });
    // Inject the sorted list into the dropdown.
    optArr.forEach(function(el) {
        $('#routeSel').append(el);
    });

}

function createTurkuMap() {
    // Specialized Map creation callback.
    // Center the map over Turku and display
    // a recognizable part of the city.
    createMap(60.4502, 22.276, 12);
}
