function getPatternPrediction(){

    let bestNumber = null;
    let bestScore = -1;

    for(let len = 6; len >= 3; len--){

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

let score =
(frequency * len) +
(confidence * 2) +
trendBonus +
hotBonus;
            
            if(
                score > bestScore ||
                (score === bestScore && Number(num) !== 0)
            ){
                bestScore = score;
                bestNumber = Number(num);
            }

        } // num loop end

    } // len loop end

    if(bestNumber === null){
        return null;
    }
    
    return bestNumber;

}

function getPatternScore(){

    let pattern = allResults.slice(0,6).join(",");

    if(!patternMemory[pattern]){
        return 0;
    }

    let total = patternMemory[pattern].total;

    if(total >= 20) return 100;
    if(total >= 15) return 90;
    if(total >= 10) return 80;
    if(total >= 5) return 70;

    return 50;

}
