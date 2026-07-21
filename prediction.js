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

function getTrendPrediction(){

    if(allResults.length < 20){
        return null;
    }

    let recent = allResults.slice(-20);

    let count = {};

    for(let i=0;i<=9;i++){
        count[i]=0;
    }

    recent.forEach(n=>{
        count[n]++;
    });

    let best = null;
    let max = -1;

    for(let i=0;i<=9;i++){

        if(i===0) continue;   // 0 ko ignore karega

        if(count[i] > max){

            max = count[i];
            best = i;

        }

    }

    return best;

}

function getFinalPrediction(){

    let memory = getPatternPrediction();

    let trend = getTrendPrediction();

    let hotCold = getHotColdNumbers();

    let hot = hotCold.hot;

    // Sab agree hain
    if(memory !== null && trend !== null){

        if(memory === trend){

            return memory;

        }

    }

    // Memory aur Hot same
    if(memory !== null){

        if(memory === hot){

            return memory;

        }

    }

    // Trend aur Hot same
    if(trend !== null){

        if(trend === hot){

            return trend;

        }

    }

    // Strong Memory
    if(memory !== null){

        return memory;

    }

    // Strong Trend
    if(trend !== null){

        return trend;

    }

    // Last option
    return hot;

}

function getTrendScore(){

    if(allResults.length < 20){
        return 0;
    }

    let recent = allResults.slice(-20);

    let count = {};
    let streak = 1;
    let maxStreak = 1;

    for(let i = 0; i < recent.length; i++){

        let n = recent[i];

        count[n] = (count[n] || 0) + 1;

        if(i > 0){

            if(recent[i] === recent[i-1]){
                streak++;
                if(streak > maxStreak){
                    maxStreak = streak;
                }
            }else{
                streak = 1;
            }

        }

    }

    let maxFrequency = 0;

    for(let num in count){

        if(count[num] > maxFrequency){
            maxFrequency = count[num];
        }

    }

    let frequencyScore = (maxFrequency / 20) * 70;
    let streakScore = (maxStreak / 5) * 30;

    let finalScore = frequencyScore + streakScore;

    if(finalScore > 100){
        finalScore = 100;
    }

    return Math.round(finalScore);

}

function getFinalAIScore(){

    let memory = getPredictionConfidence();

    let pattern = getPatternScore();

    let trend = getTrendScore();

    let hotCold = getHotColdNumbers();

    let hotBonus =
    (nextPrediction === hotCold.hot) ? 10 : 0;

    let score =
        (memory * 0.35) +
        (pattern * 0.30) +
        (trend * 0.20) +
        hotBonus;

    if(score > 100){
        score = 100;
    }

    return Math.round(score);

}

function getHotColdNumbers(){

    if(allResults.length < 20){

        return {
            hot:null,
            cold:null
        };

    }

    let recent = allResults.slice(0,20);

    let count = {};

    for(let i=0;i<=9;i++){

        count[i]=0;

    }

    recent.forEach(n=>{

        count[n]++;

    });

    let hot = recent[0];
let cold = recent[0];

    for(let i=0;i<=9;i++){

        if(count[i] > count[hot]){

            hot = i;

        }

        if(count[i] < count[cold]){

            cold = i;

        }

    }

    return {

        hot,

        cold

    };

}
