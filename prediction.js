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

    recent.forEach(n => {

        if(!count[n]){
            count[n] = 0;
        }

        count[n]++;

    });

    let best = null;
    let max = -1;

    for(let num in count){

        if(count[num] > max){

            max = count[num];
            best = Number(num);

        }

    }

    return best;

}

function getFinalPrediction(){

    let memory = getPatternPrediction();

    let trend = getTrendPrediction();

    if(memory !== null && trend !== null){

        if(memory === trend){

            return memory;

        }

    }

    if(memory !== null){

        return memory;

    }

    if(trend !== null){

        return trend;

    }

    return Math.floor(Math.random() * 10);

}

function getTrendScore(){

    if(allResults.length < 20){
        return 0;
    }

    let recent = allResults.slice(-20);

    let count = {};

    recent.forEach(n => {

        if(!count[n]){
            count[n] = 0;
        }

        count[n]++;

    });

    let max = 0;

    for(let num in count){

        if(count[num] > max){
            max = count[num];
        }

    }

    return Math.round((max / 20) * 100);

}

function getFinalAIScore(){

    let memory = getPredictionConfidence();

    let pattern = getPatternScore();

    let trend = getTrendScore();

    return Math.round(

        (memory * 0.4) +

        (pattern * 0.3) +

        (trend * 0.3)

    );

}
