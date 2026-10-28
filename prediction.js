// ========================================
// PREDICTION.JS
// FINAL PREDICTION ENGINE
// ========================================

// ========================================
// COLOR
// ========================================
alert("PREDICTION.JS LOADED");

function getColorPrediction(number) {

    number = Number(number);

    if ([1, 3, 7, 9].includes(number)) {
        return "🟢 GREEN";
    }

    if ([2, 4, 6, 8].includes(number)) {
        return "🔴 RED";
    }

    if ([0,5].includes(number)) {
    return "🟣 VIOLET";
}

}

// ========================================
// BIG / SMALL
// ========================================

function getBigSmallPrediction(number) {

    number = Number(number);

    return number >= 5
        ? "🔵 BIG"
        : "🟡 SMALL";
}


// ========================================
// TREND PREDICTION
// ========================================

function getTrendPrediction() {

    if (!Array.isArray(allResults) || allResults.length < 20) {
        return null;
    }

    const recent = allResults.slice(0, 20);
    const count = {};

    for (let i = 0; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 0 &&
            n <= 9
        ) {
            count[n]++;
        }
    });

    let best = null;
    let max = -1;

    for (let i = 0; i <= 9; i++) {

        if (count[i] > max) {
            max = count[i];
            best = i;
        }
    }

    return best;
}


// ========================================
// TREND SCORE
// ========================================

function getTrendScore() {

    if (!Array.isArray(allResults) || allResults.length < 20) {
        return 0;
    }

    const recent = allResults.slice(0, 20);
    const count = {};

    for (let i = 0; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 0 &&
            n <= 9
        ) {
            count[n]++;
        }
    });

    let maxFrequency = 0;

    for (let i = 0; i <= 9; i++) {

        if (count[i] > maxFrequency) {
            maxFrequency = count[i];
        }
    }

    return Math.round(
        Math.min(
            100,
            (maxFrequency / 20) * 100
        )
    );
}


// ========================================
// HOT / COLD
// ========================================

function getHotColdNumbers() {

    if (!Array.isArray(allResults) || allResults.length < 20) {

        return {
            hot: null,
            cold: null
        };
    }

    const recent = allResults.slice(0, 20);
    const count = {};

    for (let i = 0; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 0 &&
            n <= 9
        ) {
            count[n]++;
        }
    });

    let hot = null;
    let cold = null;

    let hotCount = -1;
    let coldCount = Infinity;

    for (let i = 0; i <= 9; i++) {

        if (count[i] > hotCount) {
            hotCount = count[i];
            hot = i;
        }

        if (count[i] < coldCount) {
            coldCount = count[i];
            cold = i;
        }
    }

    return {
        hot: hot,
        cold: cold
    };
}


// ========================================
// REAL AI MODEL PREDICTION
// ========================================
// Optional signal only.
// Does NOT guarantee the future result.
// ========================================

async function getRealAIPrediction(input) {

    try {

        if (typeof aiModel === "undefined" || !aiModel) {
    return null;
        }

        if (
            !Array.isArray(input) ||
            input.length !== 5
        ) {
            return null;
        }

        const values = input.map(Number);

if (
    values.some(
        n =>
            !Number.isInteger(n) ||
            n < 0 ||
            n > 9
    )
) {
    console.error(
        "AI input contains invalid number:",
        values
    );
    return null;
}

        const tensor =
            tf.tensor2d(
                [values],
                [1, 5]
            );

        alert("REACHED BEFORE aiModel.predict");
        
        const prediction = aiModel.predict(tensor);

        alert(
    "PREDICT OUTPUT SHAPE = " +
    JSON.stringify(prediction.shape)
);
        
        const probabilities =
            await prediction.data();

        alert("PROBABILITIES DATA READ SUCCESS");

        const probabilityValues = Array.from(probabilities);

alert(
    "PREDICTION OUTPUT CHECK\n\n" +
    "Length = " + probabilityValues.length +
    "\nAll Finite = " +
    probabilityValues.every(Number.isFinite) +
    "\nValues = " +
    probabilityValues.join(", ")
);
        
        alert(
    "AI Probabilities:\n\n" +
    Array.from(probabilities).map(
        (p, i) => i + " = " + (p * 100).toFixed(2) + "%"
    ).join("\n")
);
        
        let bestIndex = 0;
        let bestProbability = -Infinity;

        for (
            let i = 0;
            i < probabilities.length;
            i++
        ) {

            if (
                probabilities[i] >
                bestProbability
            ) {

                bestProbability =
                    probabilities[i];

                bestIndex = i;
            }
        }

        tensor.dispose();

        if (
            prediction &&
            typeof prediction.dispose === "function"
        ) {
            prediction.dispose();
        }

    return {
    number: bestIndex,
    confidence: Math.round(bestProbability * 100)
};

    } catch (error) {

        alert("REAL AI ERROR: " + error.message);
        
        console.error(
            "Real AI prediction error:",
            error
        );

        return null;
    }
}

