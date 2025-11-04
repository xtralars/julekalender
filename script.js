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
let correctAnswer = ''; // Initialize the answer
// let userPoints = 3; **remove userpoints**//
let revealAnswerContent = null;
let incorrectGuessCount = 0;

// Function to update the content for the current day
async function updateContentForCurrentDay() {
    // Current time is Tuesday, November 4, 2025 (4th day of the month)
    const currentDate = new Date();
    // Get the current day number (1-31)
    const currentDay = currentDate.getDate();

    // Set the main header for the current day
    document.getElementById("opgHead").textContent = `Luke ${currentDay}`;

    try {
        // Construct the Firebase path: e.g., days/day4
        const dayRef = ref(db, `days/Day${currentDay}`);
        const snapshot = await get(dayRef);
        
        if (snapshot.exists()) {
            const dayData = snapshot.val();
            
            // **1. Set the correct answer and quiz text**
            correctAnswer = dayData.correctAnswer; document.getElementById("opgText").textContent = dayData.quizText || "No quiz text available for today.";
            
            // **2. Set the hint texts** (using correct HTML IDs: hintText1, hintText2)
            document.getElementById("hintText1").textContent = dayData.hints?.hint1 || "No Hint 1 available.";
            document.getElementById("hintText2").textContent = dayData.hints?.hint2 || "No Hint 2 available.";

            // **3. Set the audio source**
            const audioFileRef = dayData.audioFileRef;
            const audioElement = document.getElementById("song");
            
            if (audioFileRef) {
                const fullStorageRef = storageRef(storage, audioFileRef);
                const audioURL = await getDownloadURL(fullStorageRef);
                
                // Set the audio source and tell the element to reload
                audioElement.src = audioURL;
                audioElement.load(); 
            } else {
                console.error("Audio file reference not found for day", currentDay);
            }

            // **4. Handle reveal answer (if it's a video link)**
            revealAnswerContent = dayData.revealAnswer;
            // Note: We don't call revealAnswerToPage() here. It should only be called 
            // after the user has successfully guessed or given up.
            
        } else {
            document.getElementById("opgText").textContent = `No content found for day ${currentDay}.`;
            console.warn(`Snapshot does not exist for day ${currentDay}`);
        }
    } catch (error) {
        console.error("Error fetching daily content:", error);
        document.getElementById("opgText").textContent = "Error loading today's content. Check console for details.";
    }
}

// Ensure you have a 'triggerConfetti' function defined or remove the call
function triggerConfetti() {
    console.log("Confetti triggered!"); // Placeholder for actual confetti logic
    // You could implement a library like 'canvas-confetti' here
}

function checkGuess(event) {
    event.preventDefault();
    const inputGuess = document.querySelector('#guessInput').value.trim().toLowerCase();
    const message = document.querySelector('#message');

    if (!correctAnswer) {
        message.textContent = 'Content is still loading. Please wait.';
        return;
    }

    if (inputGuess === correctAnswer.toLowerCase()) {
        // --- CORRECT GUESS ---
        message.textContent = 'Gratulerer! ' + correctAnswer + ' er riktig.';
        triggerConfetti();
        revealAnswerToPage();
        
        // Reset counter after correct answer
        incorrectGuessCount = 0; 
        
    } else {
        // --- INCORRECT GUESS ---
        message.textContent = inputGuess + ' er feil. Prøv igjen.';
        
        // 1. Increment the counter
        incorrectGuessCount++;

        // 2. Check the counter against the thresholds
        const hintBtn1 = document.getElementById("hintBtn1");
        const hintBtn2 = document.getElementById("hintBtn2");
        
        // Reveal Hint 1 after 5 incorrect guesses
        if (incorrectGuessCount === 5) {
            hintBtn1.classList.remove('hidden');
            message.textContent += ` Hint 1 is now available!`;
        }

        // Reveal Hint 2 after 10 incorrect guesses
        if (incorrectGuessCount === 10) {
            hintBtn2.classList.remove('hidden');
            message.textContent += ` Hint 2 is now available!`;
        }
    }
    document.querySelector('#guessInput').value = '';
}

function revealAnswerToPage() {
    const videoContainer = document.getElementById("revealAnswer");
    if (revealAnswerContent) {
        // This is fine for embedding YouTube/Vimeo links
        videoContainer.innerHTML = `<iframe width="560" height="315" src="${revealAnswerContent}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        videoContainer.classList.remove('hidden'); // Ensure it's visible
    } else {
        videoContainer.classList.add('hidden');
    }
}

// Event listeners for guessing
const guessButton = document.querySelector("#submitGuess");
guessButton.addEventListener("click", checkGuess);

// Call the function to update content for the current day
updateContentForCurrentDay();

// Function to toggle hint visibility 
function toggleHint(hintButtonId, hintTextId) {
    const hintButton = document.getElementById(hintButtonId);
    const hintText = document.getElementById(hintTextId);
    const message = document.getElementById('message');

    // Only proceed if the hint hasn't been revealed yet
    if (hintText.classList.contains('hidden')) {
        // Reveal the hint text
        hintText.classList.remove('hidden');
        
        // Disable the button to prevent multiple reveals
        hintButton.disabled = true;

        // Update the message and button text
        message.textContent = `Hint used! The hint is now visible.`;
        hintButton.textContent = `Hint Used`;
        
    } else {
        // This case should ideally not happen due to button disabling
        message.textContent = "This hint has already been revealed.";
    }
}

// Event Listeners for Hint Buttons (Keep these as they were)
const hintBtn1 = document.getElementById("hintBtn1");
const hintBtn2 = document.getElementById("hintBtn2");

hintBtn1.addEventListener("click", () => {
    toggleHint("hintBtn1", "hintText1");
});

hintBtn2.addEventListener("click", () => {
    toggleHint("hintBtn2", "hintText2");
});
