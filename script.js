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

    alert("Analyze Start");
    
    let n1 = Number(document.getElementById("n1").value);
    let n2 = Number(document.getElementById("n2").value);
    let n3 = Number(document.getElementById("n3").value);
    let n4 = Number(document.getElementById("n4").value);
    let n5 = Number(document.getElementById("n5").value);

    let numbers = [n1, n2, n3, n4, n5];

    // Save history
    //allResults.push(...numbers);

    localStorage.setItem(
        "allResults",
        JSON.stringify(allResults)
    );

    let memoryPrediction = getPatternPrediction();
let finalPrediction = getFinalPrediction();
let trendScore = getTrendScore();
let finalAIScore = getFinalAIScore();
let hotCold = getHotColdNumbers();
let trendPrediction = getTrendPrediction();
    
    if(memoryPrediction !== null){

    nextPrediction = memoryPrediction;

        memoryPrediction = nextPrediction;
        
    }
    
    let pattern = numbers.join(",");
    
if(memoryPrediction === null){

    memoryPrediction = getMemoryPrediction();

    if(memoryPrediction !== null){

        nextPrediction = memoryPrediction;

    }

}

    let confidence =
memoryPrediction !== null
? getPredictionConfidence()
: 0;

    if(finalPrediction !== null){

    nextPrediction = finalPrediction;

}else if(memoryPrediction !== null){

    nextPrediction = memoryPrediction;

}else{

    nextPrediction = getTrendPrediction();

    if(nextPrediction === null){
        nextPrediction = Math.floor(Math.random()*10);
    }

    }
        
    document.getElementById("result").innerHTML = `
    <h2>AI Prediction 🔥</h2>

    Final Prediction :
<b>${finalPrediction}</b>

<br><br>

Color :
<b>${getColorPrediction(finalPrediction)}</b>

<br><br>

Color AI :
<b>${getFinalColorPrediction()}</b>

<br><br>

Color Confidence :
<b>${getColorConfidence()}%</b>

<br><br>

Color AI Score :
<b>${getColorAIScore()}%</b>

<br><br>

Big/Small :
<b>${getBigSmallPrediction(finalPrediction)}</b>

<br><br>

Confidence :
<b>${confidence}%</b>

<br><br>

Pattern Score :
<b>${getPatternScore(pattern)}%</b>

<br><br>

Trend Score :
<b>${trendScore}%</b>

<br><br>

Hot Number :
<b>${hotCold.hot}</b>

<br><br>

Cold Number :
<b>${hotCold.cold}</b>

<br><br>

AI Score :
<b>${finalAIScore}%</b>

<br><br>

Pattern :
<b>${pattern}</b>

  <br><br>

  Trend Prediction :
<b>${trendPrediction !== null ? trendPrediction : "-"}</b>

<br><br>

Big/Small AI :
<b>${getFinalBigSmallPrediction()}</b>

<br><br>

Big/Small Confidence :
<b>${getBigSmallConfidence()}%</b>

<br><br>

Big/Small AI Score :
<b>${getBigSmallAIScore()}%</b>

    Total Saved Numbers :
    ${allResults.length}
    `;
    
    document.getElementById("debugPattern").innerText =
pattern;
    
document.getElementById("debugPrediction").innerText =
nextPrediction;

if(memoryPrediction !== null){

    document.getElementById("debugSource").innerText =
    "🧠 MEMORY";

    document.getElementById("debugMemory").innerText =
    "FOUND";

}else{

    document.getElementById("debugSource").innerText =
    "🎲 RANDOM";

    document.getElementById("debugMemory").innerText =
    "NOT FOUND";

}
    
   updateStats();
    console.log(allResults);

    alert("Analyze End");
    
};

document.getElementById("checkBtn").onclick = function(){

 let input = prompt("Enter Actual Result");

if(input === null){
    return;
}

input = input.trim();

if(input === ""){
    alert("Please Enter Result");
    return;
}

let actualResult = Number(input);

if(
    isNaN(actualResult) ||
    actualResult < 0 ||
    actualResult > 9
){
    alert("Please Enter Number Between 0 and 9");
    return;
}

    allResults.unshift(actualResult);

if(allResults.length > 1000){
    allResults.pop();
}

localStorage.setItem(
    "allResults",
    JSON.stringify(allResults)
);
    
    updateLearningMemory(actualResult);

    updateBigSmallMemory(actualResult);

    updateColorMemory(actualResult);

    savePredictionHistory(nextPrediction, actualResult);
    
    let currentPattern = allResults.slice(1,7).join(",");
    
    // Auto Shift Inputs

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
    
    if(actualResult === nextPrediction){

        aiWins++;

        if(patternMemory[currentPattern]){

    patternMemory[currentPattern].win++;

            selfLearning(currentPattern, true);
            
            selfLearnBigSmall(
    currentPattern,
    getFinalBigSmallPrediction(),
    actualResult
);

            selfLearnColor(
    currentPattern,
    getFinalColorPrediction(),
    actualResult
);
            
    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

        }
        
        localStorage.setItem("aiWins", aiWins);

        alert("AI WON ✅");

        addHistory("✅ Prediction : " + nextPrediction + " | Result : " + actualResult);
        
updateStats();
  updatePredictionHistoryTable();
        
    }else{

        aiLosses++;

        if(patternMemory[currentPattern]){

    patternMemory[currentPattern].loss++;

            selfLearning(currentPattern, false);

            selfLearnBigSmall(
    currentPattern,
    getFinalBigSmallPrediction(),
    actualResult
);

            selfLearnColor(
    currentPattern,
    getFinalColorPrediction(),
    actualResult
);
            
    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

        }
        
        localStorage.setItem("aiLosses", aiLosses);

        alert("AI LOST ❌");

        addHistory("❌ Prediction : " + nextPrediction + " | Result : " + actualResult);
        
updateStats();
   updatePredictionHistoryTable();
        
    }

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

        alert(
"Pattern = " + pattern +
"\nTotal = " + total +
"\nBest = " + best +
"\nNumbers = " + JSON.stringify(memoryNumbers)
);
        
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

// =========================
// AI DATA
// =========================

updateStats();
