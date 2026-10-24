alert("Memory Loaded");

// ========================================
// MEMORY.JS
// AI MEMORY / HISTORY STORAGE
// ========================================

// ----------------------------------------
// Safe JSON loader
// ----------------------------------------

function loadJSON(key, fallback) {

    try {

        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        const parsed = JSON.parse(value);

        return parsed;

    } catch (error) {

        console.error(
            "Memory load error:",
            key,
            error
        );

        return fallback;
    }
}


// ----------------------------------------
// Main AI data
// ----------------------------------------

let allResults =
    loadJSON("allResults", []);

if (!Array.isArray(allResults)) {
    allResults = [];
}


// ----------------------------------------
// AI win/loss counters
// ----------------------------------------

let aiWins =
    Number(localStorage.getItem("aiWins")) || 0;

let aiLosses =
    Number(localStorage.getItem("aiLosses")) || 0;


// ----------------------------------------
// Prediction history
// ----------------------------------------

let predictionHistory =
    loadJSON("predictionHistory", []);

if (!Array.isArray(predictionHistory)) {
    predictionHistory = [];
}


// ----------------------------------------
// Pattern memory
// ----------------------------------------

let patternMemory =
    loadJSON("patternMemory", {});

if (
    patternMemory === null ||
    typeof patternMemory !== "object" ||
    Array.isArray(patternMemory)
) {
    patternMemory = {};
}


// ----------------------------------------
// BIG / SMALL MEMORY
// IMPORTANT: always initialize it
// ----------------------------------------

let bigSmallMemory =
    loadJSON("bigSmallMemory", {});

if (
    bigSmallMemory === null ||
    typeof bigSmallMemory !== "object" ||
    Array.isArray(bigSmallMemory)
) {
    bigSmallMemory = {};
}


// ----------------------------------------
// COLOR MEMORY
// ----------------------------------------

let colorMemory =
    loadJSON("colorMemory", {});

if (
    colorMemory === null ||
    typeof colorMemory !== "object" ||
    Array.isArray(colorMemory)
) {
    colorMemory = {};
}


// ----------------------------------------
// Current prediction
// ----------------------------------------

let nextPrediction = null;


// ----------------------------------------
// Save helper
// ----------------------------------------

function saveMemory(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            "Memory save error:",
            key,
            error
        );

        return false;
    }
}


// ========================================
// SAVE ALL MAIN MEMORY
// ========================================

function saveAllMemory() {

    saveMemory(
        "allResults",
        allResults
    );

    saveMemory(
        "patternMemory",
        patternMemory
    );

    saveMemory(
        "bigSmallMemory",
        bigSmallMemory
    );

    saveMemory(
        "colorMemory",
        colorMemory
    );

    saveMemory(
        "predictionHistory",
        predictionHistory
    );

    localStorage.setItem(
        "aiWins",
        String(aiWins)
    );

    localStorage.setItem(
        "aiLosses",
        String(aiLosses)
    );
}


// ========================================
// ADD ACTUAL RESULT
// ========================================

function saveActualResult(actualResult) {

    actualResult = Number(actualResult);

    if (
        !Number.isInteger(actualResult) ||
        actualResult < 0 ||
        actualResult > 9
    ) {

        console.warn(
            "Invalid actual result:",
            actualResult
        );

        return false;
    }

    allResults.unshift(actualResult);

if (allResults.length > 20000) {
    allResults.pop();
}

    saveMemory(
        "allResults",
        allResults
    );

    updateAIMemoryStats();
    
    return true;
}


// ========================================
// LEARNING AGE
// ========================================

function updateLearningAge() {

    for (
        const pattern in patternMemory
    ) {

        const memory =
            patternMemory[pattern];

        if (
            !memory ||
            typeof memory !== "object"
        ) {
            continue;
        }

        memory.learningAge =
            Number(memory.learningAge) || 0;

        memory.learningAge++;

        if (
            memory.learningAge > 100
        ) {

            memory.learningAge = 100;
        }
    }

    saveMemory(
        "patternMemory",
        patternMemory
    );

    updateAIMemoryStats();
    
}

// PATTERN LEARNING MEMORY

