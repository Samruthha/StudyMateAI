// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase configuration (use the same as your main.js and profile.html)
const firebaseConfig = {
    apiKey: "AIzaSyAgi3e7EH5FRi5GIdrr9bUh5hGlFXIRVR4",
    authDomain: "studymateai-d5bd3.firebaseapp.com",
    projectId: "studymateai-d5bd3",
    storageBucket: "studymateai-d5bd3.firebasestorage.app",
    messagingSenderId: "445694491620",
    appId: "1:445694491620:web:8c3cd07afe00fe981d65f1",
    measurementId: "G-R2E19SZT2Y"
};

console.log("Registration Script: Firebase config loaded:", firebaseConfig.projectId);

// Initialize Firebase
let app;
let auth;
let db;
let currentUser = null; // To store the authenticated user object

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Registration Script: Firebase app and auth initialized.");
} catch (initError) {
    console.error("Registration Script: Error initializing Firebase app:", initError);
    showMessage("Failed to initialize Firebase. Please try again later.", true);
}

// Get references to HTML elements
const form = document.querySelector("form");
const messageBox = document.getElementById('message-box');

// Function to display messages
function showMessage(message, isError = false) {
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.style.color = isError ? 'red' : 'green';
        messageBox.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
        messageBox.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb';
        messageBox.style.padding = '10px';
        messageBox.style.marginBottom = '15px';
        messageBox.style.borderRadius = '5px';
        messageBox.style.display = 'block';

        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    } else {
        console.warn('Message box element not found. Message:', message);
    }
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Registration Script: User is logged in:", currentUser.uid, currentUser.email);
    } else {
        console.log("Registration Script: No user logged in. Redirecting to login page.");
        showMessage("You need to be logged in to register your profile.", true);
        setTimeout(() => {
            window.location.href = "/index.html"; // Root-relative path to your main login page
        }, 2000);
    }
});

// Handle the form submission (now a single step)
// Wrap the form event listener in DOMContentLoaded to ensure all HTML elements are loaded
document.addEventListener('DOMContentLoaded', () => {
    if (form) { // Ensure the form element is found before attaching listener
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            if (!currentUser) {
                showMessage("You must be logged in to save your profile.", true);
                setTimeout(() => {
                    window.location.href = "/index.html";
                }, 1500);
                return;
            }

            // Collect all data from the single form, using optional chaining for robustness
            const profileData = {
                // Personal Details
                fullName: document.getElementById('fullName')?.value.trim() || '',
                dateOfBirth: document.getElementById('dob')?.value || '',
                email: document.getElementById('email')?.value.trim() || '',
                mobileNumber: document.getElementById('mobileNumber')?.value.trim() || '',
                gender: document.getElementById('gender')?.value || '',
                occupation: document.getElementById('occupation')?.value.trim() || '',

                // Account Type (from radio buttons)
                accountType: document.querySelector('input[name="accountType"]:checked')?.value || '',

                // Institution/Grade/Location/Timing/Duration
                institutionName: document.getElementById('institutionName')?.value.trim() || '',
                grade: document.getElementById('grade')?.value.trim() || '',
                location: document.getElementById('location')?.value.trim() || '',
                timing: document.getElementById('timing')?.value || '',
                duration: document.getElementById('duration')?.value || '',

                // Address Details
                addressType: document.getElementById('addressType')?.value.trim() || '',
                nationality: document.getElementById('nationality')?.value.trim() || '',
                state: document.getElementById('state')?.value.trim() || '',
                district: document.getElementById('district')?.value.trim() || '',
                blockNumber: document.getElementById('blockNumber')?.value.trim() || '',
                wardNumber: document.getElementById('wardNumber')?.value.trim() || '',

                // Family Details
                fatherName: document.getElementById('fatherName')?.value.trim() || '',
                motherName: document.getElementById('motherName')?.value.trim() || '',
                grandfatherName: document.getElementById('grandfatherName')?.value.trim() || '',
                spouseName: document.getElementById('spouseName')?.value.trim() || '',
                fatherInLawName: document.getElementById('fatherInLawName')?.value.trim() || '',
                motherInLawName: document.getElementById('motherInLawName')?.value.trim() || '',

                lastUpdated: new Date().toISOString() // Timestamp of last update
            };

            // Basic validation for all fields
            const requiredFields = [
                profileData.fullName, profileData.dateOfBirth, profileData.email, profileData.mobileNumber,
                profileData.gender, profileData.occupation, profileData.accountType, profileData.institutionName,
                profileData.grade, profileData.location, profileData.timing, profileData.duration,
                profileData.addressType, profileData.nationality, profileData.state, profileData.district,
                profileData.blockNumber, profileData.wardNumber, profileData.fatherName, profileData.motherName,
                profileData.grandfatherName, profileData.spouseName, profileData.fatherInLawName, profileData.motherInLawName
            ];

            if (requiredFields.some(field => !field)) { // Checks if any required field is empty
                showMessage("Please fill in all required fields.", true);
                return;
            }

            // Basic email validation
            if (!/\S+@\S+\.\S+/.test(profileData.email)) {
                showMessage("Please enter a valid email address.", true);
                return;
            }

            try {
                // Save the complete profile data to Firestore
                const userDocRef = doc(db, `artifacts/${firebaseConfig.projectId}/users/${currentUser.uid}/profile/main`);
                await setDoc(userDocRef, profileData, { merge: true });

                showMessage("Profile saved successfully! Redirecting...", false);
                console.log("Complete profile saved:", profileData);

                // Store the profile data in sessionStorage to pass to the next page
                sessionStorage.setItem('userProfileData', JSON.stringify(profileData));

                // Redirect to the profile details display page
                setTimeout(() => {
                    window.location.href = "/webpages/profile.html";
                }, 1500);

            } catch (error) {
                console.error("Error saving profile:", error);
                showMessage(`Error saving profile: ${error.message}. Please try again.`, true);
            }
        });
    } else {
        console.error("Form element not found. Check your HTML for <form> tag with id='registration-form'.");
    }
});
