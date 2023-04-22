$('#sign-in-button').onclick = e => {
    FIREBASE.authenticate().then(user => {
        $('.error-message').textContent = '';
        window.location.href = window.location.origin;
    }).catch(error => {
        $('.error-message').textContent = `Error (${error.code}): ${error.message}`
    });
}