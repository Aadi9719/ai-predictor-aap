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

function getBigSmallPrediction(number) {

    number = Number(number);

    return number >= 5
        ? "🔵 BIG"
        : "🟡 SMALL";
}

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

async function getRealAIPrediction(input) {

    try {

        let tensor = null;
let prediction = null;

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

        tensor = tf.tensor2d([values], [1, 5]);

        alert("REACHED BEFORE aiModel.predict");
        
        prediction = aiModel.predict(tensor);

if (!prediction || typeof prediction.data !== "function") {
    throw new Error("AI prediction tensor nahi mila.");
}

alert(
    "PREDICT OUTPUT SHAPE = " +
    JSON.stringify(prediction.shape)
);
        
        const probabilities =
            await prediction.data();

        if (
    !prediction ||
    prediction.shape.length !== 2 ||
    prediction.shape[0] !== 1 ||
    prediction.shape[1] !== 10 ||
    probabilities.length !== 10 ||

            !Array.from(probabilities).every(
    p =>
        Number.isFinite(p) &&
        p >= 0 &&
        p <= 1
) ||
Math.abs(
    Array.from(probabilities).reduce(
        (sum, p) => sum + p,
        0
    ) - 1
) > 0.01
            
) {
    alert("AI OUTPUT INVALID: 10 valid probabilities nahi mili.");
   
    return null;
        }

        alert("PROBABILITIES DATA READ SUCCESS");

        const probabilityValues = Array.from(probabilities);

        const probabilitySum =
    probabilityValues.reduce(
        (sum, p) => sum + p,
        0
    );

console.log(
    "AI PROBABILITY SUM =",
    probabilitySum
);

        alert(
    "AI PROBABILITY SUM = " +
    probabilitySum.toFixed(6)
);
        
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

        alert(
    "FINAL AI CHECK\n" +
    "Predicted Number = " + bestIndex +
    "\nHighest Probability = " +
    (bestProbability * 100).toFixed(2) + "%"
);
        
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

    finally {
    if (tensor) {
        tensor.dispose();
    }

    if (prediction && typeof prediction.dispose === "function") {
        prediction.dispose();
    }
    }
}

let aiModel = null;

async function trainAIModel(
    inputs,
    targets,
    validationInputs = null,
    validationTargets = null,
    testInputs = null,
    testTargets = null
) {

    alert("TRAIN AI MODEL VERSION 3");

    if (
        !Array.isArray(inputs) ||
        !Array.isArray(targets) ||
        inputs.length < 20 ||
        inputs.length !== targets.length
    ) {
        alert("INVALID TRAINING DATA");
        return false;
    }

    if (typeof tf === "undefined") {
        alert("TENSORFLOW NOT LOADED");
        return false;
    }

    if (
        !Array.isArray(validationInputs) ||
        !Array.isArray(validationTargets) ||
        validationInputs.length === 0 ||
        validationInputs.length !== validationTargets.length
    ) {
        alert("VALIDATION DATA REQUIRED");
        return false;
    }

    const validRows = rows =>
        rows.every(row =>
            Array.isArray(row) &&
            row.length === 5 &&
            row.every(value =>
                Number.isInteger(Number(value)) &&
                Number(value) >= 0 &&
                Number(value) <= 9
            )
        );

    const validLabels = labels =>
        labels.every(value =>
            Number.isInteger(Number(value)) &&
            Number(value) >= 0 &&
            Number(value) <= 9
        );

    if (
        !validRows(inputs) ||
        !validLabels(targets) ||
        !validRows(validationInputs) ||
        !validLabels(validationTargets)
    ) {
        alert("INVALID TRAINING OR VALIDATION VALUES");
        return false;
    }

    const previousModel = aiModel;

    let candidateModel = null;
    let xs = null;
    let ys = null;
    let validationXs = null;
    let validationYs = null;

    let accepted = false;

    async function getValidationMetrics(model) {

        let evaluation = null;

        try {

            evaluation = model.evaluate(
                validationXs,
                validationYs,
                {
                    batchSize: 16,
                    verbose: 0
                }
            );

            const tensors = Array.isArray(evaluation)
                ? evaluation
                : [evaluation];

            if (tensors.length < 2) {
                throw new Error(
                    "Validation loss or accuracy missing."
                );
            }

            const lossData =
                await tensors[0].data();

            const accuracyData =
                await tensors[1].data();

            const loss = Number(lossData[0]);
            const accuracy = Number(accuracyData[0]);

            if (
                !Number.isFinite(loss) ||
                !Number.isFinite(accuracy)
            ) {
                throw new Error(
                    "Invalid validation metrics."
                );
            }

            return {
                loss,
                accuracy
            };

        } finally {

            if (evaluation) {

                const tensors = Array.isArray(evaluation)
                    ? evaluation
                    : [evaluation];

                tensors.forEach(t => t.dispose());
            }
        }
    }

    try {

        // STEP 1: CREATE CANDIDATE MODEL

        candidateModel = tf.sequential();

        candidateModel.add(
            tf.layers.dense({
                inputShape: [5],
                units: 32,
                activation: "relu"
            })
        );

        candidateModel.add(
            tf.layers.dense({
                units: 16,
                activation: "relu"
            })
        );

        candidateModel.add(
            tf.layers.dense({
                units: 10,
                activation: "softmax"
            })
        );

        candidateModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: "sparseCategoricalCrossentropy",
            metrics: ["accuracy"]
        });

        // STEP 2: CREATE TENSORS

        xs = tf.tensor2d(
            inputs.map(row => row.map(Number)),
            [inputs.length, 5]
        );

        ys = tf.tensor1d(
            targets.map(Number),
            "int32"
        );

        validationXs = tf.tensor2d(
            validationInputs.map(row => row.map(Number)),
            [validationInputs.length, 5]
        );

        validationYs = tf.tensor1d(
            validationTargets.map(Number),
            "int32"
        );

        // STEP 3: CHECK FINITE VALUES

        const finiteInput =
            Array.from(xs.dataSync()).every(Number.isFinite);

        const finiteTargets =
            Array.from(ys.dataSync()).every(Number.isFinite);

        if (!finiteInput || !finiteTargets) {
            throw new Error(
                "Training tensors contain invalid values."
            );
        }

        alert(
            "CANDIDATE TRAINING START\n\n" +
            "Training Samples = " + inputs.length +
            "\nValidation Samples = " +
            validationInputs.length
        );

        // STEP 4: TRAIN CANDIDATE

        await candidateModel.fit(xs, ys, {

            epochs: 30,
            batchSize: 16,
            shuffle: false,

            validationData: [
                validationXs,
                validationYs
            ],

            verbose: 0
        });

        alert("CANDIDATE TRAINING COMPLETED");

        // STEP 5: CHECK CANDIDATE WEIGHTS

        const candidateWeights =
            candidateModel.getWeights();

        const weightsFinite =
            candidateWeights.every(weight =>
                Array.from(
                    weight.dataSync()
                ).every(Number.isFinite)
            );

        if (!weightsFinite) {
            throw new Error(
                "Candidate weights contain invalid values."
            );
        }

        // STEP 6: CANDIDATE VALIDATION

        const candidateValidation =
            await getValidationMetrics(candidateModel);

        alert(
            "CANDIDATE VALIDATION RESULTS\n\n" +
            "Loss = " +
            candidateValidation.loss.toFixed(4) +
            "\nAccuracy = " +
            (candidateValidation.accuracy * 100).toFixed(2) +
            "%"
        );

        // STEP 7: PREVIOUS MODEL VALIDATION

        let previousValidation = null;

        if (previousModel) {

            if (!previousModel.optimizer) {

                previousModel.compile({
                    optimizer: tf.train.adam(0.001),
                    loss: "sparseCategoricalCrossentropy",
                    metrics: ["accuracy"]
                });
            }

            previousValidation =
                await getValidationMetrics(previousModel);

            alert(
                "PREVIOUS MODEL VALIDATION RESULTS\n\n" +
                "Loss = " +
                previousValidation.loss.toFixed(4) +
                "\nAccuracy = " +
                (previousValidation.accuracy * 100).toFixed(2) +
                "%"
            );
        }

        // STEP 8: MODEL SELECTION

        if (
            previousValidation &&
            candidateValidation.loss >= previousValidation.loss
        ) {

            alert(
                "CANDIDATE REJECTED\n\n" +
                "Validation loss better nahi hua.\n" +
                "Purana model safe hai."
            );

            return false;
        }

        // STEP 9: ACCEPT CANDIDATE

        aiModel = candidateModel;

        if (typeof window !== "undefined") {

            window.__previousAIModelForRollback =
                previousModel;

            window.__candidateAIModelNeedsSave = true;
        }

        accepted = true;

        candidateModel = null;

        alert(
            "CANDIDATE ACCEPTED\n\n" +
            "Validation loss improved.\n" +
            "New model selected."
        );

        return true;

    } catch (error) {

        alert(
            "TRAINING ERROR\n\n" +
            error.message
        );

        console.error(
            "trainAIModel error:",
            error
        );

        return false;

    } finally {

        if (xs) xs.dispose();
        if (ys) ys.dispose();

        if (validationXs) validationXs.dispose();
        if (validationYs) validationYs.dispose();

        if (candidateModel) {
            candidateModel.dispose();
        }

        if (!accepted) {
            aiModel = previousModel;
        }
    }
}

