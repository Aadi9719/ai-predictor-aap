alert("Memory Loaded");

let patternMemory =
    JSON.parse(localStorage.getItem("patternMemory")) || {};

// ========================================
// SEQUENCE-ALIGNED PATTERN MEMORY
// Pattern = inputs BEFORE the actual result
// nextNumbers = result that followed that pattern
// ========================================

function updateLearningMemory(actualResult) {

    actualResult = Number(actualResult);

    if (
        !Number.isInteger(actualResult) ||
        actualResult < 0 ||
        actualResult > 9
    ) {
        return;
    }

    /*
       IMPORTANT:

       allResults mein actual result already unshift()
       ho chuka hai.

       Isliye:
       allResults[0] = CURRENT actual result
       allResults[1] = previous result
       allResults[2] = older result
       ...

       Prediction se pehle jo 5 inputs the,
       unko current actual result se associate karna hai.
    */

    const currentInput = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    // Validate inputs
    if (
        currentInput.length !== 5 ||
        currentInput.some(
            n => !Number.isInteger(n) || n < 0 || n > 9
        )
    ) {
        console.warn(
            "Learning skipped: invalid input",
            currentInput
        );
        return;
    }

    // ------------------------------------
    // Learn 2, 3, 4 and 5-number patterns
    // ------------------------------------

    for (let len = 2; len <= 5; len++) {

        const pattern =
            currentInput
                .slice(0, len)
                .join(",");

        if (!pattern) continue;

        // Create pattern
        if (!patternMemory[pattern]) {

            patternMemory[pattern] = {

                total: 0,

                GREEN: 0,
                RED: 0,

                BIG: 0,
                SMALL: 0,

                GREEN_BIG: 0,
                GREEN_SMALL: 0,

                RED_BIG: 0,
                RED_SMALL: 0,

                numbers: {},
                nextNumbers: {},

                win: 0,
                loss: 0,

                confidence: 0,
                stability: 0,
                colorStability: 0,

                bsStreak: 0,
                colorStreak: 0,

                lastBigSmall: "",
                lastColor: "",

                repeatCount: 0,
                lastSeen: 0,

                trust: 50,
                patternWeight: 50,
                rank: 0,

                reward: 0,
                penalty: 0,

                learningAge: 0,
                lastPrediction: null,

                successStreak: 0,
                failStreak: 0,

                numberWeight: {},
                bigSmallWeight: {},
                colorWeight: {}
            };
        }

        const memory =
            patternMemory[pattern];

        // ------------------------------------
        // Current actual result classification
        // ------------------------------------

        const color =
            [1, 3, 7, 9].includes(actualResult)
                ? "GREEN"
                : "RED";

        const bigSmall =
            actualResult >= 5
                ? "BIG"
                : "SMALL";

        // ------------------------------------
        // Total observations
        // ------------------------------------

        memory.total++;

        // ------------------------------------
        // Number frequency
        // ------------------------------------

        if (
            memory.numbers[actualResult] === undefined
        ) {
            memory.numbers[actualResult] = 0;
        }

        memory.numbers[actualResult]++;

        // ------------------------------------
        // NEXT NUMBER RELATIONSHIP
        //
        // This is now correctly:
        //
        // input pattern → actual result
        //
        // The actual result is NOT inserted into
        // the pattern itself.
        // ------------------------------------

        if (
            memory.nextNumbers[actualResult] === undefined
        ) {
            memory.nextNumbers[actualResult] = 0;
        }

        memory.nextNumbers[actualResult]++;

        // ------------------------------------
        // Number weight
        // ------------------------------------

        if (
            memory.numberWeight[actualResult] === undefined
        ) {
            memory.numberWeight[actualResult] = 50;
        }

        memory.numberWeight[actualResult] += 1;

        // ------------------------------------
        // Big / Small
        // ------------------------------------

        memory[bigSmall]++;

        const bsTotal =
            memory.BIG +
            memory.SMALL;

        if (bsTotal > 0) {

            const bestBS =
                Math.max(
                    memory.BIG,
                    memory.SMALL
                );

            memory.stability =
                Math.round(
                    (bestBS / bsTotal) * 100
                );
        }

        // ------------------------------------
        // Color
        // ------------------------------------

        memory[color]++;

        const colorTotal =
            memory.GREEN +
            memory.RED;

        if (colorTotal > 0) {

            const bestColor =
                Math.max(
                    memory.GREEN,
                    memory.RED
                );

            memory.colorStability =
                Math.round(
                    (bestColor / colorTotal) * 100
                );
        }

        // ------------------------------------
        // Combined color + Big/Small
        // ------------------------------------

        memory[
            color + "_" + bigSmall
        ]++;

        // ------------------------------------
        // Big/Small streak
        // ------------------------------------

        if (
            memory.lastBigSmall ===
            bigSmall
        ) {

            memory.bsStreak =
                (memory.bsStreak || 0) + 1;

        } else {

            memory.bsStreak = 1;
        }

        memory.lastBigSmall =
            bigSmall;

        // ------------------------------------
        // Color streak
        // ------------------------------------

        if (
            memory.lastColor ===
            color
        ) {

            memory.colorStreak =
                (memory.colorStreak || 0) + 1;

        } else {

            memory.colorStreak = 1;
        }

        memory.lastColor =
            color;

        // ------------------------------------
        // Confidence
        // ------------------------------------

        memory.confidence =
            Math.min(
                95,
                Math.round(memory.total * 2)
            );

        // ------------------------------------
        // Metadata
        // ------------------------------------

        memory.lastSeen =
            Date.now();

        memory.learningAge = 0;

        // ------------------------------------
        // Rank
        // ------------------------------------

        memory.rank =
            Math.round(

                (memory.trust * 0.30) +

                (memory.patternWeight * 0.30) +

                (memory.stability * 0.20) +

                (memory.colorStability * 0.20)

            );
    }

    // Save ONCE after all patterns are updated
    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

    console.log(
        "SEQUENCE MEMORY UPDATED",
        {
            input: currentInput,
            actual: actualResult
        }
    );
}