function updateLearningMemory(actualResult) {
    actualResult = Number(actualResult);

    if (
        !Number.isInteger(actualResult) ||
        actualResult < 1 ||
        actualResult > 9
    ) {
        console.warn("Invalid pattern result:", actualResult);
        return false;
    }

    if (!Array.isArray(allResults) || allResults.length < 5) {
        console.warn("Not enough history to learn pattern.");
        return false;
    }

    // Last 5 results se pattern banao
    const input = allResults.slice(0, 5).map(Number);

    if (
        input.length !== 5 ||
        input.some(n => !Number.isInteger(n) || n < 1 || n > 9)
    ) {
        console.warn("Invalid pattern input:", input);
        return false;
    }

    const pattern = input.join("-");

    if (
        !patternMemory[pattern] ||
        typeof patternMemory[pattern] !== "object"
    ) {
        patternMemory[pattern] = {
            nextNumbers: {},
            total: 0,
            wins: 0,
            losses: 0,
            reward: 0,
            penalty: 0,
            trust: 50,
            patternWeight: 50,
            learningAge: 0
        };
    }

    const memory = patternMemory[pattern];

    if (
        !memory.nextNumbers ||
        typeof memory.nextNumbers !== "object"
    ) {
        memory.nextNumbers = {};
    }

    memory.nextNumbers[actualResult] =
        (Number(memory.nextNumbers[actualResult]) || 0) + 1;

    memory.total = (Number(memory.total) || 0) + 1;

    saveMemory("patternMemory", patternMemory);

    if (typeof updateAIMemoryStats === "function") {
        updateAIMemoryStats();
    }

    console.log("Pattern learned:", pattern, "→", actualResult);

    return true;
}

// BIG / SMALL LEARNING MEMORY
function updateBigSmallMemory(actualResult) {
    actualResult = Number(actualResult);

    if (
        !Number.isInteger(actualResult) ||
        actualResult < 1 ||
        actualResult > 9
    ) {
        console.warn("Invalid Big/Small result:", actualResult);
        return false;
    }

    const category = actualResult >= 5 ? "Big" : "Small";

    if (
        !bigSmallMemory ||
        typeof bigSmallMemory !== "object" ||
        Array.isArray(bigSmallMemory)
    ) {
        bigSmallMemory = {};
    }

    if (!bigSmallMemory[category]) {
        bigSmallMemory[category] = {
            count: 0,
            numbers: {}
        };
    }

    const memory = bigSmallMemory[category];

    memory.count = (Number(memory.count) || 0) + 1;

    if (!memory.numbers || typeof memory.numbers !== "object") {
        memory.numbers = {};
    }

    memory.numbers[actualResult] =
        (Number(memory.numbers[actualResult]) || 0) + 1;

    saveMemory("bigSmallMemory", bigSmallMemory);

    if (typeof updateAIMemoryStats === "function") {
        updateAIMemoryStats();
    }

    console.log("Big/Small learned:", category, actualResult);

    return true;
}

// COLOR LEARNING MEMORY
function updateColorMemory(actualResult) {
    actualResult = Number(actualResult);

    if (
        !Number.isInteger(actualResult) ||
        actualResult < 1 ||
        actualResult > 9
    ) {
        console.warn("Invalid color result:", actualResult);
        return false;
    }

    const color = [1, 3, 7, 9].includes(actualResult)
        ? "Green"
        : [2, 4, 6, 8].includes(actualResult)
        ? "Red"
        : "Violet";

    if (
        !colorMemory ||
        typeof colorMemory !== "object" ||
        Array.isArray(colorMemory)
    ) {
        colorMemory = {};
    }

    if (!colorMemory[color]) {
        colorMemory[color] = {
            count: 0,
            numbers: {}
        };
    }

    const memory = colorMemory[color];

    memory.count = (Number(memory.count) || 0) + 1;

    if (!memory.numbers || typeof memory.numbers !== "object") {
        memory.numbers = {};
    }

    memory.numbers[actualResult] =
        (Number(memory.numbers[actualResult]) || 0) + 1;

    saveMemory("colorMemory", colorMemory);

    if (typeof updateAIMemoryStats === "function") {
        updateAIMemoryStats();
    }

    console.log("Color learned:", color, actualResult);

    return true;
}

// SELF LEARNING
function selfLearning(pattern, isWin) {
    if (
        !pattern ||
        !patternMemory[pattern] ||
        typeof patternMemory[pattern] !== "object"
    ) {
        console.warn("Pattern not found for self-learning:", pattern);
        return false;
    }

    const memory = patternMemory[pattern];

    if (isWin) {
        memory.wins = (Number(memory.wins) || 0) + 1;
    } else {
        memory.losses = (Number(memory.losses) || 0) + 1;
    }

    const wins = Number(memory.wins) || 0;
    const losses = Number(memory.losses) || 0;
    const total = wins + losses;

    memory.winRate = total > 0
        ? Number(((wins / total) * 100).toFixed(2))
        : 0;

    saveMemory("patternMemory", patternMemory);

    if (typeof updateAIMemoryStats === "function") {
        updateAIMemoryStats();
    }

    console.log("Self-learning updated:", pattern, isWin);

    return true;
}

