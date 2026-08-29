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

        if (
            typeof tf === "undefined" ||
            typeof realAIModel === "undefined" ||
            !realAIModel
        ) {
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
            return null;
        }

        const tensor =
            tf.tensor2d(
                [values],
                [1, 5]
            );

        const output =
            realAIModel.predict(tensor);

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
            number: bestIndex,
            confidence: Math.round(
                bestProbability * 100
            )
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

async function trainAIModel(inputs, targets) {

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
            units: 1
        })
    );

    aiModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: "meanSquaredError"
    });

    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(
        targets.map(value => [Number(value)])
    );

    try {

        await aiModel.fit(xs, ys, {
            epochs: 30,
            batchSize: 16,
            shuffle: true,
            verbose: 0
        });

        console.log(
            "Phase 3 AI training complete:",
            inputs.length,
            "samples"
        );

        return true;

    } finally {

        xs.dispose();
        ys.dispose();

    }
}

// ========================================
// PHASE 3 — AUTOMATIC RETRAINING
// ========================================

async function retrainAIModel() {

    const dataset = buildMLDataset();

    if (
        !dataset ||
        !dataset.inputs ||
        dataset.inputs.length < 20
    ) {
        console.warn(
            "Retraining skipped: not enough data."
        );
        return false;
    }

    const success = await trainAIModel(
        dataset.inputs,
        dataset.targets
    );

    if (success) {
        console.log(
            "AI model weights updated successfully."
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
            "localstorage://phase3-ai-model"
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
            "localstorage://phase3-ai-model"
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
// FINAL NUMBER PREDICTION
// ========================================

function getFinalPrediction() {

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
    // Memory + Trend agreement
    // ------------------------------------

    if (
        memory !== null &&
        trend !== null &&
        Number(memory) === Number(trend)
    ) {

        return Number(memory);
    }


    // ------------------------------------
    // Strong pattern memory
    // ------------------------------------

    if (
        memory !== null &&
        typeof getPatternScore ===
        "function"
    ) {

        let patternScore = 0;

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

        if (patternScore >= 70) {
            return Number(memory);
        }
    }


    // ------------------------------------
    // Strong trend
    // ------------------------------------

    if (
        trend !== null &&
        getTrendScore() >= 70
    ) {

        return Number(trend);
    }


    // ------------------------------------
    // Hot fallback
    // ------------------------------------

    if (hot !== null) {
        return Number(hot);
    }


    // ------------------------------------
    // Memory fallback
    // ------------------------------------

    if (memory !== null) {
        return Number(memory);
    }


    // ------------------------------------
    // Trend fallback
    // ------------------------------------

    if (trend !== null) {
        return Number(trend);
    }


    return null;
}


// ========================================
// FINAL AI SCORE
// ========================================

function getFinalAIScore() {

    let memoryScore = 0;
    let patternScore = 0;

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
    // Memory confidence
    // ------------------------------------

    if (
        typeof getPredictionConfidence ===
        "function"
    ) {

        try {

            memoryScore =
                Number(
                    getPredictionConfidence()
                ) || 0;

        } catch (error) {

            console.error(
                "Prediction confidence error:",
                error
            );
        }
    }


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
