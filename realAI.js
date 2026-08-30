// ========================================
// REAL AI — PHASE 3C
// TensorFlow.js Model
// ========================================

let realAIModel = null;

async function createRealAIModel() {

    if (typeof tf === "undefined") {
        alert("TensorFlow.js NOT LOADED ❌");
        return false;
    }

    realAIModel = tf.sequential();

    realAIModel.add(
        tf.layers.dense({
            inputShape: [5],
            units: 32,
            activation: "relu"
        })
    );

    realAIModel.add(
        tf.layers.dense({
            units: 16,
            activation: "relu"
        })
    );

    // 10 classes: results 0–9
    realAIModel.add(
        tf.layers.dense({
            units: 10,
            activation: "softmax"
        })
    );

    realAIModel.compile({

        optimizer: tf.train.adam(0.001),

        loss: "sparseCategoricalCrossentropy",

        metrics: ["accuracy"]

    });

    console.log(
        "REAL AI MODEL CREATED",
        realAIModel
    );

    return true;
}


async function testRealAIModel() {

    alert("REAL AI MODEL TEST START");

    let success =
        await createRealAIModel();

    if (!success) {
        return;
    }

    alert(
        "REAL AI MODEL CREATED ✅\n\n" +
        "TensorFlow.js = LOADED\n" +
        "Neural Network = READY\n" +
        "Output Classes = 10"
    );
}

// ========================================
// REAL AI — PHASE 3D
// ACTUAL TRAINING + VALIDATION
// ========================================

async function trainRealAIModel() {

    if (typeof tf === "undefined") {
        alert("TensorFlow.js NOT LOADED ❌");
        return;
    }

    if (!realAIModel) {
        await createRealAIModel();
    }

    let split = buildMLTrainValidationSet();

    if (!split.ready) {
        alert("Training data NOT READY ❌");
        return;
    }

    // Convert data to tensors
    const trainX = tf.tensor2d(
        split.trainInputs,
        [split.trainInputs.length, 5]
    );

    const trainY = tf.tensor1d(
    split.trainTargets,
    "float32"
);

    const validationX = tf.tensor2d(
        split.validationInputs,
        [split.validationInputs.length, 5]
    );

    const validationY = tf.tensor1d(
    split.validationTargets,
    "float32"
);

    alert(
        "REAL AI TRAINING START\n\n" +
        "Training Samples = " +
        split.trainSamples +
        "\nValidation Samples = " +
        split.validationSamples
    );

    try {

        const history = await realAIModel.fit(
            trainX,
            trainY,
            {
                epochs: 30,
                batchSize: 32,
                shuffle: false,
                validationData: [
                    validationX,
                    validationY
                ],
                callbacks: {

                    onEpochEnd: function(epoch, logs) {

                        console.log(
                            "Epoch:",
                            epoch + 1,
                            "Loss:",
                            logs.loss,
                            "Accuracy:",
                            logs.acc || logs.accuracy,
                            "Val Loss:",
                            logs.val_loss,
                            "Val Accuracy:",
                            logs.val_acc ||
                            logs.val_accuracy
                        );

                    }

                }
            }
        );

        const evaluation =
            realAIModel.evaluate(
                validationX,
                validationY
            );

        const validationLoss =
            await evaluation[0].data();

        const validationAccuracy =
            await evaluation[1].data();

        const finalTrainAccuracy =
            history.history.accuracy
            ? history.history.accuracy[
                history.history.accuracy.length - 1
            ]
            : history.history.acc[
                history.history.acc.length - 1
            ];

        const finalValidationAccuracy =
            history.history.val_accuracy
            ? history.history.val_accuracy[
                history.history.val_accuracy.length - 1
            ]
            : history.history.val_acc[
                history.history.val_acc.length - 1
            ];

        alert(
            "REAL AI TRAINING COMPLETE ✅\n\n" +

            "Training Accuracy = " +
            (finalTrainAccuracy * 100).toFixed(2) +
            "%\n\n" +

            "Validation Accuracy = " +
            (finalValidationAccuracy * 100).toFixed(2) +
            "%\n\n" +

            "Validation Loss = " +
            validationLoss[0].toFixed(4)
        );

        console.log(
            "=== REAL AI RESULT ==="
        );

        console.log(
            "Training Accuracy:",
            finalTrainAccuracy
        );

        console.log(
            "Validation Accuracy:",
            finalValidationAccuracy
        );

        console.log(
            "Validation Loss:",
            validationLoss[0]
        );

    } catch(error) {

        console.error(
            "REAL AI TRAINING ERROR:",
            error
        );

        alert(
            "REAL AI TRAINING ERROR ❌\n\n" +
            error.message
        );

    } finally {

        trainX.dispose();
        trainY.dispose();
        validationX.dispose();
        validationY.dispose();

    }
}

// ========================================
// PHASE 3 — TENSORFLOW DEMO PREDICTION
// ========================================