// ========================================
// PHASE 3 — NEURAL NETWORK TRAINING
// Educational ML / forecasting demo
// ========================================

let aiModel = null;

async function trainAIModel(

    inputs,
    targets,
    validationInputs = null,
    validationTargets = null,
    testInputs = null,
    testTargets = null
) {

    alert("TRAIN AI MODEL START");
    
    if (
        !Array.isArray(inputs) ||
        !Array.isArray(targets) ||
        inputs.length < 20 ||
        inputs.length !== targets.length
    ) {
        console.warn("Not enough training data.");
        return false;
    }

    if (typeof tf === "undefined") {
        console.error("TensorFlow.js load nahi hua.");
        return false;
    }

    // Keep the currently working model alive while training a candidate.
    const previousModel = aiModel;
    let candidateModel = null;
    let xs = null;
    let ys = null;
    let validationXs = null;
    let validationYs = null;
    let testXs = null;
    let testYs = null;
    let accepted = false;

    try {

        const validInputs = inputs.every(row =>
            Array.isArray(row) && row.length === 5 &&
            row.every(value => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 9)
        );
        const validTargets = targets.every(value =>
            Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 9
        );

        if (!validInputs || !validTargets) {
            console.error("Candidate training skipped: invalid input/target values.");
            return false;
        }

        if (
            !Array.isArray(testInputs) ||
            !Array.isArray(testTargets) ||
            testInputs.length === 0 ||
            testInputs.length !== testTargets.length
        ) {
            console.error("Candidate training skipped: a separate test set is required.");
            return false;
        }

        const validTest = testInputs.every(row =>
            Array.isArray(row) && row.length === 5 &&
            row.every(value => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 9)
        ) && testTargets.every(value =>
            Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 9
        );

        if (!validTest) {
            console.error("Candidate training skipped: invalid test data.");
            return false;
        }

candidateModel = tf.sequential();
        candidateModel.add(tf.layers.dense({ inputShape: [5], units: 32, activation: "relu" }));
        candidateModel.add(tf.layers.dense({ units: 16, activation: "relu" }));
        candidateModel.add(tf.layers.dense({ units: 10, activation: "softmax" }));
        candidateModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: "sparseCategoricalCrossentropy",
            metrics: ["accuracy"]
        });

        xs = tf.tensor2d(inputs.map(row => row.map(Number)));
        ys = tf.tensor1d(targets.map(Number));
        testXs = tf.tensor2d(testInputs.map(row => row.map(Number)));
        testYs = tf.tensor1d(testTargets.map(Number));

        if (
            Array.isArray(validationInputs) &&
            Array.isArray(validationTargets) &&
            validationInputs.length > 0 &&
            validationInputs.length === validationTargets.length
        ) {
            validationXs = tf.tensor2d(validationInputs.map(row => row.map(Number)));
            validationYs = tf.tensor1d(validationTargets.map(Number));
        }

        const finiteInput = Array.from(xs.dataSync()).every(Number.isFinite);
        const finiteTargets = Array.from(ys.dataSync()).every(Number.isFinite);
        alert("INPUT FINITE = " + finiteInput + "\nTARGET FINITE = " + finiteTargets);
        if (!finiteInput || !finiteTargets) {
            throw new Error("Training tensors contain non-finite values.");
        }

        alert("CANDIDATE MODEL FIT START");
        
        await candidateModel.fit(xs, ys, {
            epochs: 30,
            batchSize: 16,
            shuffle: false,
            validationData: validationXs && validationYs ? [validationXs, validationYs] : undefined,
            verbose: 0,
            callbacks: {
                onEpochEnd: async function (epoch, logs) {
                    console.log("CANDIDATE EPOCH:", epoch + 1, "LOSS:", logs.loss);
                }
            }
        });

        alert("MODEL FIT COMPLETED");
        
        const candidateWeights = candidateModel.getWeights();
        const candidateWeightsFinite = candidateWeights.every(weight =>
            Array.from(weight.dataSync()).every(Number.isFinite)
        );
        alert("CANDIDATE WEIGHTS FINITE = " + candidateWeightsFinite);
        if (!candidateWeightsFinite) {
            throw new Error("Candidate model has non-finite weights.");
        }

        // Compare both models on exactly the same held-out test data.
        const candidateEval = candidateModel.evaluate(testXs, testYs, { batchSize: 16, verbose: 0 });
        const candidateEvalTensors = Array.isArray(candidateEval) ? candidateEval : [candidateEval];
        const candidateLoss = (await candidateEvalTensors[0].data())[0];
        const candidateAccuracy = candidateEvalTensors[1]
            ? (await candidateEvalTensors[1].data())[0]
            : NaN;
        candidateEvalTensors.forEach(t => t.dispose());

        console.log("CANDIDATE TEST LOSS:", candidateLoss);
