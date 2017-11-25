var mapBounds;
var hasStorage = true;
var map;
var markers = [];
$(function(){
	$("#search").click(search);
	$("#search").prop('disabled', true);
	$("#countries").change(validate);
	document.getElementById("zipcode").oninput=validate;
	if (typeof(Storage) !== "undefined"){
		var history=localStorage.getItem("historyList");
		$("#hItems").append(JSON.parse(history));
	} else {
		hasStorage=false;
	}
		
	
});
function search(){
	var zipReqString="http://api.zippopotam.us/"+$("#countries").val()+"/"+$("#zipcode").val();
	$.ajax({
		url: zipReqString,
		cache: false,
		dataType: "json",
		type: "GET",
		success: function(result, success){ parse(result, success);},
		error: function(result, success) {
		$("#zipcode").addClass('error');
		}
		});
};

function validate(){
	if ($("#countries").val()=="none") return;
	if ($("#zipcode").val()=="") return;
	$("#search").prop('disabled',false);
}

function parse(result,success) {
	clearResult();
	for (i=0;i<result.places.length;i++) {	
		createLocation(result.places[i]);
	}
	mapBounds=new google.maps.LatLngBounds();
	for (var i=0;i<markers.length;i++){
		mapBounds.extend(markers[i].position);
	}
	map.fitBounds(mapBounds);
	zoomChangeBoundsListener =
    	google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
        if (this.getZoom()>10){
            this.setZoom(10);
        }
});
setTimeout(function(){google.maps.event.removeListener(zoomChangeBoundsListener)}, 2000);
	$("#zipcode").removeClass('error');
	addLocationHistory();
}
function createMap(){
	var mapProp= {
    		center:new google.maps.LatLng(51.508742,-0.120850), zoom:5, };
	map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
}
function addMarker(longitude, latitude){
	var marker=new google.maps.Marker({position: new google.maps.LatLng(latitude,longitude),map:map});
	markers.push(marker);
}

function clearResult(){
	$("#coordTable .tableRow").not('.tableRow:first').remove();
	for (var i =0;i<markers.length;i++){
		markers[i].setMap(null);
	}
	markers=[];
}
function createLocation(resultObject){
	var row = "<div class='tableRow'><div class='tablecell col1'>"+ resultObject['place name']+"</div> <div class='tablecell col2'>"+resultObject['longitude']+"</div> <div class='tablecell col3'>"+resultObject['latitude']+"</div> </div>";
	$("#coordTable").append(row);
	addMarker(resultObject['longitude'],resultObject['latitude']);
}
function addLocationHistory(){
	var hCount = $("#hItems p").length;	
	if (hCount==10){
		$("#hItems p:last").remove();
	}
	var locRow = "<p class='hitem'>"+$("#countries option:selected").text()+ 
		", "+$("#zipcode").val()+"</p>";
	$("#hItems").prepend(locRow);
	if (hasStorage){
		var paragraphs=$("#hItems").html();
		localStorage.setItem("historyList", JSON.stringify(paragraphs));
	} 
}
