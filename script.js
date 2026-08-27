alert("Script Loaded");

let allResults =
JSON.parse(localStorage.getItem("allResults")) || [];

let aiWins =
Number(localStorage.getItem("aiWins")) || 0;

let aiLosses =
Number(localStorage.getItem("aiLosses")) || 0;

let nextPrediction = null;

let patternMemory =
    JSON.parse(localStorage.getItem("patternMemory")) || {};

let bigSmallMemory =
    JSON.parse(localStorage.getItem("bigSmallMemory")) || {};

let colorMemory =
    JSON.parse(localStorage.getItem("colorMemory")) || {};

let predictionHistory =
    JSON.parse(localStorage.getItem("predictionHistory")) || [];

// ========================================
// FIXED PREDICTION / RESULT FLOW
// ========================================

let pendingPrediction = null;
let pendingInput = null;


// ========================================
// ANALYZE AI
// ========================================

document.getElementById("analyzeBtn").onclick = function () {

    alert("Analyze Start");
    
    const input = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    // Validate
    if (
        input.some(
            n => !Number.isInteger(n) || n < 0 || n > 9
        )
    ) {
        alert("Please enter all 5 numbers between 0 and 9.");
        return;
    }


    // IMPORTANT:
    // Prediction ke waqt ke inputs ko freeze karo.
    pendingInput = [...input];


    // Current prediction calculate karo
    const prediction = getFinalPrediction();


    if (
        prediction === null ||
        prediction === undefined ||
        !Number.isInteger(Number(prediction))
    ) {
        alert("AI Prediction available nahi hai.");
        pendingPrediction = null;
        return;
    }


    pendingPrediction = Number(prediction);

    // Existing system variable
    nextPrediction = pendingPrediction;


    // ====================================
    // DISPLAY
    // ====================================

    const pattern = pendingInput.join(",");

    const hotCold =
        typeof getHotColdNumbers === "function"
            ? getHotColdNumbers()
            : { hot: null, cold: null };


    const trendScore =
        typeof getTrendScore === "function"
            ? getTrendScore()
            : 0;


    const aiScore =
        typeof getFinalAIScore === "function"
            ? getFinalAIScore()
            : 0;


    const confidence =
        typeof getPredictionConfidence === "function"
            ? getPredictionConfidence()
            : 0;


    document.getElementById("result").innerHTML = `

        <h2>AI Prediction 🔥</h2>

        Final Prediction :
        <b>${pendingPrediction}</b>

        <br><br>

        Color :
        <b>${getColorPrediction(pendingPrediction)}</b>

        <br><br>

        Big/Small :
        <b>${getBigSmallPrediction(pendingPrediction)}</b>

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


    // Debug
    document.getElementById("debugPattern").innerText =
        pattern;

    document.getElementById("debugPrediction").innerText =
        pendingPrediction;

    document.getElementById("debugSource").innerText =
        "🧠 AI";

    document.getElementById("debugMemory").innerText =
        "PENDING RESULT";


    updateStats();

    console.log(
        "PREDICTION CREATED",
        {
            input: pendingInput,
            prediction: pendingPrediction
        }
    );
};



// ========================================
// CHECK RESULT
// ========================================

document.getElementById("checkBtn").onclick = function () {

    // Prediction ke bina result check mat karo
    if (
        pendingPrediction === null ||
        pendingPrediction === undefined
    ) {

        alert(
            "Pehle Analyze AI dabao, phir Check Result dabao."
        );

        return;
    }


    if (!pendingInput || pendingInput.length !== 5) {

        alert(
            "Prediction input memory missing hai."
        );

        return;
    }


    const input = prompt(
        "Enter Actual Result (0-9)"
    );


    if (input === null) {
        return;
    }


    const actualResult = Number(input.trim());


    if (
        !Number.isInteger(actualResult) ||
        actualResult < 0 ||
        actualResult > 9
    ) {

        alert(
            "Please Enter Number Between 0 and 9"
        );

        return;
    }


    // ====================================
    // IMPORTANT:
    // Prediction ke waqt ka input preserve hai.
    // Actual result ko ab history mein save karo.
    // ====================================

    const prediction =
        Number(pendingPrediction);

    const predictionInput =
        [...pendingInput];


    // WIN / LOSS BEFORE RESET
    const isWin =
        prediction === actualResult;


    // ====================================
    // SAVE ACTUAL RESULT
    // ====================================

    allResults.unshift(actualResult);


    if (allResults.length > 1000) {
        allResults.pop();
    }


    localStorage.setItem(
        "allResults",
        JSON.stringify(allResults)
    );


    // ====================================
    // LEARNING
    //
    // IMPORTANT:
    // Learning function ko DOM ke current
    // values par depend nahi karne denge.
    // ====================================

    const oldInputs = [
        document.getElementById("n1").value,
        document.getElementById("n2").value,
        document.getElementById("n3").value,
        document.getElementById("n4").value,
        document.getElementById("n5").value
    ];


    // Prediction ke exact inputs restore
    document.getElementById("n1").value =
        predictionInput[0];

    document.getElementById("n2").value =
        predictionInput[1];

    document.getElementById("n3").value =
        predictionInput[2];

    document.getElementById("n4").value =
        predictionInput[3];

    document.getElementById("n5").value =
        predictionInput[4];


    // Learning memory
    if (
        typeof updateLearningMemory === "function"
    ) {

        updateLearningMemory(
            actualResult
        );
    }


    // Big/Small memory
    if (
        typeof updateBigSmallMemory === "function"
    ) {

        updateBigSmallMemory(
            actualResult
        );
    }


    // Color memory
    if (
        typeof updateColorMemory === "function"
    ) {

        updateColorMemory(
            actualResult
        );
    }


    // ====================================
    // PREDICTION HISTORY
    // ====================================

    if (
        typeof savePredictionHistory === "function"
    ) {

        savePredictionHistory(
            prediction,
            actualResult
        );
    }


    // ====================================
    // WIN / LOSS
    // ====================================

    const currentPattern =
        predictionInput.join(",");


    if (isWin) {

        aiWins++;

        localStorage.setItem(
            "aiWins",
            aiWins
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
            "✅ Prediction : " +
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
            aiLosses
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
            "❌ Prediction : " +
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


    // ====================================
    // AUTO SHIFT
    // ====================================

    document.getElementById("n5").value =
        document.getElementById("n4").value;

    document.getElementById("n4").value =
        document.getElementById("n3").value;

    document.getElementById("n3").value =
        document.getElementById("n2").value;

    document.getElementById("n2").value =
        document.getElementById("n1").value;

    document.getElementById("n1").value =
        actualResult;


    // ====================================
    // RESET PENDING PREDICTION
    // ====================================

    pendingPrediction = null;
    pendingInput = null;

    nextPrediction = null;


    document.getElementById(
        "debugSource"
    ).innerText = "RESULT SAVED";

    document.getElementById(
        "debugMemory"
    ).innerText = "UPDATED";


    updateStats();


    if (
        typeof updatePredictionHistoryTable ===
        "function"
    ) {

        updatePredictionHistoryTable();
    }


    console.log(
        "RESULT SAVED",
        {
            prediction: prediction,
            actual: actualResult,
            win: isWin,
            savedNumbers: allResults.length
        }
    );
};

function getMemoryPrediction(){

    let currentInput = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    let pattern = currentInput.join(",");

    if(!patternMemory[pattern]){
        return null;
    }

    let memoryNumbers = patternMemory[pattern].numbers;

    if(!memoryNumbers){
        return null;
    }

    let bestNumber = null;
    let maxCount = -1;

    for(let num in memoryNumbers){

        if(memoryNumbers[num] > maxCount){

            maxCount = memoryNumbers[num];
            bestNumber = Number(num);

        }

    }

    return bestNumber;

}

function getPredictionConfidence(){

    let currentInput = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    for(let len = 5; len >= 2; len--){

        let pattern = currentInput.slice(0,len).join(",");

        if(!patternMemory[pattern]) continue;

        let total = patternMemory[pattern].total;

        let memoryNumbers = patternMemory[pattern].numbers;

        let best = 0;

        for(let num in memoryNumbers){

            if(memoryNumbers[num] > best){
                best = memoryNumbers[num];
            }

        }
        
        return Math.round((best / total) * 100);

    }

    return 0;

}

function selfLearning(pattern, isWin){

    if(!patternMemory[pattern]) return;

    if(patternMemory[pattern].learning === undefined){
        patternMemory[pattern].learning = 50;
    }

    if(isWin){

        patternMemory[pattern].learning += 2;

    }else{

        patternMemory[pattern].learning -= 2;

    }

    if(patternMemory[pattern].learning > 100){
        patternMemory[pattern].learning = 100;
    }

    if(patternMemory[pattern].learning < 0){
        patternMemory[pattern].learning = 0;
    }

    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

}

function updatePredictionHistoryTable(){

    let html = "";

    predictionHistory.forEach(item=>{

        html += `
        <div style="
        border-bottom:1px solid #444;
        padding:8px;
        ">

        ${item.time}

        |

        🎯 ${item.prediction}

        →

        ${item.result}

        |

        ${item.status}

        </div>
        `;

    });

    document.getElementById(
        "predictionHistoryTable"
    ).innerHTML = html;

}

document.getElementById("resetMemoryBtn").onclick = function(){

    if(!confirm("Kya aap AI Memory Reset karna chahte hain?")){
        return;
    }

    localStorage.removeItem("patternMemory");
    localStorage.removeItem("allResults");
    localStorage.removeItem("predictionHistory");
    localStorage.removeItem("bigSmallMemory");
    localStorage.removeItem("colorMemory");
    localStorage.removeItem("aiWins");
    localStorage.removeItem("aiLosses");

    alert("AI Memory Successfully Reset ✅");

    location.reload();

patternMemory = {};
allResults = [];
predictionHistory = [];
bigSmallMemory = {};
colorMemory = {};

};

function updateRewardPenalty(pattern, isWin){

    if(!patternMemory[pattern]) return;

    if(isWin){

        patternMemory[pattern].reward++;
        patternMemory[pattern].trust += 1;
        patternMemory[pattern].patternWeight += 1;

    }else{

        patternMemory[pattern].penalty++;
        patternMemory[pattern].trust -= 1;
        patternMemory[pattern].patternWeight -= 1;

    }

    // Limit
    patternMemory[pattern].trust =
    Math.max(0, Math.min(100, patternMemory[pattern].trust));

    patternMemory[pattern].patternWeight =
    Math.max(0, Math.min(100, patternMemory[pattern].patternWeight));

    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

}

function updateLearningAge(){

    for(let pattern in patternMemory){

        patternMemory[pattern].learningAge++;

        if(patternMemory[pattern].learningAge > 100){
            patternMemory[pattern].learningAge = 100;
        }

    }

    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

}

// =========================
// AI DATA
// =========================

updateStats();

function testMemoryStoragePhone() {

    let keys = Object.keys(patternMemory);

    alert(
        "MEMORY COUNT = " + keys.length +
        "\n\nFIRST PATTERN = " +
        (keys.length > 0 ? keys[0] : "NONE")
    );
}

// ========================================
// REAL AI — PHASE 3A DATASET
// ========================================

function buildMLDataset() {

    let history = Array.isArray(allResults)
        ? allResults
        : [];

    if (history.length < 20) {
        return {
            samples: 0,
            message: "Not enough historical data"
        };
    }

    let X = [];
    let Y = [];

    // allResults newest -> oldest hai.
    // Training ke liye chronological order use karenge.
    let data = [...history].reverse();

    for (let i = 5; i < data.length; i++) {

        let input = [
            data[i - 5],
            data[i - 4],
            data[i - 3],
            data[i - 2],
            data[i - 1]
        ];

        let target = data[i];

        // Sirf valid results
        if (
            input.some(n => !Number.isFinite(n)) ||
            !Number.isFinite(target)
        ) {
            continue;
        }

        X.push(input);
        Y.push(target);
    }

    return {
        samples: X.length,
        inputs: X,
        targets: Y
    };
}


// Phone/Acode test
function showMLDatasetStatus() {

    let dataset = buildMLDataset();

    alert(
        "REAL AI DATASET\n\n" +
        "Total History = " + allResults.length +
        "\nTraining Samples = " + dataset.samples +
        "\n\n" +
        (
            dataset.samples > 0
            ? "DATASET READY ✅"
            : "NOT ENOUGH DATA ⚠️"
        )
    );
}

// ========================================
// REAL AI — PHASE 3B
// TRAIN / VALIDATION SPLIT
// ========================================

function buildMLTrainValidationSet() {

    let dataset = buildMLDataset();

    if (!dataset.inputs || dataset.inputs.length < 20) {
        return {
            ready: false,
            message: "Not enough samples"
        };
    }

    let total = dataset.inputs.length;

    // Last 20% = validation
    let validationSize = Math.max(
        1,
        Math.floor(total * 0.20)
    );

    let trainSize = total - validationSize;

    return {

        ready: true,

        trainInputs:
            dataset.inputs.slice(0, trainSize),

        trainTargets:
            dataset.targets.slice(0, trainSize),

        validationInputs:
            dataset.inputs.slice(trainSize),

        validationTargets:
            dataset.targets.slice(trainSize),

        trainSamples: trainSize,

        validationSamples: validationSize

    };
}


// Phone/Acode test
function showMLSplitStatus() {

    let split = buildMLTrainValidationSet();

    if (!split.ready) {

        alert(
            "REAL AI SPLIT\n\n" +
            "❌ " + split.message
        );

        return;
    }

    alert(
        "REAL AI — PHASE 3B\n\n" +

        "Total Samples = " +
        (split.trainSamples +
         split.validationSamples) +

        "\n\nTraining Samples = " +
        split.trainSamples +

        "\nValidation Samples = " +
        split.validationSamples +

        "\n\nTRAIN / VALIDATION READY ✅"
    );
}