async function demoTensorFlowPrediction(input) {

    if (typeof tf === "undefined") {
        console.error("TensorFlow.js NOT LOADED");
        return null;
    }

    if (!realAIModel) {
        console.error("REAL AI MODEL NOT READY");
        return null;
    }

    if (!Array.isArray(input) || input.length !== 5) {
        console.error("Demo input must contain 5 numbers");
        return null;
    }

    const normalizedInput =
        normalizeRealAIInput(input);

    const inputTensor =
        tf.tensor2d(
            [normalizedInput],
            [1, 5],
            "float32"
        );

    let outputTensor = null;

    try {

        outputTensor =
            realAIModel.predict(inputTensor);

        const probabilities =
            await outputTensor.array();

        const result = probabilities[0];

        console.log(
            "TensorFlow probabilities:",
            result
        );

        return result;

    } finally {

        inputTensor.dispose();

        if (outputTensor) {
            outputTensor.dispose();
        }
    }
}

// ========================================
// REAL AI — PHASE 3E
// PREDICTION DISTRIBUTION TEST
// ========================================

async function testRealAIDistribution() {

    if (!realAIModel) {
        alert("REAL AI MODEL NOT TRAINED ❌");
        return;
    }

    let split = buildMLTrainValidationSet();

    if (!split.ready) {
        alert("VALIDATION DATA NOT READY ❌");
        return;
    }

    const validationX = tf.tensor2d(
        split.validationInputs,
        [split.validationInputs.length, 5]
    );

    try {

        const predictions =
            realAIModel.predict(validationX);

        const predictionArray =
            await predictions.array();

        let counts = [
            0,0,0,0,0,0,0,0,0,0
        ];

        let correct = 0;

        for(let i = 0; i < predictionArray.length; i++) {

            let row = predictionArray[i];

            let predicted =
                row.indexOf(Math.max(...row));

            counts[predicted]++;

            if(
                predicted ===
                Number(split.validationTargets[i])
            ) {
                correct++;
            }
        }

        let accuracy =
            (correct /
            predictionArray.length) * 100;

        alert(
            "REAL AI DIAGNOSIS\n\n" +

            "Validation Samples = " +
            predictionArray.length +

            "\nCorrect = " +
            correct +

            "\nAccuracy = " +
            accuracy.toFixed(2) +
            "%\n\n" +

            "0 = " + counts[0] +
            "\n1 = " + counts[1] +
            "\n2 = " + counts[2] +
            "\n3 = " + counts[3] +
            "\n4 = " + counts[4] +
            "\n5 = " + counts[5] +
            "\n6 = " + counts[6] +
            "\n7 = " + counts[7] +
            "\n8 = " + counts[8] +
            "\n9 = " + counts[9]
        );

        console.log(
            "REAL AI Prediction Distribution:",
            counts
        );

    } catch(error) {

        alert(
            "DIAGNOSIS ERROR ❌\n\n" +
            error.message
        );

    } finally {

        validationX.dispose();

    }
}

// ========================================
// REAL AI — PHASE 3F
// ACTUAL TARGET DISTRIBUTION
// ========================================

function getTargetDistribution() {

    let split = buildMLTrainValidationSet();

    if (!split.ready) {
        alert("DATA NOT READY ❌");
        return;
    }

    let trainCounts = [0,0,0,0,0,0,0,0,0,0];
    let validationCounts = [0,0,0,0,0,0,0,0,0,0];

    split.trainTargets.forEach(function(value) {

        value = Number(value);

        if (value >= 0 && value <= 9) {
            trainCounts[value]++;
        }

    });

    split.validationTargets.forEach(function(value) {

        value = Number(value);

        if (value >= 0 && value <= 9) {
            validationCounts[value]++;
        }

    });

    let trainText = "";
    let validationText = "";

    for (let i = 0; i <= 9; i++) {

        trainText +=
            i + " = " + trainCounts[i] + "\n";

        validationText +=
            i + " = " + validationCounts[i] + "\n";

    }

    alert(
        "REAL AI — TARGET DISTRIBUTION\n\n" +

        "TRAINING (" +
        split.trainSamples +
        ")\n\n" +

        trainText +

        "\nVALIDATION (" +
        split.validationSamples +
        ")\n\n" +

        validationText
    );

    console.log(
        "TRAIN TARGET DISTRIBUTION:",
        trainCounts
    );

    console.log(
        "VALIDATION TARGET DISTRIBUTION:",
        validationCounts
    );

    return {
        train: trainCounts,
        validation: validationCounts
    };
}

// ========================================
// REAL AI — PHASE 3G
// VALIDATION DATA DIAGNOSTIC
// ========================================

