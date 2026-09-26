// ========================================
// PREDICTION.JS
// FINAL PREDICTION ENGINE
// ========================================


// ========================================
// COLOR
// ========================================

function getColorPrediction(number) {

    number = Number(number);

    if ([1, 3, 7, 9].includes(number)) {
        return "🟢 GREEN";
    }

    if ([2, 4, 6, 8].includes(number)) {
        return "🔴 RED";
    }

    return "🟣 VIOLET";
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

    for (let i = 1; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 1 &&
            n <= 9
        ) {
            count[n]++;
        }
    });

    let best = null;
    let max = -1;

    for (let i = 1; i <= 9; i++) {

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

    for (let i = 1; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 1 &&
            n <= 9
        ) {
            count[n]++;
        }
    });

    let maxFrequency = 0;

    for (let i = 1; i <= 9; i++) {

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

    for (let i = 1; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 1 &&
            n <= 9
        ) {
            count[n]++;
        }
    });

    let hot = null;
    let cold = null;

    let hotCount = -1;
    let coldCount = Infinity;

    for (let i = 1; i <= 9; i++) {

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
            n < 1 ||
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

        const output = aiModel.predict(tensor);

        const probabilities =
            await output.data();

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
            output &&
            typeof output.dispose === "function"
        ) {
            output.dispose();
        }

    return {
    number: bestIndex + 1,
    confidence: Math.round(bestProbability * 100)
};

    } catch (error) {

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

    // Purana model hatao
    if (aiModel) {
        aiModel.dispose();
    }

    aiModel = tf.sequential();

    aiModel.add(
        tf.layers.dense({
            inputShape: [5],
            units: 32,
            activation: "relu"
        })
    );

    aiModel.add(
        tf.layers.dense({
            units: 16,
            activation: "relu"
        })
    );

    aiModel.add(
    tf.layers.dense({
        units: 9,
        activation: "softmax"
    })
);

aiModel.compile({
    optimizer: tf.train.adam(0.001),
    loss: "sparseCategoricalCrossentropy",
    metrics: ["accuracy"]
});

    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor1d(
    targets.map(value => Number(value)),
    "int32"
);

    let validationXs = null;
let validationYs = null;

if (
    Array.isArray(validationInputs) &&
    Array.isArray(validationTargets) &&
    validationInputs.length > 0 &&
    validationInputs.length === validationTargets.length
) {
    validationXs = tf.tensor2d(validationInputs);

    validationYs = tf.tensor1d(
        validationTargets.map(
            value => Number(value)
        ),
        "int32"
    );
}

    let testXs = null;
let testYs = null;

if (
    Array.isArray(testInputs) &&
    Array.isArray(testTargets) &&
    testInputs.length > 0 &&
    testInputs.length === testTargets.length
) {
    testXs = tf.tensor2d(testInputs);

    testYs = tf.tensor1d(
        testTargets.map(
            value => Number(value)
        ),
        "int32"
    );
}

    try {

        await aiModel.fit(xs, ys, {
    epochs: 30,
    batchSize: 16,
    shuffle: false,
    validationData:
        validationXs && validationYs
            ? [validationXs, validationYs]
            : undefined,
    verbose: 0
});

        if (testXs && testYs) {

    const testResult =
        await aiModel.evaluate(
            testXs,
            testYs,
            {
                batchSize: 16,
                verbose: 0
            }
        );

    const testLoss =
        await testResult[0].data();

    const testAccuracy =
        await testResult[1].data();

    console.log(
        "TEST LOSS:",
        testLoss[0]
    );

    console.log(
        "TEST ACCURACY:",
        (testAccuracy[0] * 100).toFixed(2) + "%"
    );

    testResult.forEach(
        tensor => tensor.dispose()
    );
        }
        
        console.log(
            "Phase 3 AI training complete:",
            inputs.length,
            "samples"
        );

        return true;

    } finally {

        xs.dispose();
        ys.dispose();

        if (validationXs) {
    validationXs.dispose();
}

if (validationYs) {
    validationYs.dispose();
    
}
 if (testXs) {
    testXs.dispose();
}

if (testYs) {
    testYs.dispose();
  }
}
    
}

// ========================================
// PHASE 3 — AUTOMATIC RETRAINING
// ========================================

async function retrainAIModel() {

    const dataset =
        buildMLTrainValidationTestSet();

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

    try {

        await aiModel.save(
            "localstorage://phase3-ai-model-v2"
);

        console.log("AI model saved successfully.");
        return true;

    } catch (error) {

        console.error(
            "AI model save error:",
            error
        );

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
            "localstorage://phase3-ai-model-v2"
);

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

    const loaded = await loadAIModel();

    if (loaded) {
        console.log("Saved AI model restored ✅");
    } else {
        console.log("No saved AI model found.");
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
    if (typeof aiModel !== "undefined" && aiModel) {
        try {
            const aiResult = await getRealAIPrediction(input);

            const aiConfidence =
    aiResult && Number.isFinite(Number(aiResult.confidence))
        ? Number(aiResult.confidence)
        : 0;

            latestAIConfidence = aiConfidence;
            
            if (
                aiResult &&
                Number.isInteger(Number(aiResult.number)) &&
                Number(aiResult.number) >= 1 &&
                Number(aiResult.number) <= 9
            ) {

                const MIN_AI_CONFIDENCE = 60;

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