async function getValidationMetrics(model) {

    if (!model.optimizer) {
    throw new Error(
        "Validation model is not compiled."
    );
    }
    
    const evaluation = model.evaluate(
        validationXs,
        validationYs,
        { batchSize: 16, verbose: 0 }
    );

    const tensors = Array.isArray(evaluation)
        ? evaluation
        : [evaluation];

    try {

        const loss =
            (await tensors[0].data())[0];

        const accuracy = tensors[1]
            ? (await tensors[1].data())[0]
            : NaN;

        return { loss, accuracy };

    } finally {

        tensors.forEach(t => t.dispose());

    }
}

const candidateValidation =
    await getValidationMetrics(candidateModel);

if (
    !Number.isFinite(candidateValidation.loss) ||
    !Number.isFinite(candidateValidation.accuracy)
) {
    throw new Error("Invalid candidate validation metrics.");
}

alert(
    "CANDIDATE VALIDATION RESULTS\n\n" +
    "Loss = " + candidateValidation.loss.toFixed(4) +
    "\nAccuracy = " +
    (candidateValidation.accuracy * 100).toFixed(2) + "%"
);

console.log(
    "CANDIDATE VALIDATION ACCURACY:",
    (candidateValidation.accuracy * 100).toFixed(2) + "%"
);

