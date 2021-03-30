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

// FUNCTION CREATION MARKER
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function createMarker() {
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


// DROP MARKER
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function dropMarker(i) {
    return function () {
        markers[i].setMap(map);
    };
}

// AFFICHAGE RESTAURANT FORM AVIS
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function showTheForm() {
    document.getElementById("formWrapper").style.display = 'block';
    document.getElementById("addReviewButton").style.display = 'block';
}
