function updateLearningMemory(actualResult){
    
    for (let len = 2; len <= 8; len++) {

    let pattern = allResults.slice(1, len + 1).join(",");

    if (pattern.split(",").length < len) continue;

    if (!patternMemory[pattern]) {

        patternMemory[pattern] = {

            total: 0,

            GREEN: 0,
            RED: 0,

            BIG: 0,
            SMALL: 0,

            GREEN_BIG: 0,
            GREEN_SMALL: 0,

            RED_BIG: 0,
            RED_SMALL: 0,

            numbers: {},

            nextNumbers: {},

            win: 0,

            loss: 0,

            confidence: 0,

            lastSeen: 0

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

    patternMemory[pattern].confidence =
Math.round(
(patternMemory[pattern].total / allResults.length) * 100
);
    
    patternMemory[pattern][color]++;

    patternMemory[pattern][bigSmall]++;

    patternMemory[pattern][color + "_" + bigSmall]++;

if(!patternMemory[pattern].numbers[actualResult]){

    patternMemory[pattern].numbers[actualResult]=0;

}

// Next Number Pattern Counter

if(!patternMemory[pattern].nextNumbers){
    patternMemory[pattern].nextNumbers = {};
}

if(patternMemory[pattern].nextNumbers[actualResult] === undefined){
    patternMemory[pattern].nextNumbers[actualResult] = 0;
}

patternMemory[pattern].nextNumbers[actualResult] += 2;

patternMemory[pattern].nextNumbers[actualResult]++;

    patternMemory[pattern].lastSeen = Date.now();
    
    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );
        
    console.log(patternMemory);

}

}

let bigSmallMemory = JSON.parse(localStorage.getItem("bigSmallMemory")) || {};

function updateBigSmallMemory(actualResult){

    let bsHistory = allResults
        .slice(1,9)
        .map(n => n >= 5 ? "B" : "S");

    for(let len = 2; len <= 8; len++){

        let pattern = bsHistory.slice(0,len).join(",");

        if(pattern.split(",").length < len) continue;

        if(!bigSmallMemory[pattern]){

            bigSmallMemory[pattern] = {
                total:0,
                next:{
                    B:0,
                    S:0
                }
            };

        }

        let nextType = actualResult >= 5 ? "B" : "S";

        bigSmallMemory[pattern].total++;
        bigSmallMemory[pattern].next[nextType]++;

    }

    localStorage.setItem(
        "bigSmallMemory",
        JSON.stringify(bigSmallMemory)
    );

}

function getBigSmallPredictionMemory(){

    let bsHistory = allResults
        .slice(0,8)
        .map(n => n >= 5 ? "B" : "S");

    for(let len=8; len>=2; len--){

        let pattern = bsHistory.slice(0,len).join(",");

        if(!bigSmallMemory[pattern]) continue;

        let next = bigSmallMemory[pattern].next;

        return next.B >= next.S ? "BIG" : "SMALL";

    }

    return null;

}
