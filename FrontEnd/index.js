// Variables générales 
const gallery = document.querySelector(".gallery");

// Récupération de l'API et affichage des travaux

fetch("http://localhost:5678/api/works")

.then(response => {
    if (response.ok) {
        return response.json();
    }
    throw new Error('Request failed!');
}, networkError => console.log(networkError.message))

.then(function(data) {
	let works = data;
	console.table(works);
	// Création et affichage de chaque travail
	works.forEach((work) => {

		// Creation <figure>
		let myFigure = document.createElement('figure');
        gallery.appendChild(myFigure);
		
		// Creation <img>
		let myImg = document.createElement('img');
		myImg.src = work.imageUrl;
		myFigure.appendChild(myImg);

		// Creation <figcaption>
		let myFigCaption = document.createElement('figcaption');
		myFigCaption.textContent = work.title;
		myFigure.appendChild(myFigCaption);
		
	});
})


