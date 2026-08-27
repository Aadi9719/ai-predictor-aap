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

    // Maximum history
    if (allResults.length > 1000) {
        allResults.pop();
    }

    saveMemory(
        "allResults",
        allResults
    );

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
