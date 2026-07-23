alert("Pattern Start");

function getPatternPrediction(){

    alert("Pattern Function Start");
    
    let bestNumber = null;
    let bestScore = -1;

    for(let len = 5; len >= 2; len--)

    {
        
        let currentInput = [
    Number(document.getElementById("n1").value),
    Number(document.getElementById("n2").value),
    Number(document.getElementById("n3").value),
    Number(document.getElementById("n4").value),
    Number(document.getElementById("n5").value)
];

let pattern =
currentInput.slice(0, len).join(",");

        if(!patternMemory[pattern]) continue;

        let nextNumbers = patternMemory[pattern].nextNumbers;

        if(!nextNumbers) continue;

        let confidence = patternMemory[pattern].confidence || 1;

        let candidates = getCandidateNumbers();
        
        for(let num in nextNumbers){

            if(!candidates.includes(Number(num))){
    continue;
            }
            
            let info = nextNumbers[num];

let frequency = info.total || 0;

let accuracy = info.accuracy || 0;

let trendBonus =
(Number(num) === getTrendPrediction()) ? 15 : 0;

let hotBonus =
(Number(num) === getHotColdNumbers().hot) ? 10 : 0;

            let candidateBonus = 0;

if(getCandidateNumbers().includes(Number(num))){
    candidateBonus = 20;
}

            let priorityBonus =
getCandidatePriority(Number(num));
            
            let winRate = getPatternWinRate(pattern);

            let strength = getPatternStrength(pattern);

            let recentAccuracy = getRecentAccuracy(pattern);

            let priority = getPriorityLevel(pattern);

            let masterScore =
getMasterNumberScore(Number(num), pattern);
            
let score =
(frequency * len) +
(accuracy * 2)
(confidence * 2) +
(winRate * 3) +
(strength * 2) +
(recentAccuracy * 3) +
(priority * 4) +
trendBonus +
hotBonus +
candidateBonus +
priorityBonus +    
masterScore;
            
            if(
                score > bestScore ||
                (score === bestScore && Number(num) !== 0)
            ){
                bestScore = score;
                bestNumber = Number(num);
            }

        } 

    } 

    if(bestNumber === null){
        return null;
    }

    alert(allResults.slice(0,10).join(","));

    alert("Returning Prediction");
    
    return bestNumber;
    
}

function getPatternScore(){

    let currentInput = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    let pattern = currentInput.join(",");

    if(!patternMemory[pattern]){
        return 0;
    }

    let total = patternMemory[pattern].total || 0;
    let confidence = patternMemory[pattern].confidence || 0;

    let score = 0;

    // Pattern Frequency
    score += Math.min(total * 3, 30);

    // Confidence
    score += Math.min(confidence * 0.30, 30);

    // Win Rate
    score += Math.min(getPatternWinRate(pattern) * 0.20, 20);

    // Pattern Strength
    score += Math.min(getPatternStrength(pattern) * 0.10, 10);

    // Recent Accuracy
    score += Math.min(getRecentAccuracy(pattern) * 0.10, 10);

    if(score > 100){
        score = 100;
    }

    return Math.round(score);

}

function getPatternWinRate(pattern){

    if(!patternMemory[pattern]){
        return 0;
    }

    let win = patternMemory[pattern].win || 0;
    let loss = patternMemory[pattern].loss || 0;

    let total = win + loss;

    if(total === 0){
        return 50;   // Default score
    }

    return Math.round((win / total) * 100);

}

function getPatternStrength(pattern){

    if(!patternMemory[pattern]){
        return 0;
    }

    let data = patternMemory[pattern];

    let seen = data.total || 0;

    let winRate = getPatternWinRate(pattern);

    let strength =
    (seen * 2) +
    (winRate * 3);

    if(strength > 100){
        strength = 100;
    }

    return Math.round(strength);

}

function getRecentAccuracy(pattern){

    if(!patternMemory[pattern]){
        return 50;
    }

    let data = patternMemory[pattern];

    let win = data.win || 0;
    let loss = data.loss || 0;

    let total = win + loss;

    if(total < 5){
        return 50;
    }

    return Math.round((win / total) * 100);

}

function getPriorityLevel(pattern){

    let winRate = getPatternWinRate(pattern);
    let strength = getPatternStrength(pattern);
    let recent = getRecentAccuracy(pattern);

    let priority =
    (winRate * 0.4) +
    (strength * 0.3) +
    (recent * 0.3);

    return Math.round(priority);

}

function getBigSmallPatternPrediction(){

    let currentInput = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    for(let len = 5; len >= 2; len--){

        let pattern = currentInput.slice(0, len).join(",");

        if(!patternMemory[pattern]){
            continue;
        }

        let big = patternMemory[pattern].BIG || 0;
        let small = patternMemory[pattern].SMALL || 0;

        if(big === 0 && small === 0){
            continue;
        }

        return big >= small ? "BIG" : "SMALL";
    }

    return null;

}

function getBigSmallConfidence(){

    let currentInput = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    for(let len = 5; len >= 2; len--){

        let pattern = currentInput.slice(0, len).join(",");

        if(!patternMemory[pattern]){
            continue;
        }

        let big = patternMemory[pattern].BIG || 0;
        let small = patternMemory[pattern].SMALL || 0;

        let total = big + small;

        if(total === 0){
            continue;
        }

        let best = Math.max(big, small);

        return Math.round((best / total) * 100);
    }

    return 0;

}

function getBigSmallAIScore(){

    let confidence = getBigSmallConfidence();

    let trend = getTrendScore();

    let score =
        (confidence * 0.70) +
        (trend * 0.30);

    if(score > 100){
        score = 100;
    }

    return Math.round(score);

}

