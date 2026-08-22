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

