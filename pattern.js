function getPatternPrediction(){

    let bestNumber = null;
    let bestScore = -1;

    for(let len = 6; len >= 3; len--){

        let pattern = allResults.slice(-len).join(",");

        if(!patternMemory[pattern]) continue;

        let nextNumbers = patternMemory[pattern].nextNumbers;

        if(!nextNumbers) continue;

        let confidence = patternMemory[pattern].confidence || 1;

        for(let num in nextNumbers){

            let score = (nextNumbers[num] * len) + confidence;

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

    alert(
"Pattern = " + pattern +
"\nBest = " + bestNumber +
"\nNextNumbers = " + JSON.stringify(nextNumbers)
);
    
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