function getRecentBigSmallPrediction(){

    let r20 = getBigSmallRatio(last20);

    let r100 = getBigSmallRatio(last100);

    let r1000 = getBigSmallRatio(history1000);

    let bigScore =
        (r20.big * 0.50) +
        (r100.big * 0.30) +
        (r1000.big * 0.20);

    let smallScore =
        (r20.small * 0.50) +
        (r100.small * 0.30) +
        (r1000.small * 0.20);

    return bigScore >= smallScore ? "BIG" : "SMALL";

}

function getColorRatio(data){

    let green = 0;

    let red = 0;

    let violet = 0;

    data.forEach(n=>{

        if([1,3,7,9].includes(n)){

            green++;

        }else if([2,4,6,8].includes(n)){

            red++;

        }else{

            violet++;

        }

    });

    return{

        green,

        red,

        violet

    };

}

function getRecentColorPrediction(){

    let r20 = getColorRatio(last20);

    let r100 = getColorRatio(last100);

    let r1000 = getColorRatio(history1000);

    let greenScore =
        (r20.green * 0.50) +
        (r100.green * 0.30) +
        (r1000.green * 0.20);

    let redScore =
        (r20.red * 0.50) +
        (r100.red * 0.30) +
        (r1000.red * 0.20);

    let violetScore =
        (r20.violet * 0.50) +
        (r100.violet * 0.30) +
        (r1000.violet * 0.20);

    if(
        greenScore >= redScore &&
        greenScore >= violetScore
    ){
        return "GREEN";
    }

    if(
        redScore >= greenScore &&
        redScore >= violetScore
    ){
        return "RED";
    }

    return "VIOLET";

}

function getFinalBigSmallPrediction(){

    let pattern = getBigSmallPatternPrediction();

    let recent = getRecentBigSmallPrediction();

    let confidence = getBigSmallConfidence();

    // Pattern aur Recent dono same hain
    if(pattern !== null &&
       pattern === recent &&
       confidence >= 60){

        return pattern;

    }

    // Agar Recent aur Pattern alag hain
    if(pattern !== recent){

        return recent;

    }

    // Normal Pattern
    if(pattern !== null){

        return pattern;

    }

    return "UNKNOWN";

}

function getColorPatternPrediction(){

    let currentInput = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    for(let len = 5; len >= 2; len--){

        let pattern = currentInput.slice(0,len).join(",");

        if(!patternMemory[pattern]){
            continue;
        }

        let green = patternMemory[pattern].GREEN || 0;
        let red = patternMemory[pattern].RED || 0;

        if(green === 0 && red === 0){
            continue;
        }

        return green >= red ? "GREEN" : "RED";
    }

    return null;

}

function getColorConfidence(){

    let currentInput = [
        Number(document.getElementById("n1").value),
        Number(document.getElementById("n2").value),
        Number(document.getElementById("n3").value),
        Number(document.getElementById("n4").value),
        Number(document.getElementById("n5").value)
    ];

    let pattern = currentInput.join(",");

    if(!patternMemory[pattern]){
        return 0;
    }

    let green = patternMemory[pattern].GREEN || 0;
    let red = patternMemory[pattern].RED || 0;

    let total = green + red;

    if(total === 0){
        return 0;
    }

    return Math.round(
        (Math.max(green, red) / total) * 100
    );

}

function getColorAIScore(){

    let confidence = getColorConfidence();

    let trend = getTrendScore();

    let score =
        (confidence * 0.70) +
        (trend * 0.30);

    if(score > 100){
        score = 100;
    }

    return Math.round(score);

}

function getFinalColorPrediction(){

    let pattern = getColorPatternPrediction();

    let recent = getRecentColorPrediction();

    let confidence = getColorConfidence();

    // Pattern aur Recent dono same
    if(
        pattern !== null &&
        pattern === recent &&
        confidence >= 60
    ){
        return pattern;
    }

    // Recent aur Pattern alag
    if(pattern !== recent){
        return recent;
    }

    // Normal Pattern
    if(pattern !== null){
        return pattern;
    }

    return "UNKNOWN";

}

function getCandidateNumbers(){

    let bs = getFinalBigSmallPrediction();
    let color = getFinalColorPrediction();

    // BIG + GREEN
    if(bs === "BIG" && color.includes("GREEN")){
        return [7,9];
    }

    // BIG + RED
    if(bs === "BIG" && color.includes("RED")){
        return [6,8];
    }

    // BIG + VIOLET
    if(bs === "BIG" && color.includes("VIOLET")){
        return [5];
    }

    // SMALL + GREEN
    if(bs === "SMALL" && color.includes("GREEN")){
        return [1,3];
    }

    // SMALL + RED
    if(bs === "SMALL" && color.includes("RED")){
        return [2,4];
    }

    // SMALL + VIOLET
    if(bs === "SMALL" && color.includes("VIOLET")){
        return [0];
    }

    return [1,2,3,4,5,6,7,8,9];

}

function getMasterNumberScore(number, pattern){

    let patternScore = getPatternScore(pattern);

    let bigSmallConfidence = getBigSmallConfidence();

    let colorConfidence = getColorConfidence();

    let trendScore = getTrendScore();

    let score =
(patternScore * (aiEngineWeight.pattern / 100)) +
(bigSmallConfidence * (aiEngineWeight.bigSmall / 100)) +
(colorConfidence * (aiEngineWeight.color / 100)) +
(trendScore * (aiEngineWeight.trend / 100));

    return Math.round(score);

}

function getCandidatePriority(number){

    let priority = 0;

    let hot = getHotColdNumbers().hot;

    if(number === hot){
        priority += 15;
    }

    let candidates = getCandidateNumbers();

    if(candidates.includes(number)){
        priority += 20;
    }

    if(number === getTrendPrediction()){
        priority += 10;
    }

    return priority;

}