if (previousModel) {

    if (!previousModel.optimizer) {
        previousModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: "sparseCategoricalCrossentropy",
            metrics: ["accuracy"]
        });
    }

    const previousValidation =
        await getValidationMetrics(previousModel);

    alert(
    "PREVIOUS MODEL VALIDATION RESULTS\n\n" +
    "Loss = " + previousValidation.loss.toFixed(4) +
    "\nAccuracy = " +
    (previousValidation.accuracy * 100).toFixed(2) + "%"
);

    console.log(
        "PREVIOUS VALIDATION ACCURACY:",
        (previousValidation.accuracy * 100).toFixed(2) + "%"
    );

    if (
        !Number.isFinite(previousValidation.loss) ||
        candidateValidation.loss >= previousValidation.loss
    ) {

        console.warn(
            "Candidate rejected. Previous model kept."
        );

        alert(
            "CANDIDATE REJECTED\n\n" +
            "Validation loss better nahi hua.\n" +
            "Purana model safe hai."
        );

        return false;
    }
}

alert(
    "CANDIDATE PASSED VALIDATION\n\n" +
    "Validation Loss = " +
    candidateValidation.loss.toFixed(4) +
    "\nValidation Accuracy = " +
    (candidateValidation.accuracy * 100).toFixed(2) +
    "%"
);
        
        // Do not dispose the previous model here. Save step must succeed first.
        aiModel = candidateModel;
        accepted = true;
        candidateModel = null;
        window.__previousAIModelForRollback = previousModel;
        window.__candidateAIModelNeedsSave = true;

        alert("CANDIDATE PASSED VALIDATION\n\nAb save step hoga.");
        
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
        if (candidateModel) candidateModel.dispose();
        
        // If not accepted, aiModel was never changed and the old model remains active.
        if (!accepted) aiModel = previousModel;
    }
}

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

    alert(
        "TRAINING SUCCESS\n" +
        "BUT SAVE FAILED\n\n" +
        "Naya model permanently save nahi hua."
    );

    return false;
}

        const testResult = await evaluateAIModelOnTestSet(
    dataset.testInputs,
    dataset.testTargets
);