console.log(
    "CANDIDATE TEST ACCURACY:",
    (candidateAccuracy * 100).toFixed(2) + "%"
);

alert(
    "CANDIDATE TEST RESULTS\n\n" +
    "TEST LOSS = " + candidateLoss.toFixed(4) + "\n" +
    "TEST ACCURACY = " +
    (candidateAccuracy * 100).toFixed(2) + "%"
);

        if (!Number.isFinite(candidateLoss) || !Number.isFinite(candidateAccuracy)) {
            throw new Error("Candidate test metrics are not finite.");
        }

        if (previousModel) {
            const previousEval = previousModel.evaluate(testXs, testYs, { batchSize: 16, verbose: 0 });
            const previousEvalTensors = Array.isArray(previousEval) ? previousEval : [previousEval];
            const previousLoss = (await previousEvalTensors[0].data())[0];
            const previousAccuracy = previousEvalTensors[1]
                ? (await previousEvalTensors[1].data())[0]
                : NaN;
            previousEvalTensors.forEach(t => t.dispose());

            console.log("PREVIOUS TEST LOSS:", previousLoss);
            console.log("PREVIOUS TEST ACCURACY:", (previousAccuracy * 100).toFixed(2) + "%");

            // Conservative acceptance rule: candidate must not regress either metric.
            if (
                !Number.isFinite(previousLoss) ||
                !Number.isFinite(previousAccuracy) ||
                candidateAccuracy < previousAccuracy ||
                candidateLoss > previousLoss
            ) {
                console.warn("Candidate rejected; previous model kept.");
                alert("CANDIDATE REJECTED\n\nPurana model safe hai.\nNaya model test mein better nahi tha.");
                return false;
            }
        }

        // Do not dispose the previous model here. Save step must succeed first.
        aiModel = candidateModel;
        accepted = true;
        candidateModel = null;
        window.__previousAIModelForRollback = previousModel;
        window.__candidateAIModelNeedsSave = true;

        alert("CANDIDATE PASSED TEST\n\nAb save step hoga.");
        return true;
    } catch (error) {
        console.error("Candidate AI training failed:", error);
        alert("CANDIDATE TRAINING ERROR: " + error.message);
        return false;
    } finally {
        if (xs) xs.dispose();
        if (ys) ys.dispose();
        if (validationXs) validationXs.dispose();
        if (validationYs) validationYs.dispose();
        if (testXs) testXs.dispose();
        if (testYs) testYs.dispose();
        if (candidateModel) candidateModel.dispose();
        // If not accepted, aiModel was never changed and the old model remains active.
        if (!accepted) aiModel = previousModel;
    }
}

// ========================================
// PHASE 3 — AUTOMATIC RETRAINING
// ========================================

