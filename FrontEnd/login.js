// Récupération de l'API pour le login et connexion

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const user = {
        email: document.querySelector('#email').value,
        password: document.querySelector('#password').value,
    };
    console.log(user);
    
    const errorMessage = document.getElementById('errorMessage');

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
        errorMessage.textContent = error.message;
        document.getElementById('email').classList.add('error-input');
        document.getElementById('password').classList.add('error-input');
    });
});


