/* Common functionality for the two pages that use Google Maps 
 * Written by Dan Björkgren 2017
 */
var map;
var markers = [];
var mapBounds;

function createMap(lat, lng, zoom) {
    zoom = (zoom) ? zoom : 7; // Default fallback is zoomlevel 7
    var mapProp = {
        center: getLocation(lat, lng),
        zoom,
    };
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

function getLocation(lat, lng) {
	// Try to get location from the system
	// as an initial positioning for the map
	// (Will not work unless the page is loaded
	// with https.) Turku is used as default fallback
	// center unless lat and lng are passed as parameters.
    if (!(lat) && !(lng)) {
        lat = 60.4502;
        lng = 22.276;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(loc) {
                lat = loc.latitude;
                lng = loc.longitude;
            });
        } 
    }
    return new google.maps.LatLng(lat, lng);
}