async function retrainAIModel() {

    alert("TEST: retrainAIModel STARTED");
    
    const dataset =
        buildMLTrainValidationTestSet();

    alert(
    "DATASET CHECK\n\n" +
    "ready = " +
    (dataset ? dataset.ready : "NO DATASET") +
    "\n" +
    "train = " +
    (dataset && dataset.trainInputs
        ? dataset.trainInputs.length
        : "N/A") +
    "\n" +
    "validation = " +
    (dataset && dataset.validationInputs
        ? dataset.validationInputs.length
        : "N/A") +
    "\n" +
    "test = " +
    (dataset && dataset.testInputs
        ? dataset.testInputs.length
        : "N/A")
);
    
    if (
        !dataset ||
        !dataset.ready ||
        dataset.trainInputs.length < 20
    ) {
        console.warn(
            "Retraining skipped: not enough data."
        );
        return false;
    }

    alert(
    "SENDING TO TRAIN MODEL\n\n" +
    "Train = " + dataset.trainInputs.length + "\n" +
    "Validation = " + dataset.validationInputs.length + "\n" +
    "Test = " + dataset.testInputs.length
);
    
    const success = await trainAIModel(
    dataset.trainInputs,
    dataset.trainTargets,
    dataset.validationInputs,
    dataset.validationTargets,
    dataset.testInputs,
    dataset.testTargets
);

    if (success) {

        const saved = await saveAIModel();

if (!saved) {
    console.warn("AI model save nahi hua.");
}
        
        console.log(
            "AI model weights updated successfully."
        );

        console.log(
            "Training samples:",
            dataset.trainSamples
        );

        console.log(
            "Validation samples:",
            dataset.validationSamples
        );

        console.log(
            "Test samples:",
            dataset.testSamples
        );
    }

    return success;
}

// ========================================
// PHASE 3 — MODEL SAVE / LOAD
// ========================================

async function saveAIModel() {
    if (!aiModel) {
        console.warn("AI model available nahi hai.");
        return false;
    }

    const previousModel = window.__previousAIModelForRollback || null;
    const needsPromotion = window.__candidateAIModelNeedsSave === true;

    try {
        // Keep a backup of the current saved model before replacing its storage key.
        // The backup key is intentionally separate from the production model key.
        if (needsPromotion && previousModel) {
            await previousModel.save("localstorage://phase3-ai-model-v3-backup");
        }

        await aiModel.save("localstorage://phase3-ai-model-v3");

        console.log("AI model saved successfully.");
        window.__candidateAIModelNeedsSave = false;
        window.__previousAIModelForRollback = null;
        if (previousModel && previousModel !== aiModel) previousModel.dispose();
        return true;
    } catch (error) {
        console.error("AI model save error:", error);

        // Restore the previous in-memory model if candidate saving fails.
        if (needsPromotion && previousModel) {
            const rejectedCandidate = aiModel;
            aiModel = previousModel;
            window.__previousAIModelForRollback = null;
            window.__candidateAIModelNeedsSave = false;
            if (rejectedCandidate && rejectedCandidate !== previousModel) rejectedCandidate.dispose();

            // If production storage was partially changed, try restoring its backup.
            try {
                const backupModel = await tf.loadLayersModel(
                    "localstorage://phase3-ai-model-v3-backup"
                );
                await backupModel.save("localstorage://phase3-ai-model-v3");
                backupModel.dispose();
                console.warn("Previous saved model restored from backup.");
            } catch (restoreError) {
                console.error("Could not restore saved-model backup:", restoreError);
            }
        }
        return false;
    }
}

async function loadAIModel() {

    if (typeof tf === "undefined") {
        console.error("TensorFlow.js load nahi hua.");
        return false;
    }

    try {

        aiModel = await tf.loadLayersModel(
            "localstorage://phase3-ai-model-v3"
);

        const weights = aiModel.getWeights();

let weightsFinite = true;

for (const weight of weights) {
    const values = weight.dataSync();

    if (!Array.from(values).every(Number.isFinite)) {
        weightsFinite = false;
        break;
    }
}

alert("LOADED MODEL WEIGHTS FINITE = " + weightsFinite);
        
        console.log("AI model loaded successfully.");
        return true;

    } catch (error) {

        console.warn(
            "Saved AI model nahi mila."
        );

        aiModel = null;
        return false;
    }
}

