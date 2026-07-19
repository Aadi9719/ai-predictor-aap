function getPatternPrediction(){

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

        for(let num in nextNumbers){

            let frequency = nextNumbers[num];

let trendBonus =
(Number(num) === getTrendPrediction()) ? 15 : 0;

let hotBonus =
(Number(num) === getHotColdNumbers().hot) ? 10 : 0;

            let winRate = getPatternWinRate(pattern);

            let strength = getPatternStrength(pattern);

            let recentAccuracy = getRecentAccuracy(pattern);

            let priority = getPriorityLevel(pattern);
            
let score =
(frequency * len) +
(confidence * 2) +
(winRate * 3) +
(strength * 2) +
(recentAccuracy * 3) +
(priority * 4) +
trendBonus +
hotBonus;
            
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
    
    return bestNumber;

}

function getPatternScore(pattern){

    if(!patternMemory[pattern]){
        return 0;
    }

    let total = patternMemory[pattern].total || 0;

    let winRate = getPatternWinRate(pattern);

    let strength = getPatternStrength(pattern);

    let recent = getRecentAccuracy(pattern);

    let priority = getPriorityLevel(pattern);

    let score =
        (total * 2) +
        (winRate * 0.4) +
        (strength * 0.2) +
        (recent * 0.3) +
        (priority * 5);

    if(score > 100) score = 100;

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
