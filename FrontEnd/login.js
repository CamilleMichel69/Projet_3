// Récupération de l'API pour le login et connexion

const loginForm = document.getElementById('loginForm'); // Déclaration du formulaire de connexion

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const user = {
        email: document.querySelector('#email').value,
        password: document.querySelector('#password').value,
    };
    console.log(user);
    
    const errorMessage = document.getElementById('errorMessage'); // Ajout de l'élément pour afficher le message d'erreur

    fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(user),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('E-mail et/ou mot de passe incorrect(s) !');
        }
        return response.json();
    })
    .then(user => {
        localStorage.setItem('token', user.token);
        location.href = 'index.html';
    })
    .catch(error => {
        console.log(error);
        errorMessage.textContent = error.message; // Affichage du message d'erreur
        document.getElementById('email').classList.add('error-input'); // Ajout de la classe d'erreur au champ email
        document.getElementById('password').classList.add('error-input'); // Ajout de la classe d'erreur au champ password
    });
});