function diagnoseValidationDataset() {

    let split = buildMLTrainValidationSet();

    if (!split.ready) {
        alert("DATA NOT READY ❌");
        return;
    }

    let counts = [0,0,0,0,0,0,0,0,0,0];
    let invalid = [];

    split.validationTargets.forEach(function(value, index) {

        let n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 0 &&
            n <= 9
        ) {

            counts[n]++;

        } else {

            invalid.push({
                index: index,
                value: value
            });

        }

    });

    let totalValid = counts.reduce(
        (sum, value) => sum + value,
        0
    );

    let text = "";

    for (let i = 0; i <= 9; i++) {

        text +=
            i + " = " + counts[i] + "\n";

    }

    text +=
        "\nValidation Samples = " +
        split.validationTargets.length;

    text +=
        "\nValid Targets = " +
        totalValid;

    text +=
        "\nInvalid Targets = " +
        invalid.length;

    if (invalid.length > 0) {

        text += "\n\nINVALID VALUES:\n";

        invalid.slice(0, 20).forEach(function(item) {

            text +=
                "[" +
                item.index +
                "] = " +
                String(item.value) +
                "\n";

        });

    }

    alert(
        "PHASE 3G — VALIDATION DIAGNOSTIC\n\n" +
        text
    );

    console.log(
        "Validation Targets:",
        split.validationTargets
    );

    console.log(
        "Validation Counts:",
        counts
    );

    console.log(
        "Invalid Targets:",
        invalid
    );

    return {
        counts: counts,
        valid: totalValid,
        invalid: invalid
    };
}

// ========================================
// REAL AI — PHASE 3H
// ACTUAL vs PREDICTED
// ========================================

async function diagnoseActualVsPredicted() {

    if (!realAIModel) {
        alert("REAL AI MODEL NOT READY ❌");
        return;
    }

    let split = buildMLTrainValidationSet();

    if (!split.ready) {
        alert("VALIDATION DATA NOT READY ❌");
        return;
    }

    let validationX = tf.tensor2d(
        split.validationInputs,
        [split.validationInputs.length, 5]
    );

    try {

        let predictionTensor =
            realAIModel.predict(validationX);

        let predictions =
            await predictionTensor.array();

        let output = "";
        let correct = 0;

        let limit = Math.min(
            20,
            predictions.length
        );

        for (let i = 0; i < limit; i++) {

            let row = predictions[i];

            let predicted =
                row.indexOf(Math.max(...row));

            let actual =
                Number(split.validationTargets[i]);

            let status =
                predicted === actual
                ? "✅ CORRECT"
                : "❌ WRONG";

            if (predicted === actual) {
                correct++;
            }

            output +=
                (i + 1) +
                ". Actual = " +
                actual +
                " | Predicted = " +
                predicted +
                " | " +
                status +
                "\n";
        }

        alert(
            "PHASE 3H\n\n" +
            "First " + limit +
            " Validation Samples\n\n" +
            output +
            "\nCorrect = " +
            correct +
            "/" +
            limit
        );

        console.log(
            "=== ACTUAL VS PREDICTED ==="
        );

        console.table(
            predictions.map(
                (row, index) => ({
                    actual:
                        Number(
                            split.validationTargets[index]
                        ),

                    predicted:
                        row.indexOf(
                            Math.max(...row)
                        )
                })
            ).slice(0, 20)
        );

    } catch (error) {

        console.error(error);

        alert(
            "PHASE 3H ERROR ❌\n\n" +
            error.message
        );

    } finally {

        validationX.dispose();

        if (typeof predictionTensor !== "undefined") {
            predictionTensor.dispose();
        }

    }
}

// ========================================
// REAL AI — PHASE 3I
// CONFUSION MATRIX DIAGNOSTIC
// ========================================

async function diagnoseConfusionMatrix() {

    if (!realAIModel) {
        alert("REAL AI MODEL NOT READY ❌");
        return;
    }

    let split = buildMLTrainValidationSet();

    if (!split.ready) {
        alert("VALIDATION DATA NOT READY ❌");
        return;
    }

    let validationX = tf.tensor2d(
        split.validationInputs,
        [split.validationInputs.length, 5]
    );

    let predictionTensor = null;

    try {

        predictionTensor =
            realAIModel.predict(validationX);

        let predictions =
            await predictionTensor.array();

        // rows = Actual
        // columns = Predicted

        let matrix = Array.from(
            { length: 10 },
            () => Array(10).fill(0)
        );

        for (let i = 0; i < predictions.length; i++) {

            let actual =
                Number(split.validationTargets[i]);

            let predicted =
                predictions[i].indexOf(
                    Math.max(...predictions[i])
                );

            if (
                Number.isInteger(actual) &&
                actual >= 0 &&
                actual <= 9 &&
                predicted >= 0 &&
                predicted <= 9
            ) {
                matrix[actual][predicted]++;
            }
        }

        let output =
            "Actual → Predicted\n\n";

        for (let actual = 0; actual <= 9; actual++) {

            output +=
                "Actual " + actual + " → ";

            let rowTotal = 0;

            for (let predicted = 0; predicted <= 9; predicted++) {

                if (matrix[actual][predicted] > 0) {

                    output +=
                        predicted +
                        "(" +
                        matrix[actual][predicted] +
                        ") ";

                }

                rowTotal += matrix[actual][predicted];
            }

            output +=
                "| Total = " +
                rowTotal +
                "\n";
        }

        alert(
            "PHASE 3I — CONFUSION MATRIX\n\n" +
            output
        );

        console.table(matrix);

    } catch (error) {

        console.error(error);

        alert(
            "PHASE 3I ERROR ❌\n\n" +
            error.message
        );

    } finally {

        validationX.dispose();

        if (predictionTensor) {
            predictionTensor.dispose();
        }
    }
}

