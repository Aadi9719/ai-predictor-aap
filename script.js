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
    //allResults.push(...numbers);

    localStorage.setItem(
        "allResults",
        JSON.stringify(allResults)
    );

    let memoryPrediction = getPatternPrediction();

    let finalPrediction = getFinalPrediction();

    let trendScore = getTrendScore();
    
    let trendPrediction = getTrendPrediction();
    
    if(memoryPrediction !== null){

    nextPrediction = memoryPrediction;

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

    if(memoryPrediction !== null){

        nextPrediction = finalPrediction;
        
    document.getElementById("result").innerHTML = `
    <h2>AI Prediction 🔥</h2>

    Final Prediction :
<b>${finalPrediction}</b>

<br><br>

Color :
<b>${getColorPrediction(finalPrediction)}</b>

<br><br>

Big/Small :
<b>${getBigSmallPrediction(finalPrediction)}</b>

<br><br>

Confidence :
<b>${confidence}%</b>

<br><br>

Pattern Score :
<b>${getPatternScore()}%</b>

<br><br>

Pattern :
<b>${pattern}</b>

  <br><br>

  Trend Prediction :
<b>${trendPrediction !== null ? trendPrediction : "-"}</b>

<br><br>

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

Color :
<b>${getColorPrediction(nextPrediction)}</b>

<br><br>

Big/Small :
<b>${getBigSmallPrediction(nextPrediction)}</b>

    <br><br>

    Total Saved Numbers :
    ${allResults.length}
    `;

}

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

};

document.getElementById("checkBtn").onclick = function(){

    let actualResult = Number(
        prompt("Enter Actual Result")
    );

    if(isNaN(actualResult)){

        alert("Please Enter Valid Number");
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

        localStorage.setItem("aiWins", aiWins);

        alert("AI WON ✅");

        addHistory("✅ Prediction : " + nextPrediction + " | Result : " + actualResult);
        
updateStats();
        
    }else{

        aiLosses++;

        localStorage.setItem("aiLosses", aiLosses);

        alert("AI LOST ❌");

        addHistory("❌ Prediction : " + nextPrediction + " | Result : " + actualResult);
        
updateStats();
        
    }

};

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

updateStats();
