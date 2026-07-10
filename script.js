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

    document.getElementById("result").innerHTML = `
    <h2>AI Prediction 🔥</h2>

    Memory Prediction :
    <b>${memoryPrediction}</b>

<br><br>

Color :
<b>${getColorPrediction(memoryPrediction)}</b>

<br><br>

Big/Small :
<b>${getBigSmallPrediction(memoryPrediction)}</b>

<br><br>

Confidence :
<b>${confidence}%</b>

<br><br>

Pattern :
<b>${pattern}</b>

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

function updateLearningMemory(actualResult){
    
    let pattern =
    allResults.slice(-6).join(",");

    alert("SAVE = " + pattern);
    
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

    // Next Number Pattern Counter

if(!patternMemory[pattern].nextNumbers){

    patternMemory[pattern].nextNumbers = {};

}

if(!patternMemory[pattern].nextNumbers[actualResult]){

    patternMemory[pattern].nextNumbers[actualResult] = 0;

}

patternMemory[pattern].nextNumbers[actualResult]++;
    
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

function getPatternPrediction(){

    let pattern =
    allResults.slice(-6).join(",");

    alert("SEARCH = " + pattern);
    
    let searchPatterns = [

allResults.slice(-6).join(","),

allResults.slice(-5).join(","),

allResults.slice(-4).join(","),

allResults.slice(-3).join(",")

];
    
    let foundPattern = null;

for(let p of searchPatterns){

    if(patternMemory[p]){

        foundPattern = p;

        break;

    }

}

if(foundPattern === null){

    return null;

}

pattern = foundPattern;

    let nextNumbers =
    patternMemory[pattern].nextNumbers;

    alert(JSON.stringify(patternMemory[pattern]));
    
    if(!nextNumbers){
        return null;
    }

    let bestNumber = null;
    let maxCount = -1;

    let patternMatches = 0;
    
    for(let num in nextNumbers){

        if(nextNumbers[num] > maxCount){

            maxCount = nextNumbers[num];
            bestNumber = Number(num);

            patternMatches = nextNumbers[num];
            
        }

    }

    console.log(
"Pattern Prediction = ",
bestNumber,
" Count = ",
maxCount
);
    
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

function getColorPrediction(number){

    if([1,3,7,9].includes(number)){
        return "🟢 GREEN";
    }

    if([2,4,6,8].includes(number)){
        return "🔴 RED";
    }

    return "🟣 VIOLET";

}

function getBigSmallPrediction(number){

    if(number >= 5){
        return "🔵 BIG";
    }

    return "🟡 SMALL";

}

function updateStats(){

    document.getElementById("totalPatterns").innerText =
    Object.keys(patternMemory).length;

    document.getElementById("wins").innerText =
    aiWins;

    document.getElementById("losses").innerText =
    aiLosses;

    let total = aiWins + aiLosses;

    let accuracy = 0;

    if(total > 0){

        accuracy = Math.round((aiWins / total) * 100);

    }

    document.getElementById("accuracy").innerText =
    accuracy + "%";

}

function addHistory(text){

    let historyList =
    document.getElementById("historyList");

    let item =
    document.createElement("p");

    item.innerHTML = text;

    historyList.prepend(item);

}

// =========================
// AI DATA
// =========================

updateStats();