// ========================================
// REAL AI — PHASE 3J
// FIXED VALIDATION + CLASS DIAGNOSTIC
// ========================================

let phase3JValidationSet = null;

function createFixedPhase3JSet() {

    if (phase3JValidationSet) {
        return phase3JValidationSet;
    }

    const split = buildMLTrainValidationSet();

    if (!split || !split.ready) {
        alert("PHASE 3J ❌ DATASET NOT READY");
        return null;
    }

    phase3JValidationSet = {
        inputs: split.validationInputs.map(row => [...row]),
        targets: [...split.validationTargets]
    };

    return phase3JValidationSet;
}


window.runPhase3J = async function () {

    if (!realAIModel) {
        alert("PHASE 3J ❌ MODEL NOT READY");
        return;
    }

    const fixed = createFixedPhase3JSet();

    if (!fixed) return;

    let xTensor = null;
    let predictionTensor = null;

    try {

        xTensor = tf.tensor2d(
            fixed.inputs,
            [fixed.inputs.length, 5],
            "float32"
        );

        predictionTensor =
            realAIModel.predict(xTensor);

        const predictions =
            await predictionTensor.array();

        const classCount = 10;

        const actualCount =
            Array(classCount).fill(0);

        const predictedCount =
            Array(classCount).fill(0);

        const correctCount =
            Array(classCount).fill(0);

        for (let i = 0; i < fixed.targets.length; i++) {

            const actual =
                Number(fixed.targets[i]);

            const predicted =
                predictions[i].indexOf(
                    Math.max(...predictions[i])
                );

            if (
                actual >= 0 &&
                actual < classCount
            ) {
                actualCount[actual]++;
            }

            if (
                predicted >= 0 &&
                predicted < classCount
            ) {
                predictedCount[predicted]++;
            }

            if (actual === predicted) {
                correctCount[actual]++;
            }
        }

        let report =
            "PHASE 3J — FIXED DATASET DIAGNOSTIC\n\n";

        report +=
            "Validation Samples = " +
            fixed.targets.length +
            "\n\n";

        report += "CLASS | ACTUAL | PREDICTED | CORRECT | ACCURACY\n";

        for (let c = 0; c < classCount; c++) {

            const accuracy =
                actualCount[c] > 0
                    ? ((correctCount[c] / actualCount[c]) * 100)
                        .toFixed(2)
                    : "0.00";

            report +=
                c +
                " | " +
                actualCount[c] +
                " | " +
                predictedCount[c] +
                " | " +
                correctCount[c] +
                " | " +
                accuracy +
                "%\n";
        }

        console.log("=== PHASE 3J ===");
        console.log("Actual Count:", actualCount);
        console.log("Predicted Count:", predictedCount);
        console.log("Correct Count:", correctCount);

        alert(report);

    } catch (error) {

        console.error("PHASE 3J ERROR:", error);

        alert(
            "PHASE 3J ERROR ❌\n\n" +
            error.message
        );

    } finally {

        if (xTensor) {
            xTensor.dispose();
        }

        if (predictionTensor) {
            predictionTensor.dispose();
        }
    }
};

// ========================================
// REAL AI — PHASE 3K
// INPUT / TARGET ALIGNMENT DIAGNOSTIC
// ========================================

window.runPhase3K = function () {

    const split = buildMLTrainValidationSet();

    if (!split || !split.ready) {
        alert("PHASE 3K ❌ DATASET NOT READY");
        return;
    }

    let report =
        "PHASE 3K — INPUT FEATURE DIAGNOSTIC\n\n" +
        "Training Samples = " +
        split.trainInputs.length +
        "\nValidation Samples = " +
        split.validationInputs.length +
        "\n\n";

    report += "FIRST 10 TRAINING SAMPLES\n\n";

    const trainLimit = Math.min(
        10,
        split.trainInputs.length
    );

    for (let i = 0; i < trainLimit; i++) {

        const input = split.trainInputs[i];
        const target = split.trainTargets[i];

        report +=
            (i + 1) +
            ". Input = [" +
            input.join(",") +
            "]" +
            " → Target = " +
            target +
            "\n";
    }

    report += "\nFIRST 10 VALIDATION SAMPLES\n\n";

    const validationLimit = Math.min(
        10,
        split.validationInputs.length
    );

    for (let i = 0; i < validationLimit; i++) {

        const input =
            split.validationInputs[i];

        const target =
            split.validationTargets[i];

        report +=
            (i + 1) +
            ". Input = [" +
            input.join(",") +
            "]" +
            " → Target = " +
            target +
            "\n";
    }

    console.log(
        "=== PHASE 3K TRAIN INPUTS ===",
        split.trainInputs.slice(0, 10)
    );

    console.log(
        "=== PHASE 3K TRAIN TARGETS ===",
        split.trainTargets.slice(0, 10)
    );

    console.log(
        "=== PHASE 3K VALIDATION INPUTS ===",
        split.validationInputs.slice(0, 10)
    );

    console.log(
        "=== PHASE 3K VALIDATION TARGETS ===",
        split.validationTargets.slice(0, 10)
    );

    alert(report);
};

