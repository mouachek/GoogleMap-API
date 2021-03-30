"use strict";
let map;
let infoWindow;
let infoWindowNew;
let markers = [];
let autocomplete;
let autocompleteRestaurant;
let sortAsc = false;
let sortDesc = false;
let allStars = false;
let sort5Star = false;
let sort3Star = false;
let sort4Star = false;
let newReviewArray = [];
let newRestaurantMarker = [];
let restaurantIsNew = true;
let newPlace = [];
let newResNum = -1;
let myRestaurants = [];
let googleRestaurants = [];
let restaurantInfoDiv = document.getElementById('restaurant-info');
let sortOptionsDiv = document.getElementById('sort-options');
sortOptionsDiv.style.display = "none";
restaurantInfoDiv.style.display = "none";
let sortBy = document.getElementById('sort');
let form = document.getElementById('form-add-restaurant');
let hasPhoto = true;
let pos = {
    lat: 39.5696,
    lng: 2.6502,
};

function restSort() {
    sortAsc = false;
    sortDesc = false;
    sort4Star = false;
    sort3Star = false;
    sort5Star = false;
    allStars = false;
}

// CREATION STAR RATING
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


function starRating(place) {
    let rating = [];
    if (place.rating) {
        for (let i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                rating.push('&#10025;');
            } else {
                rating.push('&#10029;');
            }
        }
        return rating.join(' ');
    }
}

