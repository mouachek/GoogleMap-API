// CREATION LISTE RESTAURANTS A GAUCHE
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function addResultList(result, i) {
    let resultsDiv = document.getElementById('results');
    let listDiv = document.createElement('div');
    listDiv.setAttribute('class', 'listRestaurants');
    listDiv.onclick = function () {
        google.maps.event.trigger(markers[i], 'click');
    };
    let details = `
                                <div class="placeDetails">
                                <div class="name">${result.name}</div>`;
    if(result.rating){
        details += `<div class="rating">${starRating(result)}</div>`;
    }
    listDiv.insertAdjacentHTML("beforeEnd", details);
    resultsDiv.appendChild(listDiv);
}
