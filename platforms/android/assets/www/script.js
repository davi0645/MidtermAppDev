// JavaScript Document
document.addEventListener("DOMContentLoaded", function(){
	
	var
	  homePic = document.getElementById("homepic");
	  locationPic = document.getElementById("locationpic");
	  contactsPic = document.getElementById("contactspic");
	  homePage = document.getElementById("home");
	  locationPage = document.getElementById("location");
	  contactsPage = document.getElementById("contacts");
	  loadedMap = false;
	  loadedContacts = {};
	  contactsJSON = [];
	  
	homePic.addEventListener("click", function() {
		locationPage.className = "inactive";
		contactsPage.className = "inactive";
		homePage.className = "active";
	});

	document.addEventListener("deviceready", function(){
			locationPic.addEventListener("click", function() {
			locationPage.className = "active";
			contactsPage.className = "inactive";
			homePage.className = "inactive";
			
			if( navigator.geolocation ){
				var params = {enableHighAccuracy: true, timeout:3600, maximumAge:60000};
				navigator.geolocation.getCurrentPosition( reportPosition, gpsError, params );
			}else{
				alert("Sorry, but your browser does not support location based awesomeness.");
			}
			
			function reportPosition( position ){
				var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				var myOptions = {
					zoom: 14,
					center: myLatlng,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				}
				var map = new google.maps.Map(document.getElementById("output"), myOptions);
			}
			
			function gpsError( error ){
				var errors = {
					1: 'Permission denied',
					2: 'Position unavailable',
					3: 'Request timeout'
				};
				alert("Error: " + errors[error.code]);
			}
		});

		contactsPic.addEventListener("click", function() {
			locationPage.className = "inactive";
			contactsPage.className = "active";
			homePage.className = "inactive";

			var options = new ContactFindOptions();
			options.filter = ""; 
			options.multiple = true; 
			var filter = ["displayName", "nickname", "phoneNumbers"];  
			var output = document.querySelector("#contactsList");
			navigator.contacts.find(filter, successFunc, errFunc, options);

			function saveContactsJSON(contacts) {
				var jsonString = JSON.stringify([contacts]);
			}

			function successFunc( matches ){
				var numContacts = matches.length;
				if (numContacts > 12)
					numContacts = 12;

				output.innerHTML = "";
				for (var i = 0; i < numContacts; i++) {
					output.innerHTML += "<li id=\"" + i + "\" class=\"contactItem\">" + matches[i].displayName + "</li>";
					var newContact = {
						name: matches[i].displayName,
						numbers: matches[i].phoneNumbers,
						lat: "",
						lng: ""
					}
					loadedContacts[i] = newContact;
				}

				if (contactsJSON.length == 0)
					saveContactsJSON(loadedContacts);

				var listItems = document.querySelectorAll(".contactItem");
				for(var i = 0; i < listItems.length; i++) {
					var mc = new Hammer.Manager(listItems[i], {});

					mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
					mc.add( new Hammer.Tap({ event: 'singletap' }) );

					mc.get('doubletap').recognizeWith('singletap');
					mc.get('singletap').requireFailure('doubletap');

					mc.on("singletap doubletap", handleListClick);
				}
			}

		    function errFunc( error ) {
		        alert("Error: " + error.code);
		  	}

		  	function handleListClick(e) {
		  		var allNumbers = "";
		  		if(e.type == "singletap") {
			  		for(var i = 0; i < loadedContacts[e.target.id].numbers.length; i++)
			  			allNumbers += loadedContacts[e.target.id].numbers[i].value + "\n";
			  		window.confirm(loadedContacts[e.target.id].name + "\n" + allNumbers);
			  	} else {
			  		locationPage.className = "active";
					contactsPage.className = "inactive";
					homePage.className = "inactive";
					var theContact = loadedContacts[e.target.id];
					if( navigator.geolocation ){
						var params = {enableHighAccuracy: true, timeout:3600, maximumAge:60000};
						navigator.geolocation.getCurrentPosition( reportPosition, gpsError, params );
					}else{
						alert("Sorry, but your browser does not support location based awesomeness.");
					}
					
					function reportPosition( position ){
						var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						if (contacts.lat != "") {
							myLatlng = new google.maps.LatLng(theContact.lat, theContact.lng);
						} else {
							alert("This contact does not have a map location. Double click on the map to set contact position.");
						}
						var myOptions = {
							zoom: 14,
							center: myLatlng,
							mapTypeId: google.maps.MapTypeId.ROADMAP
						}
						var map = new google.maps.Map(document.getElementById("output"), myOptions);
					}
					
					function gpsError( error ){
						var errors = {
							1: 'Permission denied',
							2: 'Position unavailable',
							3: 'Request timeout'
						};
						alert("Error: " + errors[error.code]);
					}

			  	}
		  	}
		});
	});
});