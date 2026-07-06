window.onerror = function(msg, url, line){
    alert("ERROR: " + msg + " | Line: " + line);
};

alert("Script Loaded");

let allResults =
JSON.parse(localStorage.getItem("allResults")) || [];

let patternMemory =
JSON.parse(localStorage.getItem("patternMemory")) || {};

let aiWins =
Number(localStorage.getItem("aiWins")) || 0;

let aiLosses =
Number(localStorage.getItem("aiLosses")) || 0;

let nextPrediction = null;

document.getElementById("analyzeBtn").onclick = function () {

    let n1 = Number(document.getElementById("n1").value);
    let n2 = Number(document.getElementById("n2").value);
    let n3 = Number(document.getElementById("n3").value);
    let n4 = Number(document.getElementById("n4").value);
    let n5 = Number(document.getElementById("n5").value);

    let numbers = [n1, n2, n3, n4, n5];

    // Save history
    allResults.push(...numbers);

    localStorage.setItem(
        "allResults",
        JSON.stringify(allResults)
    );

    let memoryPrediction = getMemoryPrediction();

    let confidence = getPredictionConfidence();
    
if(memoryPrediction){

    document.getElementById("result").innerHTML = `
    <h2>AI Prediction 🔥</h2>

    Memory Prediction :
    <b>${memoryPrediction}</b>

<br><br>

Confidence :
<b>${confidence}%</b>

    Total Saved Numbers :
    ${allResults.length}
    `;

}else{

    nextPrediction = Math.floor(Math.random() * 10);

    document.getElementById("result").innerHTML = `
    <h2>AI Prediction 🔥</h2>

    Next Number :
    <b>${nextPrediction}</b>

    <br><br>

    Total Saved Numbers :
    ${allResults.length}
    `;

}

    console.log(allResults);

};

document.getElementById("checkBtn").onclick = function(){

    let actualResult = Number(
        prompt("Enter Actual Result")
    );

    if(isNaN(actualResult)){

        alert("Please Enter Valid Number");
        return;

    }

    updateLearningMemory(actualResult);

    if(actualResult === nextPrediction){

        aiWins++;

        localStorage.setItem("aiWins", aiWins);

        alert("AI WON ✅");

    }else{

        aiLosses++;

        localStorage.setItem("aiLosses", aiLosses);

        alert("AI LOST ❌");

    }

};

function updateLearningMemory(actualResult){

    let pattern =
    allResults.slice(-6).join(",");

    if(!patternMemory[pattern]){

        patternMemory[pattern] = {

            total:0,

            GREEN:0,
            RED:0,

            BIG:0,
            SMALL:0,

            GREEN_BIG:0,
            GREEN_SMALL:0,

            RED_BIG:0,
            RED_SMALL:0,

            numbers:{}
        
        };

    }

    let color =
    [1,3,7,9].includes(actualResult)
    ? "GREEN"
    : "RED";

    let bigSmall =
    actualResult >= 5
    ? "BIG"
    : "SMALL";

    patternMemory[pattern].total++;

    patternMemory[pattern][color]++;

    patternMemory[pattern][bigSmall]++;

    patternMemory[pattern][color + "_" + bigSmall]++;

if(!patternMemory[pattern].numbers[actualResult]){

    patternMemory[pattern].numbers[actualResult]=0;

}

patternMemory[pattern].numbers[actualResult]++;

    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

    console.log(patternMemory);

}

function getMemoryPrediction(){

    let pattern =
    allResults.slice(-6).join(",");

    if(!patternMemory[pattern]){
        return null;
    }

    let numbers =
    patternMemory[pattern].numbers;

    if(!numbers){
        return null;
    }

    let bestNumber = null;
    let maxCount = -1;

    for(let num in numbers){

        if(numbers[num] > maxCount){

            maxCount = numbers[num];
            bestNumber = Number(num);

        }

    }

    return bestNumber;

}

function getPredictionConfidence(){

    let pattern =
    allResults.slice(-6).join(",");

    if(!patternMemory[pattern]){

        return 0;

    }

    let total =
    patternMemory[pattern].total;

    let numbers =
    patternMemory[pattern].numbers;

    let best = 0;

    for(let num in numbers){

        if(numbers[num] > best){

            best = numbers[num];

        }

    }

    return Math.round((best / total) * 100);

}

// =========================
// AI DATA
// =========================

