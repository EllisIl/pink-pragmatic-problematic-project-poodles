const stringElement = document.getElementById("stringCount");
const stringStockElement = document.getElementById("stringMaterials");
const moneyElement = document.getElementById("moneyCount");
const alertElement = document.getElementById("alerts");
const upgradeListElement = document.getElementById("upgradeList");
let upgrades = [];

// Game variables
let money = 0;
let stringCount = 0;
let stringStorage = 1;
let stringMaterials = 100;
let sellAmount = 3;
let autoSellRate = 1; // Amount of string sold per interval
let autoSellInterval = 1000; // Time in milliseconds (5s)
let upgradesAvailable = false;

init();

// Initialize the game, fetch upgrades, and start auto-selling
async function init() {
    const upgradesList = await fetch('./upgrades.json').then(response => response.json());
    upgrades = upgradesList.upgrades;
    console.log(upgrades);
    startAutoSell(); // Start automatic selling
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

// Start the automatic selling process at a fixed interval
function startAutoSell() {
    setInterval(autoSellString, autoSellInterval);
}

// Update the game display
function updateScreen() {
    alertElement.innerHTML = "";
    stringElement.textContent = stringCount;
    stringStockElement.textContent = stringMaterials;
    moneyElement.textContent = `$${money}`;

    // Enable upgrades if enough money is available
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

// Purchase an upgrade and apply its effects
function buyUpgrade(id) {
    const upgradeIndex = upgrades.findIndex(upgrade => upgrade.id === id);
    const upgrade = upgrades[upgradeIndex];

    if (money < upgrade.cost) {
        alertElement.innerHTML = "Not enough money to upgrade";
        return;
    }

    money -= upgrade.cost;

    // Apply upgrade effects based on type
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

    // Remove purchased upgrade from available list
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