function updateBigSmallMemory(actualResult){

    let bsHistory = allResults
        .slice(1,9)
        .map(n => n >= 5 ? "B" : "S");

    for(let len = 2; len <= 8; len++){

        let pattern = bsHistory.slice(0,len).join(",");

        if(pattern.split(",").length < len) continue;

        if(!bigSmallMemory[pattern]){

            bigSmallMemory[pattern] = {
                total:0,
                next:{
                    B:0,
                    S:0
                }
            };

        }

        let nextType = actualResult >= 5 ? "B" : "S";

        bigSmallMemory[pattern].total++;
        bigSmallMemory[pattern].next[nextType]++;

    }

    localStorage.setItem(
        "bigSmallMemory",
        JSON.stringify(bigSmallMemory)
    );

}

function getBigSmallPredictionMemory(){

    let bsHistory = allResults
        .slice(0,8)
        .map(n => n >= 5 ? "B" : "S");

    for(let len=8; len>=2; len--){

        let pattern = bsHistory.slice(0,len).join(",");

        if(!bigSmallMemory[pattern]) continue;

        let next = bigSmallMemory[pattern].next;

        return next.B >= next.S ? "BIG" : "SMALL";

    }

    return null;

}

let colorMemory =
JSON.parse(localStorage.getItem("colorMemory")) || {};

function updateColorMemory(actualResult){

    let colorHistory = allResults
        .slice(1,9)
        .map(n => [1,3,7,9].includes(n) ? "G" : "R");

    for(let len = 2; len <= 8; len++){

        let pattern = colorHistory.slice(0,len).join(",");

        if(pattern.split(",").length < len) continue;

        if(!colorMemory[pattern]){

            colorMemory[pattern] = {

                total:0,

                next:{
                    G:0,
                    R:0
                }

            };

        }

        let nextColor =
        [1,3,7,9].includes(actualResult) ? "G" : "R";

        colorMemory[pattern].total++;

        colorMemory[pattern].next[nextColor]++;

    }

    localStorage.setItem(
        "colorMemory",
        JSON.stringify(colorMemory)
    );

}

function savePredictionHistory(prediction, actualResult){

    let status = (prediction == actualResult) ? "WIN" : "LOSS";

    predictionHistory.unshift({

        time: new Date().toLocaleTimeString(),

        prediction: prediction,

        result: actualResult,

        status: status

    });

    if(predictionHistory.length > 100){
        predictionHistory.pop();
    }

    localStorage.setItem(
        "predictionHistory",
        JSON.stringify(predictionHistory)
    );

}

function selfLearnBigSmall(pattern, predictedBS, actualResult){

    if(!patternMemory[pattern]){
        return;
    }

    let actualBS = actualResult >= 5 ? "BIG" : "SMALL";

    if(predictedBS === actualBS){

        patternMemory[pattern][predictedBS] += 2;

    }else{

        if(patternMemory[pattern][predictedBS] > 0){
            patternMemory[pattern][predictedBS]--;
        }

        patternMemory[pattern][actualBS] += 2;

    }

    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

}

function selfLearnColor(pattern, predictedColor, actualResult){

    if(!patternMemory[pattern]){
        return;
    }

    let actualColor =
    [1,3,7,9].includes(actualResult)
    ? "GREEN"
    : "RED";

    if(predictedColor.includes(actualColor)){

        patternMemory[pattern][actualColor] += 2;

    }else{

        let wrong =
        actualColor === "GREEN" ? "RED" : "GREEN";

        if(patternMemory[pattern][wrong] > 0){
            patternMemory[pattern][wrong]--;
        }

        patternMemory[pattern][actualColor] += 2;

    }

    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

}

let aiEngineWeight =
JSON.parse(localStorage.getItem("aiEngineWeight")) || {

    pattern : 40,

    bigSmall : 25,

    color : 20,

    trend : 15

};

function updateEngineWeight(isWin){

    if(isWin){

        aiEngineWeight.pattern += 1;
        aiEngineWeight.bigSmall += 1;
        aiEngineWeight.color += 1;
        aiEngineWeight.trend += 1;

    }else{

        aiEngineWeight.pattern =
        Math.max(10, aiEngineWeight.pattern - 1);

        aiEngineWeight.bigSmall =
        Math.max(10, aiEngineWeight.bigSmall - 1);

        aiEngineWeight.color =
        Math.max(10, aiEngineWeight.color - 1);

        aiEngineWeight.trend =
        Math.max(10, aiEngineWeight.trend - 1);

    }

    localStorage.setItem(
        "aiEngineWeight",
        JSON.stringify(aiEngineWeight)
    );

}

let aiEngineStats =
JSON.parse(localStorage.getItem("aiEngineStats")) || {

    pattern : { win:0, loss:0 },

    bigSmall : { win:0, loss:0 },

    color : { win:0, loss:0 },

    trend : { win:0, loss:0 }

};
