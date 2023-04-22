$('#sign-in-button').onclick = e => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
    provider.addScope('https://www.googleapis.com/auth/user.gender.read');
    FIREBASE.authenticate().then(result => {
        $('.error-message').textContent = '';

        FIREBASE.db.collection("about").doc(result.user.uid).get().then(async doc => {
            if (doc.exists) {
                window.location.href = window.location.origin;
            } else {
                $('#about').scrollIntoView({ behavior: "smooth", inline: 'end' })
            }
        })
    }).catch(error => {
        $('.error-message').textContent = `Error (${error.code}): ${error.message}`
    });
}