// ========================================
// PHASE 3 — AUTO LOAD MODEL
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    if (typeof updateAIMemoryStats === "function") {
        updateAIMemoryStats();
    }

    const loaded = await loadAIModel();

    alert(
        "MODEL LOAD RESULT:\n\n" +
        "loaded = " + loaded
    );

    if (loaded) {
        console.log("Saved AI model restored ✅");
    } else {
        console.log("No saved AI model found.");
    }

    // Automatically retrain whether or not a saved model loaded
    alert("AUTOMATIC RETRAINING START");

    try {
        const trained = await retrainAIModel();

        if (trained === true) {
            console.log("AI model retrained and saved ✅");
        } else {
            console.warn("AI model training failed or did not return true.");
        }
    } catch (error) {
        console.error("Automatic retraining error:", error);

        alert(
            "AUTOMATIC RETRAINING ERROR:\n\n" +
            error.message
        );
    }

});

async function getTensorFlowDemoPrediction(input) {

    if (
        typeof phase3MModel === "undefined" ||
        !phase3MModel
    ) {
        console.warn("TensorFlow model is not ready.");
        return null;
    }

    if (!Array.isArray(input) || input.length !== 5) {
        console.warn("Demo input must contain 5 values.");
        return null;
    }

    const normalized = input.map(function (value) {
    return Number(value);
});

    const tensor = tf.tensor2d(
        [normalized],
        [1, 5],
        "float32"
    );

    try {

        const output =
            phase3MModel.predict(tensor);

        const probabilities =
            await output.array();

console.log(
    "TensorFlow probabilities:",
    probabilities[0]
);

const bestClass =
    probabilities[0].indexOf(
        Math.max(...probabilities[0])
    );

// Model class 0–8 ko actual number 1–9 mein convert karo
const predictedNumber = bestClass + 1;

console.log(
    "TensorFlow predicted number:",
    predictedNumber
);
        
        console.log(
            "TensorFlow demo output:",
            probabilities[0]
        );

        return probabilities[0];

    } finally {

        tensor.dispose();

    }
}

let latestAIConfidence = 0;
let latestCombinedEvidenceScore = 0;
    
// ========================================
// FINAL NUMBER PREDICTION
// ========================================

async function getFinalPrediction(input) {

    // STEP 5: Trained TensorFlow AI prediction
    
    alert("getFinalPrediction START");

alert(
    "BEFORE AI CHECK | aiModel = " +
    (typeof aiModel === "undefined"
        ? "UNDEFINED"
        : aiModel ? "EXISTS" : "NULL")
);

if (typeof aiModel !== "undefined" && aiModel) {
    
         try {
            const aiResult = await getRealAIPrediction(input);

             alert(
    "AI RESULT = " +
    JSON.stringify(aiResult)
);
             
            const aiConfidence =
    aiResult && Number.isFinite(Number(aiResult.confidence))
        ? Number(aiResult.confidence)
        : 0;

            latestAIConfidence = aiConfidence;
            
            if (
                aiResult &&
                Number.isInteger(Number(aiResult.number)) &&
                Number(aiResult.number) >= 0 &&
                Number(aiResult.number) <= 9
            ) {

                const MIN_AI_CONFIDENCE = 0;

                alert(
    "CONFIDENCE VALUE = " +
    aiConfidence +
    "\nMIN VALUE = " +
    MIN_AI_CONFIDENCE +
    "\nCONDITION = " +
    (aiConfidence < MIN_AI_CONFIDENCE)
);
                
  console.log("AI CONFIDENCE CHECK:", aiConfidence);
                
                if (aiConfidence < MIN_AI_CONFIDENCE) {
    console.warn(
        "LOW AI CONFIDENCE:",
        aiConfidence + "%",
        "| NO PREDICTION"
    );
    return null;
}
                
                console.log(
                    "FINAL AI MODEL PREDICTION:",
                    aiResult.number,
                    "Confidence:",
                    aiResult.confidence + "%"
                );

                console.log(
    "PRIMARY AI PREDICTION PROTECTED:",
    aiResult.number,
    "| Secondary evidence will NOT override AI."
);
                
                return Number(aiResult.number);
            }
        } catch (error) {
            console.error("AI model prediction error:", error);
        }
    }
    
    let memory = null;
    let trend = null;
    let hot = null;

    // ------------------------------------
    // Pattern Memory
    // ------------------------------------

    if (
        typeof getPatternPrediction ===
        "function"
    ) {

        try {

            memory =
                getPatternPrediction();

        } catch (error) {

            console.error(
                "Pattern prediction error:",
                error
            );

            memory = null;
        }
    }


    // ------------------------------------
    // Trend
    // ------------------------------------

    trend =
        getTrendPrediction();


    // ------------------------------------
    // Hot
    // ------------------------------------

    const hotCold =
        getHotColdNumbers();

    hot =
        hotCold.hot;

    // ------------------------------------
// STEP 8C: Secondary Evidence
// ------------------------------------

let secondaryEvidenceScore = 0;

// Pattern evidence
if (
    typeof getPatternScore === "function"
) {
    try {
        secondaryEvidenceScore +=
            Math.max(
                0,
                Math.min(
                    100,
                    Number(getPatternScore()) || 0
                )
            ) * 0.40;
    } catch (error) {
        console.error(
            "Secondary pattern error:",
            error
        );
    }
}

// Trend evidence
if (
    typeof getTrendScore === "function"
) {
    try {
        secondaryEvidenceScore +=
            Math.max(
                0,
                Math.min(
                    100,
                    Number(getTrendScore()) || 0
                )
            ) * 0.35;
    } catch (error) {
        console.error(
            "Secondary trend error:",
            error
        );
    }
}

// Hot evidence
if (
    hot !== null &&
    hot !== undefined
) {
    secondaryEvidenceScore += 25;
}

secondaryEvidenceScore =
    Math.round(
        Math.max(
            0,
            Math.min(
                100,
                secondaryEvidenceScore
            )
        )
    );

console.log(
    "SECONDARY EVIDENCE SCORE:",
    secondaryEvidenceScore
);

    // ------------------------------------
// STEP 8E: Combined Evidence Score
// ------------------------------------

const combinedEvidenceScore =
    Math.round(
        (Number(latestAIConfidence) * 0.70) +
        (Number(secondaryEvidenceScore) * 0.30)
    );

console.log(
    "COMBINED EVIDENCE SCORE:",
    combinedEvidenceScore
);

    // ------------------------------------
// STEP 8F: Store Secondary Evidence
// ------------------------------------

latestCombinedEvidenceScore =
    combinedEvidenceScore;

console.log(
    "AI PRIMARY + SECONDARY EVIDENCE:",
    latestCombinedEvidenceScore
);

    return null;
}