// ========================================
// REAL AI — PHASE 3L
// INPUT NORMALIZATION
// ========================================

function normalizeRealAIInput(row) {

    if (!Array.isArray(row)) {
        return [];
    }

    return row.map(function(value) {

        let n = Number(value);

        if (!Number.isFinite(n)) {
            n = 0;
        }

        n = Math.max(0, Math.min(9, n));

        return n / 9;

    });
}


function normalizeRealAIInputs(rows) {

    if (!Array.isArray(rows)) {
        return [];
    }

    return rows.map(function(row) {
        return normalizeRealAIInput(row);
    });
}


window.testPhase3LNormalization = function() {

    const split = buildMLTrainValidationSet();

    if (!split || !split.ready) {

        alert(
            "PHASE 3L ❌\n" +
            "DATASET NOT READY"
        );

        return;
    }

    const trainNormalized =
        normalizeRealAIInputs(
            split.trainInputs
        );

    const validationNormalized =
        normalizeRealAIInputs(
            split.validationInputs
        );

    let report =
        "PHASE 3L — NORMALIZATION TEST\n\n" +

        "Training Samples = " +
        trainNormalized.length +

        "\nValidation Samples = " +
        validationNormalized.length +

        "\n\nFIRST 5 TRAINING INPUTS:\n";

    for (
        let i = 0;
        i < Math.min(5, trainNormalized.length);
        i++
    ) {

        report +=
            JSON.stringify(
                trainNormalized[i]
            ) +
            "\n";
    }

    report +=
        "\nFIRST 5 VALIDATION INPUTS:\n";

    for (
        let i = 0;
        i < Math.min(5, validationNormalized.length);
        i++
    ) {

        report +=
            JSON.stringify(
                validationNormalized[i]
            ) +
            "\n";
    }

    console.log(
        "PHASE 3L TRAIN NORMALIZED:",
        trainNormalized.slice(0, 5)
    );

    console.log(
        "PHASE 3L VALIDATION NORMALIZED:",
        validationNormalized.slice(0, 5)
    );

    alert(report);
};

// ========================================
// REAL AI — PHASE 3M
// NORMALIZED MODEL TRAINING
// ========================================

let phase3MModel = null;
let phase3MTrainingRunning = false;

async function createPhase3MModel() {

    const model = tf.sequential();

    model.add(tf.layers.dense({
        inputShape: [5],
        units: 32,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 16,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 10,
        activation: "softmax"
    }));

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: "sparseCategoricalCrossentropy",
        metrics: ["accuracy"]
    });

    return model;
}

// ========================================
// PHASE 3 — TENSORFLOW DEMO PREDICTION
// ========================================

async function runTensorFlowDemo(input) {

    if (typeof tf === "undefined") {
        console.error("TensorFlow.js not loaded.");
        return null;
    }

    if (!phase3MModel) {
        console.warn("Phase 3M model is not trained.");
        return null;
    }

    if (!Array.isArray(input) || input.length !== 5) {
        console.warn("Exactly 5 input values required.");
        return null;
    }

    const normalizedInput = input.map(function (value) {
        return Number(value) / 9;
    });

    const inputTensor = tf.tensor2d(
        [normalizedInput],
        [1, 5],
        "float32"
    );

    let outputTensor = null;

    try {

        outputTensor =
            phase3MModel.predict(inputTensor);

        const probabilities =
            await outputTensor.array();

        console.log(
            "TensorFlow Demo Output:",
            probabilities[0]
        );

        return probabilities[0];

    } finally {

        inputTensor.dispose();

        if (outputTensor) {
            outputTensor.dispose();
        }
    }
}

function testTensorFlowDemo() {

    if (typeof tf === "undefined") {
        alert("❌ TensorFlow.js load nahi hua.");
        return;
    }

    if (!phase3MModel) {
        alert(
            "❌ Phase 3M model ready nahi hai.\n\n" +
            "Pehle model training complete karo."
        );
        return;
    }

    const testInput = [1, 2, 3, 4, 5];

    runTensorFlowDemo(testInput)
        .then(function (probabilities) {

            if (!probabilities) {
                alert("❌ Model output nahi mila.");
                return;
            }

            const highest =
                Math.max(...probabilities);

            const classIndex =
                probabilities.indexOf(highest);

            alert(
                "TENSORFLOW DEMO TEST ✅\n\n" +
                "Input: " +
                testInput.join(", ") +
                "\n\n" +
                "Output Classes: " +
                probabilities.length +
                "\n\n" +
                "Highest Probability: " +
                Math.round(highest * 100) +
                "%\n\n" +
                "Highest Class: " +
                classIndex
            );

        })
        .catch(function (error) {

            console.error(
                "TensorFlow demo test error:",
                error
            );

            alert(
                "❌ TensorFlow test failed.\n\n" +
                error.message
            );
        });
}