// ========================================
// REWARD / PENALTY
// ========================================

function updateRewardPenalty(
    pattern,
    isWin
) {

    if (
        !pattern ||
        !patternMemory[pattern]
    ) {
        return;
    }

    const memory =
        patternMemory[pattern];

    memory.reward =
        Number(memory.reward) || 0;

    memory.penalty =
        Number(memory.penalty) || 0;

    memory.trust =
        Number(memory.trust);

    if (
        !Number.isFinite(memory.trust)
    ) {
        memory.trust = 50;
    }

    memory.patternWeight =
        Number(memory.patternWeight);

    if (
        !Number.isFinite(memory.patternWeight)
    ) {
        memory.patternWeight = 50;
    }


    if (isWin) {

        memory.reward++;

        memory.trust += 1;

        memory.patternWeight += 1;

    } else {

        memory.penalty++;

        memory.trust -= 1;

        memory.patternWeight -= 1;
    }


    // Safe limits

    memory.trust =
        Math.max(
            0,
            Math.min(
                100,
                memory.trust
            )
        );

    memory.patternWeight =
        Math.max(
            0,
            Math.min(
                100,
                memory.patternWeight
            )
        );


    saveMemory(
        "patternMemory",
        patternMemory
    );
}


// ========================================
// PREDICTION HISTORY
// ========================================

function savePredictionHistory(
    prediction,
    actualResult
) {

    actualResult =
        Number(actualResult);

    const status =
        Number(prediction) === actualResult
            ? "WIN"
            : "LOSS";

    predictionHistory.unshift({

        time:
            new Date()
                .toLocaleTimeString(),

        prediction:
            prediction,

        result:
            actualResult,

        status:
            status
    });


    if (
        predictionHistory.length > 100
    ) {

        predictionHistory.pop();
    }


    saveMemory(
        "predictionHistory",
        predictionHistory
    );
}


// ========================================
// RESET MEMORY
// ========================================

function resetAIMemory() {

    localStorage.removeItem(
        "patternMemory"
    );

    localStorage.removeItem(
        "allResults"
    );

    localStorage.removeItem(
        "predictionHistory"
    );

    localStorage.removeItem(
        "bigSmallMemory"
    );

    localStorage.removeItem(
        "colorMemory"
    );

    localStorage.removeItem(
        "aiWins"
    );

    localStorage.removeItem(
        "aiLosses"
    );


    patternMemory = {};

    allResults = [];

    predictionHistory = [];

    bigSmallMemory = {};

    colorMemory = {};

    aiWins = 0;

    aiLosses = 0;

    nextPrediction = null;
}


// ========================================
// PHONE / Acode MEMORY TEST
// ========================================

function testMemoryStoragePhone() {

    const patternCount =
        Object.keys(
            patternMemory
        ).length;

    alert(

        "MEMORY TEST\n\n" +

        "Saved Results = " +
        allResults.length +

        "\n\nPatterns = " +
        patternCount +

        "\n\nBig/Small Memory = " +
        Object.keys(
            bigSmallMemory
        ).length +

        "\n\nColor Memory = " +
        Object.keys(
            colorMemory
        ).length +

        "\n\nPrediction History = " +
        predictionHistory.length +

        "\n\nAI Wins = " +
        aiWins +

        "\n\nAI Losses = " +
        aiLosses +

        "\n\nMEMORY CONNECTED ✅"
    );
}


// ========================================
// MEMORY RESET BUTTON
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const resetButton =
            document.getElementById(
                "resetMemoryBtn"
            );

        if (!resetButton) {
            return;
        }

        resetButton.onclick =
            function () {

                if (
                    !confirm(
                        "Kya aap AI Memory Reset karna chahte hain?"
                    )
                ) {
                    return;
                }

                resetAIMemory();

                alert(
                    "AI Memory Successfully Reset ✅"
                );

                location.reload();
            };
    }
);

function updateAIMemoryStats() {
    const resultsElement = document.getElementById("savedResultsCount");
    const patternsElement = document.getElementById("savedPatternsCount");

    const totalResults = Array.isArray(allResults)
        ? allResults.length
        : 0;

    function countPatterns(obj) {
        if (!obj || typeof obj !== "object") {
            return 0;
        }

        let count = 0;

        for (const key of Object.keys(obj)) {
            count++;

            if (obj[key] && typeof obj[key] === "object") {
                count += countPatterns(obj[key]);
            }
        }

        return count;
    }

    const totalPatterns = countPatterns(patternMemory);

    if (resultsElement) {
        resultsElement.textContent = totalResults;
    }

    if (patternsElement) {
        patternsElement.textContent = totalPatterns;
    }
}
