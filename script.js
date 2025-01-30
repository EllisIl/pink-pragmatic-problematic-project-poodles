const stringElement = document.getElementById("stringCount");
const stringStockElement = document.getElementById("stringMaterials");
const moneyElement = document.getElementById("moneyCount");
const alertElement = document.getElementById("alerts");
const upgradeListElement = document.getElementById("upgradeList");
let upgrades = [];

let moneyCount = 0;
let stringCount = 0;
let stringAmount = 1;
let stringMaterials = 100;
let sellAmount = 2;
let currentUpgrade = 0;
let upgradesAvailable = false;

init();

async function init() {
    const upgradesList = await fetch('./upgrades.json').then(response => response.json());
    upgrades = upgradesList.upgrades;
    console.log(upgrades);
}

function addString() {
    if (stringMaterials <= 0) {
        alertElement.innerHTML = "No materials available"
        return;
    }

    stringCount += stringAmount;
    stringMaterials--;

    updateScreen()
}
function sellString() {
    if (stringCount < stringAmount) {
        alertElement.innerHTML = "Not enough string to sell"
        return;
    }
    
    stringCount -= 1;
    moneyCount += sellAmount;

    updateScreen()
}
function updateScreen() {
    alertElement.innerHTML = ""
    stringElement.textContent = stringCount;
    stringStockElement.textContent = stringMaterials;
    moneyElement.textContent = `$${moneyCount}`;

    if (moneyCount > 50 && !upgradesAvailable) {
        toggleUpgrades();
    }

}

function toggleUpgrades() {
    upgradesAvailable = true;
    console.log("Upgrades available!")
    updateUpgrades();
}

function buyUpgrade(change, amount) {
    if (moneyCount < amount) {
        alertElement.innerHTML = "Not enough money to upgrade"
        return;
    }
    
    switch(change) {
        
    }
    updateScreen()
}

function updateUpgrades() {
    upgradeListElement.innerHTML = upgrades.map(upgrade => `<li>${upgrade.cost}: ${upgrade.description}</li>`).join("");
}