function showTensorFlowTest() {

    const resultBox =
        document.getElementById("result");

    if (!resultBox) {
        alert("Result box nahi mila.");
        return;
    }

    resultBox.innerHTML =
        "<h3>🧠 TensorFlow AI Test</h3>" +
        "<p>Model check ho raha hai...</p>";

    if (typeof tf === "undefined") {

        resultBox.innerHTML =
            "<h3>❌ TensorFlow.js</h3>" +
            "<p>TensorFlow.js load nahi hua.</p>";

        return;
    }

    if (!phase3MModel) {

        resultBox.innerHTML =
            "<h3>⚠️ Model Ready Nahi Hai</h3>" +
            "<p>Pehle Phase 3M training complete karo.</p>";

        return;
    }

    runTensorFlowDemo([1, 2, 3, 4, 5])
        .then(function (probabilities) {

            if (!probabilities) {
                return;
            }

            const highest =
                Math.max(...probabilities);

            const classIndex =
                probabilities.indexOf(highest);

            resultBox.innerHTML =
                "<h3>✅ TensorFlow Model Working</h3>" +
                "<p>Output Classes: " +
                probabilities.length +
                "</p>" +
                "<p>Highest Class: <b>" +
                classIndex +
                "</b></p>" +
                "<p>Highest Probability: <b>" +
                Math.round(highest * 100) +
                "%</b></p>";

        })
        .catch(function (error) {

            console.error(error);

            resultBox.innerHTML =
                "<h3>❌ TensorFlow Test Failed</h3>" +
                "<p>" +
                error.message +
                "</p>";
        });
}

window.trainPhase3M = async function () {

    alert("PHASE 3M BUTTON WORKING");
    console.log("PHASE 3M BUTTON CLICKED");
    
    if (phase3MTrainingRunning) {

        alert(
            "PHASE 3M ⚠️\n\n" +
            "Training already running."
        );

        return;
    }

    const split =
        buildMLTrainValidationSet();

if (!split || !split.ready) {
    alert(
        "PHASE 3M DATASET NOT READY ❌\n\n" +
        (split?.message || "Unknown dataset error")
    );
    return;
}

alert(
    "PHASE 3M DATASET READY ✅\n\n" +
    "Training Samples: " +
    split.trainSamples +
    "\nValidation Samples: " +
    split.validationSamples
);
    
alert(
    "PHASE 3M DATASET CHECK\n\n" +
    "Ready = " +
    (split && split.ready ? "YES ✅" : "NO ❌") +
    "\n\nTrain Samples = " +
    (split && split.trainSamples !== undefined
        ? split.trainSamples
        : 0) +
    "\n\nValidation Samples = " +
    (split && split.validationSamples !== undefined
        ? split.validationSamples
        : 0)
);
    
    if (!split || !split.ready) {

        alert(
            "PHASE 3M ❌\n\n" +
            "Dataset not ready."
        );

        return;
    }

    phase3MTrainingRunning = true;

    let model = null;
    let trainX = null;
    let trainY = null;
    let valX = null;
    let valY = null;

    try {

        const normalizedTrain =
            normalizeRealAIInputs(
                split.trainInputs
            );

        const normalizedValidation =
            normalizeRealAIInputs(
                split.validationInputs
            );

        trainX = tf.tensor2d(
            normalizedTrain,
            [normalizedTrain.length, 5],
            "float32"
        );

        trainY = tf.tensor1d(
            split.trainTargets.map(Number),
            "float32"
        );

        valX = tf.tensor2d(
            normalizedValidation,
            [normalizedValidation.length, 5],
            "float32"
        );

        valY = tf.tensor1d(
            split.validationTargets.map(Number),
            "float32"
        );

        model =
            await createPhase3MModel();

        console.log(
            "REAL AI PHASE 3M MODEL CREATED"
        );

        alert(
            "REAL AI PHASE 3M\n\n" +
            "Normalized Model Ready\n\n" +
            "Training Samples = " +
            split.trainInputs.length +
            "\nValidation Samples = " +
            split.validationInputs.length
        );

        const history =
            await model.fit(
                trainX,
                trainY,
                {
                    epochs: 40,
                    batchSize: 32,
                    shuffle: false,
                    validationData: [
                        valX,
                        valY
                    ],
                    callbacks: {

                        onEpochEnd: async function (
                            epoch,
                            logs
                        ) {

                            if (
                                epoch === 0 ||
                                (epoch + 1) % 10 === 0
                            ) {

                                console.log(
                                    "Phase 3M Epoch",
                                    epoch + 1,
                                    logs
                                );
                            }

                            await tf.nextFrame();
                        }

                    }
                }
            );

        const finalTrainAccuracy =
            history.history.acc
                ? history.history.acc[
                    history.history.acc.length - 1
                  ]
                : history.history.accuracy[
                    history.history.accuracy.length - 1
                  ];

        const finalValAccuracy =
            history.history.val_acc
                ? history.history.val_acc[
                    history.history.val_acc.length - 1
                  ]
                : history.history.val_accuracy[
                    history.history.val_accuracy.length - 1
                  ];

        const finalValLoss =
            history.history.val_loss[
                history.history.val_loss.length - 1
            ];

        phase3MModel = model;

        model = null;

        alert(
            "REAL AI — PHASE 3M COMPLETE\n\n" +

            "Training Accuracy = " +
            (Number(finalTrainAccuracy) * 100)
                .toFixed(2) +
            "%\n\n" +

            "Validation Accuracy = " +
            (Number(finalValAccuracy) * 100)
                .toFixed(2) +
            "%\n\n" +

            "Validation Loss = " +
            Number(finalValLoss)
                .toFixed(4)
        );

    } catch (error) {

        console.error(
            "PHASE 3M ERROR:",
            error
        );

        alert(
            "PHASE 3M ERROR ❌\n\n" +
            error.message
        );

    } finally {

        if (model) {
            model.dispose();
        }

        if (trainX) trainX.dispose();
        if (trainY) trainY.dispose();
        if (valX) valX.dispose();
        if (valY) valY.dispose();

        phase3MTrainingRunning = false;
    }
};

