// ========================================
// SCRIPT.JS
// MAIN APP FLOW
// ========================================

alert("Script.js Loaded ✅");

// ========================================
// PENDING PREDICTION
// ========================================

let pendingPrediction = null;
let pendingInput = null;


// ========================================
// DOM READY
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const analyzeBtn =
            document.getElementById("analyzeBtn");

alert("Analyze Start");
        
        const checkBtn =
            document.getElementById("checkBtn");


        // --------------------------------
        // Safety check
        // --------------------------------

        if (!analyzeBtn) {

            console.error(
                "Analyze button not found"
            );

        }

        if (!checkBtn) {

            console.error(
                "Check button not found"
            );
        }


        // =================================
        // ANALYZE AI
        // =================================

        if (analyzeBtn) {

            analyzeBtn.onclick =
                function () {

                    console.log(
                        "Analyze AI started"
                    );


                    const input = [

                        Number(
                            document.getElementById("n1").value
                        ),

                        Number(
                            document.getElementById("n2").value
                        ),

                        Number(
                            document.getElementById("n3").value
                        ),

                        Number(
                            document.getElementById("n4").value
                        ),

                        Number(
                            document.getElementById("n5").value
                        )

                    ];


                    // -----------------------------
                    // Validate
                    // -----------------------------

                    if (
                        input.some(
                            n =>
                                !Number.isInteger(n) ||
                                n < 0 ||
                                n > 9
                        )
                    ) {

                        alert(
                            "Please enter all 5 numbers between 0 and 9."
                        );

                        return;
                    }


                    // -----------------------------
                    // Save exact prediction input
                    // -----------------------------

                    pendingInput =
                        [...input];


                    // -----------------------------
                    // Get prediction
                    // -----------------------------

                    let prediction = null;


                    if (
                        typeof getFinalPrediction ===
                        "function"
                    ) {

                        try {

                            prediction =
                                getFinalPrediction();

                        } catch (error) {

                            console.error(
                                "Prediction error:",
                                error
                            );

                            alert(
                                "AI Prediction Error:\n" +
                                error.message
                            );

                            pendingPrediction = null;

                            return;
                        }

                    } else {

                        alert(
                            "getFinalPrediction() missing hai."
                        );

                        pendingPrediction = null;

                        return;
                    }


                    // -----------------------------
                    // Validate prediction
                    // -----------------------------

                    if (
                        prediction === null ||
                        prediction === undefined ||
                        !Number.isInteger(
                            Number(prediction)
                        )
                    ) {

                        alert(
                            "AI Prediction available nahi hai."
                        );

                        pendingPrediction = null;

                        return;
                    }


                    pendingPrediction =
                        Number(prediction);


                    // Existing global variable
                    nextPrediction =
                        pendingPrediction;


                    // =================================
                    // AI SCORES
                    // =================================

                    let confidence = 0;
                    let trendScore = 0;
                    let aiScore = 0;


                    if (
                        typeof getPredictionConfidence ===
                        "function"
                    ) {

                        try {

                            confidence =
                                Number(
                                    getPredictionConfidence()
                                ) || 0;

                        } catch (error) {

                            console.error(
                                "Confidence error:",
                                error
                            );

                        }

                    }


                    if (
                        typeof getTrendScore ===
                        "function"
                    ) {

                        trendScore =
                            Number(
                                getTrendScore()
                            ) || 0;
                    }


                    if (
                        typeof getFinalAIScore ===
                        "function"
                    ) {

                        try {

                            aiScore =
                                Number(
                                    getFinalAIScore()
                                ) || 0;

                        } catch (error) {

                            console.error(
                                "AI score error:",
                                error
                            );

                        }

                    }


                    const pattern =
                        pendingInput.join(",");


                    let hotCold = {

                        hot: null,
                        cold: null

                    };


                    if (
                        typeof getHotColdNumbers ===
                        "function"
                    ) {

                        try {

                            hotCold =
                                getHotColdNumbers();

                        } catch (error) {

                            console.error(
                                "Hot/cold error:",
                                error
                            );

                        }

                    }


                    // =================================
                    // DISPLAY
                    // =================================

                    const resultBox =
                        document.getElementById(
                            "result"
                        );


                    if (resultBox) {

                        resultBox.innerHTML = `

                            <h2>AI Prediction 🔥</h2>

                            Final Prediction :
                            <b>${pendingPrediction}</b>

                            <br><br>

                            Color :
                            <b>
                            ${
                                typeof getColorPrediction ===
                                "function"
                                    ? getColorPrediction(
                                        pendingPrediction
                                    )
                                    : "-"
                            }
                            </b>

                            <br><br>

                            Big/Small :
                            <b>
                            ${
                                typeof getBigSmallPrediction ===
                                "function"
                                    ? getBigSmallPrediction(
                                        pendingPrediction
                                    )
                                    : "-"
                            }
                            </b>

                            <br><br>

                            Confidence :
                            <b>${confidence}%</b>

                            <br><br>

                            Pattern :
                            <b>${pattern}</b>

                            <br><br>

                            Trend Score :
                            <b>${trendScore}%</b>

                            <br><br>

                            Hot Number :
                            <b>${hotCold.hot ?? "-"}</b>

                            <br><br>

                            Cold Number :
                            <b>${hotCold.cold ?? "-"}</b>

                            <br><br>

                            AI Score :
                            <b>${aiScore}%</b>

                            <br><br>

                            Total Saved Numbers :
                            <b>${allResults.length}</b>

                        `;

                    }


                    // =================================
                    // DEBUG
                    // =================================

                    const debugPattern =
                        document.getElementById(
                            "debugPattern"
                        );

                    const debugPrediction =
                        document.getElementById(
                            "debugPrediction"
                        );

                    const debugSource =
                        document.getElementById(
                            "debugSource"
                        );

                    const debugMemory =
                        document.getElementById(
                            "debugMemory"
                        );


                    if (debugPattern) {
                        debugPattern.innerText =
                            pattern;
                    }

                    if (debugPrediction) {
                        debugPrediction.innerText =
                            pendingPrediction;
                    }

                    if (debugSource) {
                        debugSource.innerText =
                            "🧠 AI";
                    }

                    if (debugMemory) {
                        debugMemory.innerText =
                            "PENDING RESULT";
                    }


                    if (
                        typeof updateStats ===
                        "function"
                    ) {

                        updateStats();

                    }


                    console.log(
                        "PREDICTION CREATED",
                        {

                            input:
                                pendingInput,

                            prediction:
                                pendingPrediction

                        }
                    );

                };

        }


        // ========================================
        // CHECK RESULT
        // ========================================

        if (checkBtn) {

            checkBtn.onclick =
                function () {

                    console.log(
                        "Check Result started"
                    );


                    // -----------------------------
                    // Prediction check
                    // -----------------------------

                    if (
                        pendingPrediction === null ||
                        pendingPrediction === undefined
                    ) {

                        alert(
                            "Pehle Analyze AI dabao, phir Check Result dabao."
                        );

                        return;
                    }


                    if (
                        !pendingInput ||
                        pendingInput.length !== 5
                    ) {

                        alert(
                            "Prediction input memory missing hai."
                        );

                        return;
                    }


                    // -----------------------------
                    // Actual result
                    // -----------------------------

                    const input =
                        prompt(
                            "Enter Actual Result (0-9)"
                        );


                    if (input === null) {
                        return;
                    }


                    const actualResult =
                        Number(
                            input.trim()
                        );


                    if (
                        !Number.isInteger(
                            actualResult
                        ) ||
                        actualResult < 0 ||
                        actualResult > 9
                    ) {

                        alert(
                            "Please Enter Number Between 0 and 9"
                        );

                        return;
                    }


                    // =================================
                    // FREEZE PREDICTION DATA
                    // =================================

                    const prediction =
                        Number(
                            pendingPrediction
                        );

                    const predictionInput =
                        [...pendingInput];


                    const isWin =
                        prediction === actualResult;


                    const currentPattern =
                        predictionInput.join(",");


                    // =================================
                    // SAVE ACTUAL RESULT
                    // =================================

                    allResults.unshift(
                        actualResult
                    );


                    if (
                        allResults.length > 1000
                    ) {

                        allResults.pop();

                    }


                    saveMemory(
                        "allResults",
                        allResults
                    );


                    // =================================
                    // RESTORE PREDICTION INPUT
                    // FOR LEARNING
                    // =================================

                    document.getElementById(
                        "n1"
                    ).value =
                        predictionInput[0];

                    document.getElementById(
                        "n2"
                    ).value =
                        predictionInput[1];

                    document.getElementById(
                        "n3"
                    ).value =
                        predictionInput[2];

                    document.getElementById(
                        "n4"
                    ).value =
                        predictionInput[3];

                    document.getElementById(
                        "n5"
                    ).value =
                        predictionInput[4];


                    // =================================
                    // PATTERN LEARNING
                    // =================================

                    if (
                        typeof updateLearningMemory ===
                        "function"
                    ) {

                        try {

                            updateLearningMemory(
                                actualResult
                            );

                        } catch (error) {

                            console.error(
                                "Pattern learning error:",
                                error
                            );

                        }

                    }


                    // =================================
                    // BIG / SMALL LEARNING
                    // =================================

                    if (
                        typeof updateBigSmallMemory ===
                        "function"
                    ) {

                        try {

                            updateBigSmallMemory(
                                actualResult
                            );

                        } catch (error) {

                            console.error(
                                "Big/Small learning error:",
                                error
                            );

                        }

                    }


                    // =================================
                    // COLOR LEARNING
                    // =================================

                    if (
                        typeof updateColorMemory ===
                        "function"
                    ) {

                        try {

                            updateColorMemory(
                                actualResult
                            );

                        } catch (error) {

                            console.error(
                                "Color learning error:",
                                error
                            );

                        }

                    }


                    // =================================
                    // PREDICTION HISTORY
                    // =================================

                    if (
                        typeof savePredictionHistory ===
                        "function"
                    ) {

                        savePredictionHistory(
                            prediction,
                            actualResult
                        );

                    }


                    // =================================
                    // WIN / LOSS
                    // =================================

                    if (isWin) {

                        aiWins++;

                        localStorage.setItem(
                            "aiWins",
                            String(aiWins)
                        );


                        if (
                            typeof updateRewardPenalty ===
                            "function"
                        ) {

                            updateRewardPenalty(
                                currentPattern,
                                true
                            );

                        }


                        if (
                            typeof selfLearning ===
                            "function"
                        ) {

                            selfLearning(
                                currentPattern,
                                true
                            );

                        }


                    addHistory(
                            "✅ AI WON | Prediction : " +
                            prediction +
                            " | Result : " +
                            actualResult
                        );


                        alert(
                            "AI WON ✅\n\n" +
                            "Prediction = " +
                            prediction +
                            "\nActual Result = " +
                            actualResult
                        );


                    } else {

                        aiLosses++;

                        localStorage.setItem(
                            "aiLosses",
                            String(aiLosses)
                        );


                        if (
                            typeof updateRewardPenalty ===
                            "function"
                        ) {

                            updateRewardPenalty(
                                currentPattern,
                                false
                            );

                        }


                        if (
                            typeof selfLearning ===
                            "function"
                        ) {

                            selfLearning(
                                currentPattern,
                                false
                            );

                        }


                        addHistory(
                            "❌ AI LOST | Prediction : " +
                            prediction +
                            " | Result : " +
                            actualResult
                        );


                        alert(
                            "AI LOST ❌\n\n" +
                            "Prediction = " +
                            prediction +
                            "\nActual Result = " +
                            actualResult
                        );

                    }


                    // =================================
                    // AUTO SHIFT
                    // =================================

                    document.getElementById(
                        "n5"
                    ).value =
                        predictionInput[4];

                    document.getElementById(
                        "n4"
                    ).value =
                        predictionInput[3];

                    document.getElementById(
                        "n3"
                    ).value =
                        predictionInput[2];

                    document.getElementById(
                        "n2"
                    ).value =
                        predictionInput[1];

                    document.getElementById(
                        "n1"
                    ).value =
                        actualResult;


                    // =================================
                    // RESET PENDING
                    // =================================

                    pendingPrediction =
                        null;

                    pendingInput =
                        null;

                    nextPrediction =
                        null;


                    // =================================
                    // DEBUG
                    // =================================

                    const debugSource =
                        document.getElementById(
                            "debugSource"
                        );

                    const debugMemory =
                        document.getElementById(
                            "debugMemory"
                        );


                    if (debugSource) {
                        debugSource.innerText =
                            "RESULT SAVED";
                    }

                    if (debugMemory) {
                        debugMemory.innerText =
                            "UPDATED";
                    }


                    // =================================
                    // UPDATE STATS
                    // =================================

                    if (
                        typeof updateStats ===
                        "function"
                    ) {

                        updateStats();

                    }


                    // =================================
                    // UPDATE HISTORY TABLE
                    // =================================

                    if (
                        typeof updatePredictionHistoryTable ===
                        "function"
                    ) {

                        updatePredictionHistoryTable();

                    }


                    console.log(
                        "RESULT SAVED",
                        {

                            prediction:
                                prediction,

                            actual:
                                actualResult,

                            win:
                                isWin,

                            savedNumbers:
                                allResults.length,

                            aiWins:
                                aiWins,

                            aiLosses:
                                aiLosses

                        }
                    );

                };

        }


        // ========================================
        // INITIAL STATS
        // ========================================

        if (
            typeof updateStats ===
            "function"
        ) {

            updateStats();

        }


        if (
            typeof updatePredictionHistoryTable ===
            "function"
        ) {

            updatePredictionHistoryTable();

        }

    }
);
