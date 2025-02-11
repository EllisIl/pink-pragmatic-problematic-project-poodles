import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyChdSrPjYsP4MSaa_uMFLWrPIwWx1oZPYQ",
    authDomain: "cool-string-game.firebaseapp.com",
    projectId: "cool-string-game",
    storageBucket: "cool-string-game.firebasestorage.app",
    messagingSenderId: "412821795512",
    appId: "1:412821795512:web:69f2b321730e465cf43a4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const stringElement = document.getElementById("stringCount");
const stringStockElement = document.getElementById("stringMaterials");
const moneyElement = document.getElementById("moneyCount");
const alertElement = document.getElementById("alerts");
const upgradeListElement = document.getElementById("upgradeList");

let upgrades = [];
let userId = ""

// Game variables
let money = 0;
let stringCount = 0;
let stringStorage = 1;
let stringMaterials = 100;
let sellAmount = 3;
let autoSellRate = 1;
let autoSellInterval = 1000;
let upgradesAvailable = false;


init();

// Initialize the game and load data
async function init() {
    const upgradesList = await fetch('./upgrades.json').then(response => response.json());
    upgrades = upgradesList.upgrades;
    startAutoSell();
}

async function createAccount() {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Account created:", user.uid);

        // Initialize game data for the new user
        await setDoc(doc(db, "game", user.uid), {
            money: money,
            stringCount: stringCount,
            stringMaterials: stringMaterials
        });

        document.getElementById("registerMessage").textContent = "Account created successfully! You can now log in.";
    } catch (error) {
        console.error("Account creation failed:", error.message);
        document.getElementById("registerMessage").textContent = "Error: " + error.message;
    }
}


async function login() {
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        userId = user.uid;
        console.log("Signed in as:", user.uid);
        await loadGameData(user.uid);
        updateScreen();
    } catch (error) {
        console.error("Login failed:", error.message);
        document.getElementById("errorMessage").textContent = "Login failed: " + error.message;
    }
}

async function logout() {
    try {
        await signOut(auth);
        console.log("User signed out");
        document.getElementById("errorMessage").textContent = "Logged out.";
        userId = "";
    } catch (error) {
        console.error("Logout failed:", error.message);
    }
}


// Save game data to Firestore when button is clicked
async function saveGameData() {
    if (!userId) {
        alertElement.innerHTML = "Please login to save game data";
        return;
    }

    const gameData = {
        money,
        stringCount,
        stringMaterials
    };
    console.log(gameData)
    await setDoc(doc(db, "game", userId), gameData);
    console.log("Game data saved!");
}

// Load game data from Firestore
async function loadGameData() {
    if (!userId) {
        alertElement.innerHTML = "Please login to access game data";
        return;
    }
    const docRef = doc(db, "game", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        money = data.money;
        stringCount = data.stringCount;
        stringMaterials = data.stringMaterials;
        updateScreen();
        console.log("Game data loaded!");
    } else {
        console.log("No saved game data found.");
    }
}


// Manually produce string if materials are available
function addString() {
    if (stringMaterials <= 0) {
        alertElement.innerHTML = "No materials available";
        return;
    }
    stringCount += stringStorage;
    stringMaterials--;
    updateScreen();
}

// Automatically sell strings over time
function autoSellString() {
    if (stringCount >= autoSellRate) {
        stringCount -= autoSellRate;
        money += sellAmount * autoSellRate;
        updateScreen();
    }
}

// Start automatic selling at a fixed interval
function startAutoSell() {
    console.log("Selling")
    setInterval(autoSellString, autoSellInterval);
}

// Update the game display
function updateScreen() {
    alertElement.innerHTML = "";
    stringElement.textContent = stringCount;
    stringStockElement.textContent = stringMaterials;
    moneyElement.textContent = `$${money}`;

    if (money > 100 && !upgradesAvailable) {
        toggleUpgrades();
    }
}

// Purchase additional string materials
function buyMaterials(amount) {
    if (money < amount * 100) {
        alertElement.innerHTML = "Not enough money to buy materials";
        return;
    }
    money -= amount * 100;
    stringMaterials += amount * 100;
    updateScreen();
}

// Enable and display available upgrades
function toggleUpgrades() {
    upgradesAvailable = true;
    updateUpgrades();
}

// Purchase an upgrade and apply effects
function buyUpgrade(id) {
    const upgradeIndex = upgrades.findIndex(upgrade => upgrade.id === id);
    const upgrade = upgrades[upgradeIndex];

    if (money < upgrade.cost) {
        alertElement.innerHTML = "Not enough money to upgrade";
        return;
    }

    money -= upgrade.cost;

    switch (upgrade.effectType) {
        case "string":
            stringStorage *= upgrade.effectAmount;
            break;
        case 2:
            sellAmount *= upgrade.effectAmount;
            break;
        case 3:
            autoSellRate *= 2;
            break;
        default:
            alertElement.innerHTML = "Invalid upgrade ID";
            return;
    }

    upgrades.splice(upgradeIndex, 1);
    updateUpgrades();
    updateScreen();
}

// Update the displayed upgrade list
function updateUpgrades() {
    upgradeListElement.innerHTML = upgrades.map(upgrade => 
        `<li id='upgrade${upgrade.id}'>
            <label for='upgrade${upgrade.name}'></label>
            <button onclick='buyUpgrade(${upgrade.id})'>$${upgrade.cost}</button>
            ${upgrade.description}
        </li>`
    ).join("");
}


window.addString = addString;
window.buyMaterials = buyMaterials;
window.saveGameData = saveGameData;
window.buyUpgrade = buyUpgrade;
window.login = login;
window.createAccount = createAccount;
window.logout = logout;
window.loadGameData =loadGameData;