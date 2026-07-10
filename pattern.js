function getPatternPrediction(){

    let pattern = allResults.slice(-6).join(",");

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

    let nextNumbers = patternMemory[pattern].nextNumbers;

    if(!nextNumbers){

        return null;

    }

    let bestNumber = null;
    let maxCount = -1;

    for(let num in nextNumbers){

        if(
    nextNumbers[num] > maxCount ||
    (
        nextNumbers[num] === maxCount &&
        Number(num) !== 0
    )
){

    maxCount = nextNumbers[num];
    bestNumber = Number(num);

        }

    }

    alert(
"Best = " + bestNumber +
"\nCount = " + maxCount +
"\nData = " + JSON.stringify(nextNumbers)
);
    
    return bestNumber;

}

function getPatternScore(){

    let pattern = allResults.slice(-6).join(",");

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