// ========================================
// REAL AI — PHASE 3N
// NORMALIZED MODEL DIAGNOSTIC
// ========================================

window.runPhase3N = async function () {

    if (!phase3MModel) {
        alert("PHASE 3N ❌ NORMALIZED MODEL NOT READY");
        return;
    }

    const split = buildMLTrainValidationSet();

    if (!split || !split.ready) {
        alert("PHASE 3N ❌ DATASET NOT READY");
        return;
    }

    const normalizedValidation =
        normalizeRealAIInputs(
            split.validationInputs
        );

    let xTensor = null;
    let predictionTensor = null;

    try {

        xTensor = tf.tensor2d(
            normalizedValidation,
            [normalizedValidation.length, 5],
            "float32"
        );

        predictionTensor =
            phase3MModel.predict(xTensor);

        const predictions =
            await predictionTensor.array();

        const actualCount = Array(10).fill(0);
        const predictedCount = Array(10).fill(0);
        const correctCount = Array(10).fill(0);

        for (let i = 0; i < predictions.length; i++) {

            const actual =
                Number(split.validationTargets[i]);

            const predicted =
                predictions[i].indexOf(
                    Math.max(...predictions[i])
                );

            if (actual >= 0 && actual <= 9) {
                actualCount[actual]++;
            }

            if (predicted >= 0 && predicted <= 9) {
                predictedCount[predicted]++;
            }

            if (actual === predicted) {
                correctCount[actual]++;
            }
        }

        let report =
            "PHASE 3N — NORMALIZED MODEL DIAGNOSTIC\n\n" +
            "Validation Samples = " +
            split.validationTargets.length +
            "\n\n";

        report +=
            "CLASS | ACTUAL | PREDICTED | CORRECT | ACCURACY\n";

        for (let c = 0; c <= 9; c++) {

            const accuracy =
                actualCount[c] > 0
                    ? (
                        correctCount[c] /
                        actualCount[c] *
                        100
                    ).toFixed(2)
                    : "0.00";

            report +=
                c +
                " | " +
                actualCount[c] +
                " | " +
                predictedCount[c] +
                " | " +
                correctCount[c] +
                " | " +
                accuracy +
                "%\n";
        }

        alert(report);

        console.log(
            "PHASE 3N ACTUAL:",
            actualCount
        );

        console.log(
            "PHASE 3N PREDICTED:",
            predictedCount
        );

        console.log(
            "PHASE 3N CORRECT:",
            correctCount
        );

    } catch (error) {

        console.error(
            "PHASE 3N ERROR:",
            error
        );

        alert(
            "PHASE 3N ERROR ❌\n\n" +
            error.message
        );

    } finally {

        if (xTensor) {
            xTensor.dispose();
        }

        if (predictionTensor) {
            predictionTensor.dispose();
        }
    }
};

// ========================================
// REAL AI — PHASE 3O
// FIXED TRAIN / VALIDATION SNAPSHOT
// ========================================

let phase3OFixedSplit = null;

function createPhase3OFixedSplit() {

    if (phase3OFixedSplit !== null) {
        return phase3OFixedSplit;
    }

    const split = buildMLTrainValidationSet();

    if (!split || !split.ready) {
        alert("PHASE 3O ❌ DATASET NOT READY");
        return null;
    }

    phase3OFixedSplit = {

        trainInputs:
            split.trainInputs.map(row => [...row]),

        trainTargets:
            split.trainTargets.map(Number),

        validationInputs:
            split.validationInputs.map(row => [...row]),

        validationTargets:
            split.validationTargets.map(Number)

    };

    console.log(
        "PHASE 3O FIXED SPLIT CREATED",
        phase3OFixedSplit
    );

    return phase3OFixedSplit;
}


