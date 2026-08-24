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
