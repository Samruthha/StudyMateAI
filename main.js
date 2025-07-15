// Corrected Firebase SDK imports from CDN URLs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// Add Firestore imports as you'll need them later for user roles
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAgi3e7EH5FRi5GIdrr9bUh5hGlFXIRVR4",
  authDomain: "studymateai-d5bd3.firebaseapp.com",
  projectId: "studymateai-d5bd3",
  storageBucket: "studymateai-d5bd3.firebasestorage.app",
  messagingSenderId: "445694491620",
  appId: "1:445694491620:web:8c3cd07afe00fe981d65f1",
  measurementId: "G-R2E19SZT2Y"
};

console.log("Firebase config loaded:", firebaseConfig.projectId); // Log config

// Initialize Firebase
let app;
let auth;
let db; // Declare db here
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app); // Initialize Firestore
    console.log("Firebase app and auth initialized successfully.");
} catch (initError) {
    console.error("Error initializing Firebase app:", initError);
    // You might want to display this error to the user as well
}


auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

const googleLoginBtn = document.getElementById("google-login-btn");

// Function to display messages (you'll need a div in your HTML for this, e.g., <div id="message-box"></div>)
function showMessage(message, isError = false) {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.style.color = isError ? 'red' : 'green';
        messageBox.style.backgroundColor = isError ? '#f8d7da' : '#d4edda'; // Light red/green background
        messageBox.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb'; // Darker red/green border
        messageBox.style.padding = '10px';
        messageBox.style.marginBottom = '15px';
        messageBox.style.borderRadius = '5px';

        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    } else {
        console.warn('Message box element not found. Message:', message);
    }
}


if (googleLoginBtn) {
    console.log("Google login button found.");
    googleLoginBtn.addEventListener("click", function() {
        console.log("Google login button clicked. Attempting signInWithPopup...");
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("signInWithPopup successful:", result.user);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const user = result.user;

                // --- Start of User Role Logic (from previous discussions) ---
                // This part will need to be fully implemented to save role to Firestore
                // For now, it just logs and redirects.
                const userUid = user.uid;
                const userEmail = user.email;

                // Placeholder for checking/setting user role in Firestore
                // In a real app, you'd fetch the user's profile from Firestore here
                // If it doesn't exist, prompt for role selection and save to Firestore
                // For this example, we'll just log and redirect.
                console.log(`User UID: ${userUid}, Email: ${userEmail}`);

                // Example of how you might save initial user data (if not already done)
                // This would typically be done in a separate function after role selection
                const userDocRef = doc(db, `artifacts/${firebaseConfig.projectId}/users/${userUid}/profile/main`);
                setDoc(userDocRef, {
                    uid: userUid,
                    email: userEmail,
                    // accountType: 'not_set_yet', // You'd set this after user chooses
                    createdAt: new Date().toISOString()
                }, { merge: true }).then(() => {
                    console.log("Basic user data saved/updated in Firestore.");
                }).catch((firestoreError) => {
                    console.error("Error saving basic user data to Firestore:", firestoreError);
                });
                // --- End of User Role Logic Placeholder ---

                showMessage("Successfully signed in with Google!", false);
                window.location.href = "../webpages/home.html"; // Redirect to home.html
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                console.error("Google Sign-In Error:", errorCode, errorMessage);
                showMessage(`Error: ${errorMessage}. Please try again.`, true);

                // Specific error handling for common issues:
                if (errorCode === 'auth/popup-closed-by-user') {
                    showMessage('Sign-in popup was closed. Please try again.', true);
                } else if (errorCode === 'auth/cancelled-popup-request') {
                    showMessage('Sign-in popup was already open or another request was pending. Please try again.', true);
                } else if (errorCode === 'auth/unauthorized-domain') {
                    showMessage('Error: Unauthorized domain. Please check Firebase Console settings.', true);
                }
            });
    });
} else {
    console.error("Google login button with ID 'google-login-btn' not found in the DOM.");
}