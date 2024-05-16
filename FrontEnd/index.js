// Variables générales 
const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");

// Récupération des travaux via l'API et affichage des travaux

async function getWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) {
            throw new Error('Request failed!');
        }
        const works = await response.json();
        console.table(works);

        works.forEach(work => {
            const figure = document.createElement('figure');
            figure.classList.add('result');
            figure.id = work.categoryId;

            const img = document.createElement('img');
            img.src = work.imageUrl;
            figure.appendChild(img);

            const figCaption = document.createElement('figcaption');
            figCaption.textContent = work.title;
            figure.appendChild(figCaption);

            gallery.appendChild(figure);
        });
    } catch (error) {
        console.error('Error fetching works:', error);
    }
}

getWorks();


// Récupération des catégories via l'API et affichage des filtres

async function getCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) {
            throw new Error('Request failed!');
        }
        const categories = await response.json();
        console.log(categories);
        
        // Rajout du bouton filtre 'Tous'
        categories.unshift({ id: 0, name: 'Tous' });

        categories.forEach(category => {
            const button = document.createElement("button");
            button.classList.add('category_filter');
            button.textContent = category.name;
            button.id = category.id;
            filters.appendChild(button);

            button.addEventListener('click', event => {
                const results = document.querySelectorAll('.result');
                results.forEach(result => {
                    if (button.id === '0' || result.id === button.id) {
                        result.style.display = 'block';
                    } else {
                        result.style.display = 'none';
                    }
                });
                // Supprimer la classe active de tous les boutons
                const activeButtons = document.querySelectorAll('.category_filter.active_button');
                activeButtons.forEach(activeButton => {
                    activeButton.classList.remove('active_button');
                });

                // Ajouter la classe active au bouton cliqué
                button.classList.add('active_button');
            });
        });
         // Ajouter la classe active au bouton "Tous"
         const allButton = document.getElementById('0');
         allButton.classList.add('active_button');

    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

getCategories();
