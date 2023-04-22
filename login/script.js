$('#sign-in-button').onclick = e => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
    provider.addScope('https://www.googleapis.com/auth/user.gender.read');
    FIREBASE.authenticate().then(result => {
        console.log(result);
        $('.error-message').textContent = '';

        FIREBASE.db.collection("user-data").doc(result.user.uid).get().then(async doc => {
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

const validateData = _ => {
    if ($('input[name=height-input]').value * 1 < $('input[name=height-input]').min * 1 || $('input[name=height-input]').value * 1 > $('input[name=height-input]').max * 1)
        return 'Invalid height!';
    if ($('input[name=weight-input]').value * 1 < $('input[name=weight-input]').min * 1 || $('input[name=weight-input]').value * 1 > $('input[name=weight-input]').max * 1)
        return 'Invalid weight!';
    if ($('input[name=age-input]').value * 1 < $('input[name=age-input]').min * 1 || $('input[name=age-input]').value * 1 > $('input[name=age-input]').max * 1)
        return 'Invalid age!';
    return true;
}

const syncData = _ => {
    $('.error-message', false, $('#about')).textContent = '';
    FIREBASE.db.collection('user-data').doc(FIREBASE.user.uid).set({
        height: $('[name=height-input]').value * 1,
        weight: $('[name=weight-input]').value * 1,
        age: $('[name=age-input]').value * 1,
        gender: $('[name=gender-input]').value,
    }).then(data => {
        window.location.href = window.location.origin;
    }).catch(error => {
        $('.error-message', false, $('#about')).textContent = `Error (${error.code}): ${error.message}`;
    })
}