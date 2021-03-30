let croissant = false;
let decroissant = false;
let voirTout = false;


// CREATION STAR RATING FILTRE
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

function resetFiltre() {
    croissant = false;
    decroissant = false;
    voirTout = false;
}


