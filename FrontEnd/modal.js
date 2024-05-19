document.addEventListener("DOMContentLoaded", () => {
    let modal = null;
    let workIdToDelete = null;
    let figureToDelete = null; // Stocke l'élément figure à supprimer

    // Fonction pour ouvrir la modale
    const openModal = (e) => {
        e.preventDefault();
        const target = document.getElementById('modal');
        target.style.display = null;
        target.removeAttribute('aria-hidden');
        target.setAttribute('aria-modal', 'true');
        modal = target;
        modal.addEventListener('click', closeModal);
        modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
        populateModalWithImages();
    }

    // Fonction pour fermer la modale
    const closeModal = (e) => {
        if (modal === null) return;
        e.preventDefault();
        window.setTimeout(() => {
            modal.style.display = 'none';
            modal = null;
        }, 500);
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal.removeEventListener('click', closeModal); 
        modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
        modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
    }

    // Fonction pour arrêter la propagation de l'événement
    const stopPropagation = (e) => {
        e.stopPropagation();
    }

    // Gestion de l'ouverture de la modale
    document.querySelectorAll('.js-modal').forEach(a => {
        a.addEventListener('click', openModal);  
    });

    // Gestion de la fermeture de la modale avec la touche Echap
    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape" || e.key === "Esc") {
            closeModal(e);
        }
    });

    // Fonction pour peupler la modale avec les images
    async function populateModalWithImages() {
        try {
            const response = await fetch("http://localhost:5678/api/works");
            if (!response.ok) {
                throw new Error('Request failed!');
            }
            const works = await response.json();
            const modalImageContainer = modal.querySelector('.modal-images');
            modalImageContainer.innerHTML = '';
            works.forEach(work => {
                const figure = document.createElement('figure');
                figure.classList.add('modal-result');

                const img = document.createElement('img');
                img.src = work.imageUrl;
                img.alt = work.title;
                img.classList.add('modal-image');
                figure.appendChild(img);

                const trashIcon = document.createElement('i');
                trashIcon.classList.add('fa-solid', 'fa-trash-can');
                trashIcon.dataset.workId = work.id; // Utilisation de dataset pour stocker l'ID du travail
                figure.appendChild(trashIcon);

                // Ajout de l'événement pour la suppression d'éléments
                trashIcon.addEventListener("click", () =>  {
                    workIdToDelete = work.id;
                    figureToDelete = figure;
                    openConfirmationModal();
                });

                modalImageContainer.appendChild(figure);
            });
        } catch (error) {
            console.error('Error fetching works:', error);
        }
    }

    // Gestion de la modale de confirmation
    const confirmationModal = document.getElementById("confirmationModal");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");

    const openConfirmationModal = () => {
        confirmationModal.classList.add("show");
    }

    const closeConfirmationModal = () => {
        confirmationModal.classList.remove("show");
    }

    confirmYes.addEventListener("click", () => {
        const token = window.localStorage.getItem("token");
        fetch(`http://localhost:5678/api/works/${workIdToDelete}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('La suppression a échoué.');
            }
            // Supprime l'image dans la galerie seulement si la suppression côté serveur est réussie
            figureToDelete.remove();
            closeConfirmationModal();
            closeModal(new Event('close')); // Ferme la modale principale
            console.log('Suppression réussie.');
        })
        .catch(error => {
            console.error('Erreur lors de la suppression', error);
        });
    });

    confirmNo.addEventListener("click", closeConfirmationModal);

    // Gestion des vues modales
    const openAddPhotoView = () => {
        const galleryView = document.querySelector('.modal-gallery');
        const addPhotoView = document.querySelector('.modal-add-work');
        galleryView.style.display = 'none';
        addPhotoView.style.display = 'block';
    }

    const openGalleryView = () => {
        const galleryView = document.querySelector('.modal-gallery');
        const addPhotoView = document.querySelector('.modal-add-work');
        galleryView.style.display = 'block';
        addPhotoView.style.display = 'none';
    }

    const addPhotoButton = document.querySelector('.modal-gallery input[type="submit"]');
    addPhotoButton.addEventListener('click', openAddPhotoView);

    const backButton = document.querySelector('.modal-add-work .js-modal-back');
    if (backButton) {
        backButton.addEventListener('click', openGalleryView);
    }

    const closeButton = document.querySelector('.modal-add-work .js-modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
});


// Ajout nouveau projet 

// Gestion de l'envoi d'un nouveau projet
const submitNewProject = async (formData) => {
    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: 'POST',
            headers: {
				'Authorization': 'Bearer ' + localStorage.getItem('token'),
			},
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Échec de l\'envoi du nouveau projet.');
        }
        const result = await response.json();
        console.log('Nouveau projet ajouté avec succès:', result);
        // Ajouter ici toute logique supplémentaire après l'envoi réussi du projet
    } catch (error) {
        console.error('Erreur lors de l\'envoi du nouveau projet:', error);
    }
};


// Ajout nouvelle photo 

const imageInput = document.getElementById('form-image');
const modalAddPhoto = document.getElementById('modal-add-photo');

imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    // Vérifie si un fichier a été sélectionné
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            // Crée un élément img pour afficher l'aperçu de l'image
            const imgPreview = document.createElement('img');
            imgPreview.src = e.target.result;
            imgPreview.classList.add('preview-image');
            
            // Supprime le contenu actuel de modal-add-photo
            modalAddPhoto.innerHTML = '';
            
            // Ajoute l'aperçu de l'image à l'intérieur de la div modal-add-photo
            modalAddPhoto.appendChild(imgPreview);
        };

        // Lit le fichier en tant que URL de données
        reader.readAsDataURL(file);
    }
});




// Gestionnaire d'événements pour le bouton "Ajouter photo"
// const addPhotoButton = document.querySelector('.modal-add-work input[type="submit"]');
// addPhotoButton.addEventListener('click', async () => {
//     // Récupérer les données du formulaire
//     const title = document.getElementById('form-title').value;
//     const category = document.getElementById('category-input').value;
//     const imageFile = document.getElementById('form-image').files[0];

//     // Créer un objet FormData et y ajouter les données du formulaire
//     const formData = new FormData();
//     formData.append('title', title);
//     formData.append('category', category);
//     formData.append('image', imageFile);

//     // Envoyer les données au backend
//     await submitNewProject(formData);
// });
