// Modale principale
let modal = null; // Stocke la modale principale
let workIdToDelete = null; // Stocke l'Id à supprimer
let figureToDelete = null; // Stocke l'élément figure à supprimer

// Ouvrir la modale principale
const openModal = (e) => {
    e.preventDefault();
    const target = document.getElementById('modal');
    target.style.display = null;
    target.removeAttribute('aria-hidden');
    target.setAttribute('aria-modal', 'true');
    modal = target;
    openGalleryView();
    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
    populateModalWithImages();
}

// Fermer la modale principale
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
    resetModalFields();
}

// Arrêter la propagation de l'événement
const stopPropagation = (e) => {
    e.stopPropagation();
}

// Fermer la modale principale avec la touche Echap
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
});

// Ouvrir la modale principale au clic
document.querySelector('.js-modal').addEventListener('click', openModal);  

// Gestion des vues modales
const openAddPhotoView = () => {
    document.querySelector('.modal-gallery').style.display = 'none';
    document.querySelector('.modal-add-work').style.display = 'block';
}

const openGalleryView = () => {
    document.querySelector('.modal-gallery').style.display = 'block';
    document.querySelector('.modal-add-work').style.display = 'none';
}

document.querySelector('.modal-gallery input[type="submit"]').addEventListener('click', openAddPhotoView);
document.querySelector('.modal-add-work .js-modal-back').addEventListener('click', openGalleryView);
document.querySelector('.modal-add-work .js-modal-close').addEventListener('click', closeModal);

// Peupler la modale avec les images
async function populateModalWithImages() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error('Request failed!');
        
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

const closeConfirmationModal = (e) => {
    e.preventDefault();
    confirmationModal.classList.remove("show");
}

confirmYes.addEventListener("click", async () => {
    const token = window.localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workIdToDelete}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('La suppression a échoué.');
        
        figureToDelete.remove();
        closeConfirmationModal(new Event('close'));
        console.log('Suppression réussie.');
        await refreshGallery();
    } catch (error) {
        console.error('Erreur lors de la suppression', error);
    }
});

confirmNo.addEventListener("click", closeConfirmationModal);

// Rafraîchir la galerie principale
const refreshGallery = async () => {
    gallery.innerHTML = ''; // Vider la galerie existante
    await getWorks(); // Recharger les travaux
}

// Ajout nouvelle photo 
const modalAddPhoto = document.getElementById('modal-add-photo');
const imageInput = document.getElementById('form-image');
const formTitleInput = document.getElementById('form-title');
const formCategorySelect = document.getElementById('category-input');
const validateButton = document.getElementById('valider');
const errorMessage = document.createElement('p');
errorMessage.classList.add('error-message');
modalAddPhoto.appendChild(errorMessage);

const handleImageInputChange = (event) => {
    const file = event.target.files[0];

    if (file) {
        if (file.size > 4 * 1024 * 1024) { // Vérifie si la taille du fichier dépasse 4 Mo
            errorMessage.textContent = 'La taille de l\'image ne doit pas dépasser 4 Mo.';
            errorMessage.style.color = '#f46d63';
            errorMessage.style.fontSize = '12px';
            return;
        } else {
            errorMessage.textContent = '';
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgPreview = document.createElement('img');
            imgPreview.src = e.target.result;
            imgPreview.classList.add('preview-image');
            modalAddPhoto.innerHTML = '';
            modalAddPhoto.appendChild(imgPreview);
        };
        reader.readAsDataURL(file);
    }
};

const handleSubmitNewProject = async (event) => {
    event.preventDefault();
    if (imageInput.files.length === 0 || !formTitleInput.value || !formCategorySelect.value) {
        alert("Veuillez remplir tous les champs avant de valider.");
        return;
    }

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('title', formTitleInput.value);
    formData.append('category', formCategorySelect.value);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            body: formData,
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error('Échec de l\'envoi du nouveau projet.');
        
        const result = await response.json();
        console.log('Nouveau projet ajouté avec succès:', result);

        closeModal(event);
        resetModalFields();
        await refreshGallery();
    } catch (error) {
        console.error('Erreur lors de l\'envoi du nouveau projet:', error);
    }
};

const updateValidateButtonState = () => {
    if (imageInput.files.length > 0 && formTitleInput.value.trim() !== '' && formCategorySelect.value.trim() !== '') {
        validateButton.classList.add('valid');
    } else {
        validateButton.classList.remove('valid');
    }
}

const resetModalFields = () => {
    imageInput.value = '';
    formTitleInput.value = '';
    formCategorySelect.selectedIndex = 0;
    validateButton.classList.remove('valid');

    modalAddPhoto.innerHTML = `
        <i class="fa-regular fa-image"></i>
        <label for="form-image" class="custom-file-upload">
            + Ajouter photo
        </label>
        <input id="form-image" type="file" name="image" accept="image/*, .jpg, .jpeg, .png" required style="display: none;">					
        <p>jpg, png : 4mo max</p>
    `;

    document.getElementById('form-image').addEventListener('change', handleImageInputChange);
};

document.getElementById('form-image').addEventListener('change', handleImageInputChange);
formTitleInput.addEventListener('input', updateValidateButtonState);
formCategorySelect.addEventListener('change', updateValidateButtonState);
document.getElementById('modal-form').addEventListener('submit', handleSubmitNewProject);