// INITIALISATION DE LA MAP
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function initMap() {

    // GEOLOCALISATION
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };


            if (typeof google === 'object' && typeof google.maps === 'object') {
                sortOptionsDiv.style.display = "block";
            }

            map = new google.maps.Map(document.getElementById('map'), {
                center: pos,
                zoom: 14,
                streetViewControl: false
            });

            infoWindow = new google.maps.InfoWindow({
                content: document.getElementById('info-content')
            });
            infoWindowNew = new google.maps.InfoWindow({
                content: document.getElementById('info-content-new-restaurant'),
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
                sortBy.value = 'allStars';
                myRestaurants=[];
                restSort();
                search();
            });

            // AJOUT RESTO AVEC CLICK DROIT
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            map.addListener('rightclick', function (e) {
                closeInfoWindow();
                restaurantIsNew = true;
                let latlng = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
                let marker = new google.maps.Marker({
                    position: latlng,
                    icon: createMarkerStars(latlng),
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
            }, callback);

            function callback(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    search()
                }
            }

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
                                icon: createMarkerStars(googleRestaurants[i]),
                                zIndex: 52,
                            });
                            // quand un user click sur un resto, on affiche les infos
                            google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                            google.maps.event.addListener(map, "click", closeInfoWindow);


                            if (sort3Star) {
                                if (Math.round(results[i].rating) <= 3) {
                                    addResultsAndMarkers(i, results, i);
                                }
                            } else if (sort4Star) {
                                if (Math.round(results[i].rating) === 4) {
                                    addResultsAndMarkers(i, results, i);
                                }
                            } else if (sort5Star) {
                                if (Math.round(results[i].rating) === 5) {
                                    addResultsAndMarkers(i, results, i);
                                }
                            } else {
                                if (sortAsc) {
                                    results.sort(function (a, b) {
                                        return b.rating - a.rating;
                                    });
                                } else if (sortDesc) {
                                    results.sort(function (a, b) {
                                        return a.rating - b.rating;
                                    });
                                }
                                addResultsAndMarkers(i, results, i);
                            }
                        }
                    }
                });
            }

            // EVENT LISTER TRIE
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            sortBy.addEventListener('change', function () {
                if (sortBy.value === 'sortAsc') {
                    restSort();
                    sortAsc = true;
                    search();

                } else if (sortBy.value === 'sortDesc') {
                    restSort();
                    sortDesc = true;
                    search();
                }
                else if (sortBy.value === 'sort4Star') {
                    restSort();
                    sort4Star = true;
                    search();
                }
                else if (sortBy.value === 'sort3Star') {
                    restSort();
                    sort3Star = true;
                    search();
                }
                else if (sortBy.value === 'sort5Star') {
                    restSort();
                    sort5Star = true;
                    search();
                }
                else if (sortBy.value === 'allStars') {
                    restSort();
                    allStars = true;
                    search();
                }
            });

            // RESET LES VALEURS
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function clearMarkers() {
                for (let i = 0; i < markers.length; i++) {
                    if (markers[i]) {
                        markers[i].setMap(null);
                    }
                }
                markers = [];
            }

            function clearResults() {
                let results = document.getElementById('results');
                while (results.childNodes[0]) {
                    results.removeChild(results.childNodes[0]);
                }
            }

            // DROP MARKER
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function dropMarker(i) {
                return function () {
                    markers[i].setMap(map);
                };
            }

            // CREATION DE LA LISTE DES RESTOS
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function addResultList(result, i) {
                let resultsDiv = document.getElementById('results');
                let listDiv = document.createElement('div');
                listDiv.setAttribute('class', 'results-list');
                listDiv.onclick = function () {
                    google.maps.event.trigger(markers[i], 'click');
                };
                let details = `<div class="placeIcon"><img src ="${createPhoto(result)}" /></div>
                                <div class="placeDetails">
                                <div class="name">${result.name}</div>`;
                if(result.rating){
                    details += `<div class="rating">${starRating(result)}</div>`;
                }
                listDiv.insertAdjacentHTML("beforeEnd", details);
                resultsDiv.appendChild(listDiv);
            }

            // RECUPERATION DES PHOTOS VIA LAPI
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function createPhoto(place) {
                let photos = place.photos;
                let photo;
                if (!photos) {
                    photo = place.icon;
                    hasPhoto = false;
                } else {
                    hasPhoto = true;
                    photo = photos[0].getUrl({
                        'maxWidth': 600,
                        'maxHeight': 400
                    });
                }
                return photo;
            }

            // CREATION DES INFOS WINDOWS
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function showInfoWindow() {
                let marker = this;
                places.getDetails({
                    placeId: marker.placeResult.place_id
                }, function(place, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        return;
                    }
                    infoWindow.open(map, marker);
                    buildIWContent(place);
                    displayRestaurantInfo(place);
                });
            }

            function addRestaurantInfoWindow() {
                let marker = this;
                if (restaurantIsNew) {
                    infoWindowNew.open(map, marker);
                    buildResDetailContent(marker);
                    newRestaurantMarker.push(marker);
                    newResNum += 1;
                } else {
                    infoWindow.open(map, marker);
                    buildIWContent(newPlace[marker.id]);
                    displayRestaurantInfo(newPlace[marker.id]);
                }
            }

            // FERMETURE DES INFOS WINDOWS
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function closeInfoWindow() {
                infoWindow.close(map, marker);
            }

            function closeInfoWindowNew() {
                infoWindowNew.close(map, marker);
            }

            // DISPLAY BIG INFO WINDOWS AVEC LES AVIS
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function displayRestaurantInfo(place) {
                showTheForm();
                restaurantInfoDiv.style.display = "block";
                document.getElementById('name').textContent = place.name;
                document.getElementById('address').textContent = place.vicinity;
                document.getElementById('telephone').textContent = place.formatted_phone_number;
                let reviewsDiv = document.getElementById('reviews');
                let reviewHTML = '';
                reviewsDiv.innerHTML = reviewHTML;
                if (place.reviews) {
                    if (place.reviews.length > 0) {
                        for (let i = 0; i < place.reviews.length; i += 1) {
                            let review = place.reviews[i];
                            let avatar;
                            if (place.reviews[i].profile_photo_url) {
                                avatar = place.reviews[i].profile_photo_url;
                            }
                            reviewHTML += `<div class="restaurant-reviews">
                                          <h3 class="review-title">
                                             <span class="profile-photo" style="background-image: url('${avatar}')"></span>`;
                            if(place.rating){
                                reviewHTML +=  `<span id="review-rating" class="rating">${starRating(review)}</span>`;
                            }
                            reviewHTML +=  ` </h3>
                                                <p> ${place.reviews[i].text} </p>
                                            </div>`;
                            reviewsDiv.innerHTML = reviewHTML;
                        }
                    }
                }

                // GOOGLE STREET VIEW
                // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

                let sv = new google.maps.StreetViewService();
                sv.getPanorama({
                    location: place.geometry.location,
                    radius: 50
                }, processSVData);

                const panoDiv = document.getElementById('pano');
                const streetViewWrapper = document.getElementById('street-view-wrapper');
                const photoDiv = document.getElementById('photo');
                const seePhoto = document.getElementById('see-photo');
                const seeStreetView = document.getElementById('see-street-view');
                photoDiv.innerHTML = '<img class="photo-big" ' + 'src="' + createPhoto(place) + '"/>';

                streetViewWrapper.style.display = 'block';
                seeStreetView.style.display = 'none';
                photoDiv.style.display = 'none';
                if(hasPhoto){
                    seePhoto.style.display = 'block';
                }else{
                    seePhoto.style.display = 'none';
                }

                function processSVData(data, status) {
                    if (status === 'OK') {
                        let panorama = new google.maps.StreetViewPanorama(panoDiv);
                        panorama.setPano(data.location.pano);
                        panorama.setPov({
                            heading: 270,
                            pitch: 0
                        });
                        panorama.setVisible(true);
                        seePhoto.style.display = 'none';
                        streetViewWrapper.style.display = 'none';
                        photoDiv.style.display = 'block';
                    }
                }
            }

            // FUNCTION CREATION MARKER
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function createMarkerStars() {
                let markerIcon;
                    markerIcon = 'img/marker_default.png';
                return markerIcon;
            }

            // RESULT + MARKER
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function addResultsAndMarkers(markersI, array, i){
                addResultList(array[i], markersI);
                markers[markersI].placeResult = array[i];
                setTimeout(dropMarker(markersI), i * 100);
            }

            // INFOWINDOWS
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function buildIWContent(place) {
                document.getElementById('iw-icon').innerHTML = '<img class="photo" ' + 'src="' + createPhoto(place) + '"/>';
                document.getElementById('iw-url').innerHTML = '<b><a href="#restaurant-info">' + place.name + '</a></b>';
                document.getElementById('iw-address').textContent = place.vicinity;
                if (place.formatted_phone_number) {
                    document.getElementById('iw-phone').style.display = '';
                    document.getElementById('iw-phone').textContent = place.formatted_phone_number;
                } else {
                    document.getElementById('iw-phone').style.display = 'none';
                }
                if (place.rating) {
                    let ratingHtml = '';
                    for (let i = 0; i < 5; i++) {
                        if (place.rating < (i + 0.5)) {
                            ratingHtml += '&#10025;';
                        } else {
                            ratingHtml += '&#10029;';
                        }
                        document.getElementById('iw-rating').style.display = '';
                        document.getElementById('iw-rating').innerHTML = ratingHtml;
                    }
                } else {
                    document.getElementById('iw-rating').style.display = 'none';
                }
            }

            // CREATION IF NOUVEAU RESTO
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

            function buildResDetailContent(marker) {
                restaurantInfoDiv.style.display = "block";
                form.style.padding = '10px';
                form.innerHTML = `
                    <h3 class="add-res-heading">Ajouter un restaurant</h3>
                    <input type="text" id="res-name" name="res-name" placeholder="Nom" required/>
                    <input type="hidden" id="res-location-lat" name="res-location-lat" value="${marker.position.lat()}"/>
                    <input type="hidden" id="res-location-lng" name="res-location-lng" value="${marker.position.lng()}"/>
                    <input type="text" name="res-address" id="res-address" placeholder="Adresse" required/>
                    <label for="res-rating">Note : </label>
                    <select name="res-rating" id="res-rating" required>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    <input type="text" name="res-telephone" id="res-telephone" placeholder="Telephone" />
                    <button id="add-restaurant" class="button add-restaurant">Ajouter</button>`;
            }

            document.getElementById("form-add-restaurant").addEventListener("submit", function (e) {
                e.preventDefault();
                form.style.padding = '';
                let name = document.getElementById('res-name');
                let address = document.getElementById('res-address');
                let telephone = document.getElementById('res-telephone');
                let rating = document.getElementById('res-rating');
                let locationLat = document.getElementById('res-location-lat');
                let locationLng = document.getElementById('res-location-lng');

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
                buildIWContent(place);
                displayRestaurantInfo(place);

            });

            // ERREUR GEOLOCALISATION CHARGEMENT
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


        }, function (error) {
            let loadingDiv= document.getElementById('loading');
            if(error.code === 0){
                loadingDiv.innerHTML = "Erreur inconnue.";
            } else if(error.code === 1) {
                loadingDiv.innerHTML = "Activé votre geolocalisation";
            } else if(error.code === 2) {
                loadingDiv.innerHTML = "Time out.";
            } else if(error.code === 3) {
                loadingDiv.innerHTML = "Time out.";
            }
            handleLocationError(true, infoWindow, map.getCenter(pos));
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter(pos));
    }
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);

    }


}

