import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js';
import { getStorage, getDownloadURL, ref as storageRef } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyDQ-BUlI7cl6aBT5VzE1furSpD7VqGs33c",
    authDomain: "musikkjulekalender2.firebaseapp.com",
    databaseURL: "https://musikkjulekalender2-default-rtdb.firebaseio.com",
    projectId: "musikkjulekalender2",
    storageBucket: "musikkjulekalender2.appspot.com",
    messagingSenderId: "1004475736728",
    appId: "1:1004475736728:web:b67098b5e004ce33e7e6ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// Variables
let correctAnswer;
let userPoints = 3;
let revealAnswerContent = null;

// Function to update the content for the current day
async function updateContentForCurrentDay() {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();

    document.getElementById("opgHead").textContent = `Luke ${currentDay}`;

    const dayRef = ref(db, `days/day${currentDay}`);

    try {
        const snapshot = await get(dayRef);
        if (snapshot.exists()) {
            const dayData = snapshot.val();
            document.getElementById("opgText").textContent = dayData.quizText;
            document.getElementById("hintText1").textContent = dayData.hints.hint1;
            document.getElementById("hintText2").innerHTML = dayData.hints.hint2;

            correctAnswer = dayData.correctAnswer;
            revealAnswerContent = dayData.revealAnswer;

            // Get the download URL for the audio file from Firebase Storage
            const audioFileRef = dayData.audioFileRef;
            const audioURL = await getDownloadURL(storageRef(storage, audioFileRef));

            const audioElement = document.getElementById("song");
            audioElement.src = audioURL;

            revealAnswerToPage();
        }
    } catch (error) {
        console.error("Error fetching daily content:", error);
    }
}

// Call the function to update content for the current day
updateContentForCurrentDay();

function checkGuess(event) {
    event.preventDefault();
    const inputGuess = document.querySelector('#guessInput').value.toLowerCase();
    const message = document.querySelector('#message');

    if (inputGuess === correctAnswer.toLowerCase()) {
        message.textContent = 'Gratulerer! ' + correctAnswer + ' er riktig.';
        triggerConfetti();
    } else {
        message.textContent = inputGuess + ' er feil. Prøv igjen.';
    }
    document.querySelector('#guessInput').value = '';
}

function revealAnswerToPage() {
    const videoContainer = document.getElementById("revealAnswer");
    if (revealAnswerContent) {
        videoContainer.innerHTML = `<iframe width="560" height="315" src="${revealAnswerContent}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        videoContainer.style.display = 'block';
    } else {
        videoContainer.style.display = 'none';
    }
}

// Event listeners for guessing
const guessButton = document.querySelector("#submitGuess");
guessButton.addEventListener("click", checkGuess);