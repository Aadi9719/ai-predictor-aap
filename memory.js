function updateLearningMemory(actualResult){
    
    let pattern = allResults.slice(1,7).join(",");

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

patternMemory[pattern].numbers[actualResult]++;

    // Next Number Pattern Counter

if(!patternMemory[pattern].nextNumbers){

    patternMemory[pattern].nextNumbers = {};

}

if(!patternMemory[pattern].nextNumbers[actualResult]){

    patternMemory[pattern].nextNumbers[actualResult] = 0;

}

patternMemory[pattern].nextNumbers[actualResult]++;

    patternMemory[pattern].lastSeen = Date.now();
    
    localStorage.setItem(
        "patternMemory",
        JSON.stringify(patternMemory)
    );

    console.log(patternMemory);

}
