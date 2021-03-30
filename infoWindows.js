// CREATION DES INFOS WINDOWS
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function addRestaurantInfoWindow() {
    let marker = this;
    if (restaurantIsNew) {
        infoWindowNew.open(map, marker);
        iwAddRestaurant(marker);
        newRestaurantMarker.push(marker);
        newResNum += 1;
    } else {
        infoWindow.open(map, marker);
        iwContent(newPlace[marker.id]);
        displayRestaurantInfo(newPlace[marker.id]);
    }
}

// DISPLAY CONTAINER AVEC LES AVIS & STREETVIEW
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function displayRestaurantInfo(place) {
    showTheForm();
    //Info restaurant selectionné
    restaurantInfoDiv.style.display = "block";
    document.getElementById('name').textContent = place.name;
    document.getElementById('address').textContent = place.vicinity;
    document.getElementById('telephone').textContent = place.formatted_phone_number;
    let reviewsDiv = document.getElementById('Commentaire');
    let reviewHTML = '';
    reviewsDiv.innerHTML = reviewHTML;
    if (place.reviews) {
        if (place.reviews.length > 0) {
            for (let i = 0; i < place.reviews.length; i += 1) {
                let review = place.reviews[i];
                reviewHTML += `<div class="separator">
                                          <h3 class="titreCommentaire">`;
                if(place.rating){
                    reviewHTML +=  `<span id="review-rating" class="rating">${starRating(review)}</span>`;
                }
                reviewHTML +=  ` </h3>
                                                <p class="name-review"> ${place.reviews[i].author_name} </p>
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
    const streetViewWrapper = document.getElementById('streetViewWrapper');
    const seeStreetView = document.getElementById('see-streetView');
    streetViewWrapper.style.display = 'block';
    seeStreetView.style.display = 'none';

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

// INFOWINDOWS INFO DU RESTO CONTAINER2
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function iwContent(place) {
    document.getElementById('iwUrl').innerHTML = '<b><a href="#restaurantInfo">' + place.name + '</a></b>';
    document.getElementById('iwAddresse').textContent = place.vicinity;
    if (place.formatted_phone_number) {
        document.getElementById('iwPhone').style.display = '';
        document.getElementById('iwPhone').textContent = place.formatted_phone_number;
    } else {
        document.getElementById('iwPhone').style.display = 'none';
    }
    if (place.rating) {
        let ratingHtml = '';
        for (let i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
            } else {
                ratingHtml += '&#10029;';
            }
            document.getElementById('iwRating').style.display = '';
            document.getElementById('iwRating').innerHTML = ratingHtml;
        }
    } else {
        document.getElementById('iwRating').style.display = 'none';
    }
}

// INFOWINDOWS AJOUT RESTAURANTS
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


function iwAddRestaurant(marker) {
    restaurantInfoDiv.style.display = "block";
    form.style.padding = '10px';
    form.innerHTML = `
                    <h3 class="headAjoutRestaurant">Ajouter un restaurant</h3>
                    <input type="text" id="name" name="name" placeholder="Nom" required/>
                    <input type="hidden" id="location-lat" name="location-lat" value="${marker.position.lat()}"/>
                    <input type="hidden" id="location-lng" name="location-lng" value="${marker.position.lng()}"/>
                    <input type="text" name="address" id="address" placeholder="Adresse" required/>
                    <label for="rating">Note : </label>
                    <select name="rating" id="rating" required>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    <input type="text" name="telephone" id="telephone" placeholder="Telephone" />
                    <button id="addRestaurant" class="button addRestaurant">Ajouter</button>`;
}


