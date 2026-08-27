// ========================================
// STATS.JS
// AI STATISTICS + HISTORY DISPLAY
// ========================================

function updateStats() {

    // ------------------------------------
    // Total Patterns
    // ------------------------------------

    const totalPatternsElement =
        document.getElementById("totalPatterns");

    if (totalPatternsElement) {

        const totalPatterns =
            (typeof patternMemory === "object" &&
             patternMemory !== null)
                ? Object.keys(patternMemory).length
                : 0;

        totalPatternsElement.innerText =
            totalPatterns;
    }


    // ------------------------------------
    // AI Wins
    // ------------------------------------

    const winsElement =
        document.getElementById("wins");

    if (winsElement) {

        winsElement.innerText =
            Number(aiWins) || 0;
    }


    // ------------------------------------
    // AI Losses
    // ------------------------------------

    const lossesElement =
        document.getElementById("losses");

    if (lossesElement) {

        lossesElement.innerText =
            Number(aiLosses) || 0;
    }


    // ------------------------------------
    // Accuracy
    // ------------------------------------

    const accuracyElement =
        document.getElementById("accuracy");

    if (accuracyElement) {

        const wins =
            Number(aiWins) || 0;

        const losses =
            Number(aiLosses) || 0;

        const total =
            wins + losses;

        let accuracy = 0;

        if (total > 0) {

            accuracy =
                Math.round(
                    (wins / total) * 100
                );

        }

        accuracy =
            Math.max(
                0,
                Math.min(
                    100,
                    accuracy
                )
            );

        accuracyElement.innerText =
            accuracy + "%";
    }

}


// ========================================
// ADD AI HISTORY ITEM
// ========================================

function addHistory(text) {

    const historyList =
        document.getElementById("historyList");

    if (!historyList) {
        return;
    }


    const item =
        document.createElement("p");


    // History text ko safely add karo
    item.textContent =
        String(text);


    historyList.prepend(item);

}


// ========================================
// UPDATE STATS SAFELY
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        try {

            updateStats();

        } catch (error) {

            console.error(
                "Stats initialization error:",
                error
            );

        }

    }
);