if (!testResult) {
    console.warn("Model saved, but test evaluation failed.");
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

async function saveAIModel() {

    const candidateModel = aiModel;

    const previousModel =
        window.__previousAIModelForRollback || null;

    const needsPromotion =
        window.__candidateAIModelNeedsSave === true;

    if (!candidateModel) {
        console.warn("AI model available nahi hai.");
        return false;
    }

    try {

        const outputShape =
            candidateModel.outputs[0].shape;

        if (
            !Array.isArray(outputShape) ||
            outputShape.length !== 2 ||
            outputShape[1] !== 10
        ) {
            throw new Error(
                "Model must have 10 output classes."
            );
        }

        // Save previous model as backup first
        if (needsPromotion && previousModel) {
            await previousModel.save(
                "localstorage://phase3-ai-model-v3-backup"
            );
        }

        // Save candidate as active model
        await candidateModel.save(
            "localstorage://phase3-ai-model-v3"
        );

        window.__candidateAIModelNeedsSave = false;
        window.__previousAIModelForRollback = null;

        if (
            previousModel &&
            previousModel !== candidateModel
        ) {
            previousModel.dispose();
        }

        alert(
            "SAVE SUCCESS\n\n" +
            "AI model successfully save ho gaya."
        );

        return true;

    } catch (error) {

        alert(
            "SAVE ERROR\n\n" +
            error.message
        );

        // Restore previous model in memory
        if (needsPromotion) {

            if (previousModel) {

                aiModel = previousModel;

            } else {

                aiModel = null;

            }

            if (
                candidateModel &&
                candidateModel !== previousModel
            ) {
                candidateModel.dispose();
            }

            window.__previousAIModelForRollback = null;
            window.__candidateAIModelNeedsSave = false;

            // Restore saved model from backup when available
            if (previousModel) {
                try {
                    const backupModel =
                        await tf.loadLayersModel(
                            "localstorage://phase3-ai-model-v3-backup"
                        );

                    await backupModel.save(
                        "localstorage://phase3-ai-model-v3"
                    );

                    backupModel.dispose();

                } catch (restoreError) {

                    console.error(
                        "Backup restore failed:",
                        restoreError
                    );

                }
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

        const outputShape = aiModel.outputs[0].shape;

alert(
    "LOADED MODEL OUTPUT CHECK\n\n" +
    "Output Shape = " + JSON.stringify(outputShape) +
    "\nOutput Classes = " + outputShape[outputShape.length - 1]
);

if (outputShape[outputShape.length - 1] !== 10) {
    throw new Error("Loaded model 10-class output nahi hai.");
}
        
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

        if (!weightsFinite) {
    throw new Error(
        "Loaded model contains invalid weights."
    );
        }
        
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

    latestAIConfidence = 0;
    
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

                const MIN_AI_CONFIDENCE = 60;

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
    
    let trendScore = 0;

if (typeof getTrendScore === "function") {
    try {
        trendScore = Math.max(
            0,
            Math.min(
                100,
                Number(getTrendScore()) || 0
            )
        );
    } catch (error) {
        console.error(
            "Trend score error:",
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