window.auditPredictionSource = async function (input) {

    let memory = null;
    let trend = null;
    let hot = null;
    let final = null;

    try {
        memory = getPatternPrediction();
    } catch (e) {
        console.error("Pattern error:", e);
    }

    try {
        trend = getTrendPrediction();
    } catch (e) {
        console.error("Trend error:", e);
    }

    try {
        const hc = getHotColdNumbers();
        hot = hc ? hc.hot : null;
    } catch (e) {
        console.error("Hot/Cold error:", e);
    }

    try {
        final = await getFinalPrediction(input);
    } catch (e) {
        console.error("Final prediction error:", e);
    }

    const report =
        "PREDICTION SOURCE AUDIT\n\n" +

        "Pattern Engine = " + memory +
        "\nTrend Engine = " + trend +
        "\nHot Number = " + hot +
        "\nFinal Prediction = " + final +

        "\n\nTensorFlow connection:\n" +
        "getFinalPrediction() → NO DIRECT TF CALL\n" +

        "\n\nConclusion:\n" +
        "Current final output is coming from the legacy rule path.";

    console.log("PREDICTION SOURCE AUDIT", {
        memory,
        trend,
        hot,
        final
    });

    alert(report);
};

// ========================================
// FINAL AI SCORE
// ========================================

function getFinalAIScore() {

    let memoryScore = 0;
    let patternScore = 0;

    memoryScore = latestAIConfidence;
    
    const trendScore =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    getTrendScore()
                ) || 0
            )
        );

    // ------------------------------------
    // Pattern score
    // ------------------------------------

    if (
        typeof getPatternScore ===
        "function"
    ) {

        try {

            patternScore =
                Number(
                    getPatternScore()
                ) || 0;

        } catch (error) {

            console.error(
                "Pattern score error:",
                error
            );
        }
    }


    memoryScore =
        Math.max(
            0,
            Math.min(
                100,
                memoryScore
            )
        );

    patternScore =
        Math.max(
            0,
            Math.min(
                100,
                patternScore
            )
        );


    const finalScore =
        (memoryScore * 0.35) +
        (patternScore * 0.40) +
        (trendScore * 0.25);


    return Math.round(
        Math.min(
            100,
            finalScore
        )
    );
        }
