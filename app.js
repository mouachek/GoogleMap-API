"use strict";
let map;
let infoWindow;
let infoWindowNew;


let restaurantIsNew = true;

let markers = [];
let newReviewArray = [];
let newRestaurantMarker = [];
let newPlace = [];
let myRestaurants = [];
let googleRestaurants = [];
let newResNum = -1;


let restaurantInfoDiv = document.getElementById('restaurantInfo');
let filtreOptionDiv = document.getElementById('filtreDiv');
let filtreBy = document.getElementById('filtre');
let form = document.getElementById('formAjoutRestaurant');

filtreOptionDiv.style.display = "none";
restaurantInfoDiv.style.display = "none";

let pos = {
    lat: 39.5696,
    lng: 2.6502,
};

// INITIALISATION DE LA MAP
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function initMap( json ) {

    // GEOLOCALISATION
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };


            if (typeof google === 'object' && typeof google.maps === 'object') {
                filtreOptionDiv.style.display = "block";
            }

            // creation de la map

            map = new google.maps.Map(document.getElementById('map'), {
                center: pos,
                zoom: 14,
                streetViewControl: false
            });

            infoWindow = new google.maps.InfoWindow({
                content: document.getElementById('iwMap')
            });
            infoWindowNew = new google.maps.InfoWindow({
                content: document.getElementById('iwNouveauRestaurant'),
            });

            infoWindow.setPosition(pos);
            map.setCenter(pos);
            let marker = new google.maps.Marker({
                position: pos,
                draggable: true
            });
            //animation
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null)
            }, 4000);
            marker.setMap(map);

            map.addListener('dragend', function () {
                filtreBy.value = 'voirTout';
                myRestaurants=[];
                resetFiltre();
                search();
            });

            // UTILISATION DU JSON DE LA PARTIE 2
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


            for (var i = 0; i < json.length; i++) {

                var obj = json[i];

                var image = "./img/marker_json.png";
                var marker2 = new google.maps.Marker({
                    position: new google.maps.LatLng(obj.lat, obj.long),
                    map: map,
                    icon: image,
                    title: obj.restaurantName
                });

                var moyenne = obj.ratings[0].stars + obj.ratings[1].stars / 2

                var clicker = addClicker(marker2, `<h2>${obj.restaurantName}</h2>` + `<p>Moyenne resto: ${moyenne} / 10 </p>`
                    + `<br/> <h5>avis :</h5>` + `"${obj.ratings[0].comment}"` +
                    '<br/> <br/>' + `"${obj.ratings[1].comment}"`);
            }
            ;

            function addClicker(marker2, content) {
                google.maps.event.addListener(marker2, 'click', function () {

                    if (infowindow) {
                        infowindow.close();
                    }
                    var infowindow = new google.maps.InfoWindow({content: content});
                    infowindow.open(map, marker2);
                });
            }

            // AJOUT RESTAURANT AVEC UN CLICK DROIT
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            map.addListener('rightclick', function (e) {
                closeInfoWindow();
                restaurantIsNew = true;
                let latlng = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
                let marker = new google.maps.Marker({
                    position: latlng,
                    icon: createMarker(latlng),
                    id: newResNum + 1
                });
                google.maps.event.addListener(marker, 'click', addRestaurantInfoWindow);
                marker.setMap(map);
            });


            // CONNEXION A LAPI GOOGLE
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            const places = new google.maps.places.PlacesService(map);
            const service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: pos,
                radius: 500,
                type: ['restaurant']
            }, call);

            function call(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    search()
                }
            }

            function showInfoWindow() {
                let marker = this;
                places.getDetails({
                    placeId: marker.placeResult.place_id
                }, function(place, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        return;
                    }
                    infoWindow.open(map, marker);
                    iwContent(place);
                    displayRestaurantInfo(place);
                });
            }

            // FERMETURE DES INFOS WINDOWS / SHOW
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function closeInfoWindow() {
                infoWindow.close(map, marker);
            }

            function closeInfoWindowNew() {
                infoWindowNew.close(map, marker);
            }

            //   FUNCTION DE TRIE
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            filtreBy.addEventListener('change', function () {
                if (filtreBy.value === 'croissant') {
                    resetFiltre();
                    croissant = true;
                    search();
                } else if (filtreBy.value === 'decroissant') {
                    resetFiltre();
                    decroissant = true;
                    search();
                }
                else if (filtreBy.value === 'voirTout') {
                    resetFiltre();
                    voirTout = true;
                    search();
                }
            });

            function search() {
                let search = {
                    bounds: map.getBounds(),
                    type: ['restaurant']
                };
                places.nearbySearch(search, function (results, status, pagination) {

                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        clearResults();
                        clearMarkers();

                        googleRestaurants = [];
                        for (let i = 0; i < results.length; i++) {
                            googleRestaurants.push(results[i]);
                        }
                        for (let i = 0; i < results.length; i++) {
                            markers[i] = new google.maps.Marker({
                                position: results[i].geometry.location,
                                placeId: results[i].id,
                                icon: createMarker(googleRestaurants[i]),
                                zIndex: 52,
                            });
                            // quand un user click sur un resto, on affiche les infos
                            google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                            google.maps.event.addListener(map, "click", closeInfoWindow);
                                if (croissant) {
                                    results.sort(function (a, b) {
                                        return b.rating - a.rating;
                                    });
                                } else if (decroissant) {
                                    results.sort(function (a, b) {
                                        return a.rating - b.rating;
                                    });
                                }
                                addResultsAndMarkers(i, results, i);
                        }
                    }
                });
            }

            // IW AJOUT DE NOUVEAUX RESTAURANTS
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            document.getElementById("formAjoutRestaurant").addEventListener("submit", function (e) {
                e.preventDefault();
                form.style.padding = '';
                let name = document.getElementById('name');
                let address = document.getElementById('address');
                let telephone = document.getElementById('telephone');
                let rating = document.getElementById('rating');
                let locationLat = document.getElementById('location-lat');
                let locationLng = document.getElementById('location-lng');

                let position = new google.maps.LatLng(locationLat.value, locationLng.value);

                let place = {
                    name: name.value,
                    vicinity: address.value,
                    formatted_phone_number: telephone.value,
                    rating: rating.value,
                    position: position,
                    geometry: {location: position},
                    icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png',
                    reviews: '',
                    photos: '',

                };


                // PUSH DANS UN TABLEAU POUR SAVOIR LEQUEL AFFICHER QUAND IL Y EN A PLUSIEURS
                // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

                newPlace.push(place);
                closeInfoWindowNew();
                let marker = newRestaurantMarker[newResNum];
                restaurantIsNew = false;
                infoWindow.open(map, marker);
                iwContent(place);
                displayRestaurantInfo(place);

            });

            // ERREUR GEOLOCALISATION CHARGEMENT
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


        }, function (error) {
            let loadingDiv= document.getElementById('loading');
            if(error.code === 1){
                loadingDiv.innerHTML = "Veuillez activer votre géolocalisation et rafraichir la page.";
            }
        });
    }
}

// FORM SUBMIT AJOUT DE NOUVEAUX COMMENTAIRES ET SAUVEGARDE
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

document.getElementById("addList").addEventListener("submit", function (e) {
    e.preventDefault();
    let newName = document.getElementById("persoNom");
    let newRating = document.getElementById("persoNote");
    let newReview = document.getElementById("persoCommentaire");
    if (!(newName.value && newRating.value && newReview.value)) {
        return;
    }
    addReview(newName.value, newRating.value, newReview.value);
    newName.value = "";
    newRating.value = "";
    newReview.value = "";
});


// FETCH SUR LE FICHIER JSON

function readJson () {
    fetch('/P07/restaurants.json')
        .then(response => {
            if (!response.ok) {
                alert("le json restaurants n'a pas pu etre lu")
            }
            return response.json();
        })
        .then(json => {
            initMap(json);
        })
        .catch(function (err) {
            alert("erreur catch")
            console.log(err)
        })
}
