// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBTtT65rG3kj4fkBcqTVeGqQxdwJDmYilE",
    authDomain: "courseapp-ffa5d.firebaseapp.com",
    projectId: "courseapp-ffa5d",
    storageBucket: "courseapp-ffa5d.firebasestorage.app",
    messagingSenderId: "101409565422",
    appId: "1:101409565422:web:28356915274053d82a21ff",
    measurementId: "G-SWCYWD46BS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);