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
    
    let pattern =
allResults.slice(-6).join(",");
    
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
        
    document.getElementById("analyzeBtn").onclick = function(){

    let memoryPrediction = getPatternPrediction();
    let trendPrediction = getTrendPrediction();
    let finalPrediction = getFinalPrediction();

    currentPattern = allResults.slice(0,6).join(",");

    if(finalPrediction !== null){

        nextPrediction = finalPrediction;

    }else if(memoryPrediction !== null){

        nextPrediction = memoryPrediction;

    }else if(trendPrediction !== null){

        nextPrediction = trendPrediction;

    }else{

        nextPrediction = Math.floor(Math.random()*10);

    }

    document.getElementById("result").innerHTML = `
    <h2>AI Prediction 🔥</h2>

    Prediction :
    <b>${nextPrediction}</b>

    <br><br>

    Color :
    <b>${getColorPrediction(nextPrediction)}</b>

    <br><br>

    Big/Small :
    <b>${getBigSmallPrediction(nextPrediction)}</b>
    `;

    updateStats();

};

document.getElementById("checkBtn").onclick=function(){

    let actualResult = Number(prompt("Enter Actual Result"));

    if(isNaN(actualResult)) return;

    updateLearningMemory(actualResult);

    allResults.unshift(actualResult);

    if(allResults.length>1000){

        allResults.pop();

    }

    localStorage.setItem(
        "allResults",
        JSON.stringify(allResults)
    );

    if(actualResult===nextPrediction){

        aiWins++;

        addHistory(
        "✅ Prediction : "+nextPrediction+
        " | Result : "+actualResult
        );

    }else{

        aiLosses++;

        addHistory(
        "❌ Prediction : "+nextPrediction+
        " | Result : "+actualResult
        );

    }

    localStorage.setItem("aiWins",aiWins);
    localStorage.setItem("aiLosses",aiLosses);

    updateStats();

};

function getMemoryPrediction(){

    let pattern =
allResults.slice(0,6).join(",");

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

updateStats();