// AFFICHAGE RESTAURANT FORM AVIS
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function showTheForm() {
    document.getElementById("form-wrapper").style.display = 'block';
    document.getElementById("add-review-button").style.display = 'block';
}

function hideTheForm() {
    document.getElementById("form-wrapper").style.display = 'none';
    document.getElementById("add-review-button").style.display = 'none';
}

// FORM SUBMIT AJOUT DE NOUVEAU COM ET SAUVEGARDE
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

document.getElementById("add-review").addEventListener("submit", function (e) {
    e.preventDefault();
    let newName = document.getElementById("your-name");
    let newRating = document.getElementById("your-rating");
    let newReview = document.getElementById("your-review");
    if (!(newName.value && newRating.value && newReview.value)) {
        return;
    }
    addReview(newName.value, newRating.value, newReview.value);
    newName.value = "";
    newRating.value = "";
    newReview.value = "";
    hideTheForm();
});

function addReview(newName, newRating, newReview) {
    let newReviewDetails = {
        name: newName,
        rating: newRating,
        review: newReview,
    };
    let reviewsDiv = document.getElementById('reviews');
    let newReviewHTML = '';
    newReviewHTML += `<div class="restaurant-reviews">
                         <h3 class="review-title">
                         <span id="review-rating" class="rating">${starRating(newReviewDetails)}</span>
                         </h3>
                         <p> ${newReviewDetails.review} </p>
                       </div>`;
    newReviewArray.push(newReviewDetails); //push
    reviewsDiv.insertAdjacentHTML("afterbegin", newReviewHTML); //add to the top of content
}
