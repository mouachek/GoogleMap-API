
// Fonction pour ajouter des commentaires

function addReview(newName, newRating, newReview) {
    let newReviewDetails = {
        name: newName,
        rating: newRating,
        review: newReview,
    };
    let reviewsDiv = document.getElementById('Commentaire');
    let newReviewHTML = '';
    newReviewHTML += `<div class="separator">
                         <h3 class="review-title">
                         <span id="review-rating" class="rating">${starRating(newReviewDetails)}</span>
                         </h3>
                         <p> ${newReviewDetails.name} </p>
                         <p> ${newReviewDetails.review} </p>
                       </div>`;
    newReviewArray.push(newReviewDetails); // push le commentaire dans le tab
    reviewsDiv.insertAdjacentHTML("afterbegin", newReviewHTML); // ajout du commentaire au top de la liste
}