window.testPhase3OFixedSplit = function () {

    const fixed = createPhase3OFixedSplit();

    if (!fixed) {
        return;
    }

    alert(
        "PHASE 3O — FIXED SPLIT READY\n\n" +

        "Training Samples = " +
        fixed.trainInputs.length +

        "\nValidation Samples = " +
        fixed.validationInputs.length +

        "\n\nThis validation set is now LOCKED."
    );
};


window.resetPhase3OFixedSplit = function () {

    phase3OFixedSplit = null;

    alert(
        "PHASE 3O\n\n" +
        "Fixed split reset.\n" +
        "A new snapshot will be created next time."
    );
};

// ========================================
// REAL AI — PHASE 3P FIXED
// LOCKED VALIDATION BASELINE
// ========================================

window.runPhase3P = async function () {

    const fixed = phase3OFixedSplit;

    if (!fixed) {
        alert(
            "PHASE 3P ❌\n\n" +
            "Phase 3O locked dataset not found.\n\n" +
            "First create the Phase 3O lock."
        );
        return;
    }

    if (!phase3MModel) {
        alert(
            "PHASE 3P ❌\n\n" +
            "Normalized Model not ready.\n\n" +
            "Train Phase 3M first."
        );
        return;
    }

    let modelX = null;
    let predictionTensor = null;

    try {

        // ====================================
        // LOCKED VALIDATION ONLY
        // ====================================

        const validationInputs =
            normalizeRealAIInputs(
                fixed.validationInputs
            );

        const validationTargets =
            fixed.validationTargets;

        const validationCount =
            validationTargets.length;


        // ====================================
        // 1. RANDOM BASELINE
        // ====================================

        const randomBaseline = 10;


        // ====================================
        // 2. MOST FREQUENT BASELINE
        // ====================================

        const frequency =
            Array(10).fill(0);

        fixed.trainTargets.forEach(function (value) {

            const n = Number(value);

            if (n >= 0 && n <= 9) {
                frequency[n]++;
            }

        });

        let mostFrequent = 0;

        for (let i = 1; i <= 9; i++) {

            if (
                frequency[i] >
                frequency[mostFrequent]
            ) {
                mostFrequent = i;
            }

        }

        let frequencyCorrect = 0;

        validationTargets.forEach(function (actual) {

            if (
                Number(actual) ===
                mostFrequent
            ) {
                frequencyCorrect++;
            }

        });

        const frequencyAccuracy =
            (
                frequencyCorrect /
                validationCount
            ) * 100;


        // ====================================
        // 3. NORMALIZED NEURAL NETWORK
        // ====================================

        modelX = tf.tensor2d(
            validationInputs,
            [
                validationInputs.length,
                5
            ],
            "float32"
        );

        predictionTensor =
            phase3MModel.predict(modelX);

        const predictions =
            await predictionTensor.array();

        let neuralCorrect = 0;

        for (
            let i = 0;
            i < predictions.length;
            i++
        ) {

            const predicted =
                predictions[i].indexOf(
                    Math.max(...predictions[i])
                );

            const actual =
                Number(
                    validationTargets[i]
                );

            if (
                predicted === actual
            ) {
                neuralCorrect++;
            }
        }

        const neuralAccuracy =
            (
                neuralCorrect /
                validationCount
            ) * 100;


        // ====================================
        // REPORT
        // ====================================

        let report =
            "PHASE 3P — FIXED BASELINE\n\n";

        report +=
            "LOCKED VALIDATION = " +
            validationCount +
            "\n\n";

        report +=
            "Random Baseline = " +
            randomBaseline.toFixed(2) +
            "%\n";

        report +=
            "Most Frequent Number = " +
            mostFrequent +
            "\n";

        report +=
            "Frequency Baseline = " +
            frequencyAccuracy.toFixed(2) +
            "%\n";

        report +=
            "Neural Network = " +
            neuralAccuracy.toFixed(2) +
            "%\n\n";


        if (
            neuralAccuracy >
            frequencyAccuracy &&
            neuralAccuracy >
            randomBaseline
        ) {

            report +=
                "RESULT = NEURAL NETWORK BETTER ✅";

        } else {

            report +=
                "RESULT = NO CLEAR ADVANTAGE ⚠️";
        }


        console.log(
            "=== PHASE 3P FIXED ==="
        );

        console.log(
            "Locked Validation:",
            validationCount
        );

        console.log(
            "Random:",
            randomBaseline
        );

        console.log(
            "Most Frequent:",
            mostFrequent
        );

        console.log(
            "Frequency Accuracy:",
            frequencyAccuracy
        );

        console.log(
            "Neural Accuracy:",
            neuralAccuracy
        );


        alert(report);

    } catch (error) {

        console.error(
            "PHASE 3P ERROR:",
            error
        );

        alert(
            "PHASE 3P ERROR ❌\n\n" +
            error.message
        );

    } finally {

        if (modelX) {
            modelX.dispose();
        }

        if (predictionTensor) {
            predictionTensor.dispose();
        }
    }
};

