const $ = (x, all, elm = document) => all ? elm.querySelectorAll(x) : elm.querySelector(x);

const firebaseConfig = {
    apiKey: "AIzaSyBlTQOPpgPgVHoq9b-DbPDZ2p2ug7n__dY",
    authDomain: "rythornfit.firebaseapp.com",
    projectId: "rythornfit",
    storageBucket: "rythornfit.appspot.com",
    messagingSenderId: "918946254332",
    appId: "1:918946254332:web:16b523675b273c22e13679"
};

const app = firebase.initializeApp(firebaseConfig);

const FIREBASE = {
    db: firebase.firestore(),
    provider: new firebase.auth.GoogleAuthProvider(),
    authenticate: async _ => {
        return new Promise((resolve, reject) => {
            firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(result => {
                this.user = result.user;
                resolve(result);
            }).catch(error => {
                reject(error);
            })
        })
    },
    signOut: async _ => {
        firebase.auth().signOut(this.auth).then(_ => {
            this.user = null;
            resolve();
        }).catch(error => {
            reject(error);
        })
    }
}