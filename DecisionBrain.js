function getDecisionBrain() {

    let patternScore = getPatternScore();

    let trendScore = getTrendScore();

    let aiScore = getFinalAIScore();

    let bigSmallScore = getBigSmallAIScore();

    let colorScore = getColorAIScore();

    let currentPattern = [
    Number(document.getElementById("n1").value),
    Number(document.getElementById("n2").value),
    Number(document.getElementById("n3").value),
    Number(document.getElementById("n4").value),
    Number(document.getElementById("n5").value)
].join(",");

let rewardRatio = getRewardRatio(currentPattern);
    
    let masterScore = Math.round(

(patternScore * 0.30) +

(trendScore * 0.20) +

(aiScore * 0.25) +

(bigSmallScore * 0.15) +

(colorScore * 0.10) +

(rewardRatio * 0.10)
        
);

    let decision = "WAIT";

if(masterScore >= 85){

    decision = "STRONG";

}else if(masterScore >= 70){

    decision = "NORMAL";

}else if(masterScore >= 50){

    decision = "WEAK";

}else{

    decision = "BLOCK";

}
    
    return {

        patternScore,

        trendScore,

        aiScore,

        bigSmallScore,

        colorScore,

        masterScore,

        decision
        
    };

}

    function shouldPredict(){

    let brain = getDecisionBrain();

    if(brain.decision === "BLOCK"){
        return false;
    }

    return true;

    }

function getHotColdScore(){

    let hotCold = getHotColdNumbers();

    if(!hotCold){
        return 0;
    }

    return 50;

}

function getRewardRatio(pattern){

    if(!patternMemory[pattern]){
        return 50;
    }

    let reward = patternMemory[pattern].reward || 0;
    let penalty = patternMemory[pattern].penalty || 0;

    let total = reward + penalty;

    if(total === 0){
        return 50;
    }

    return Math.round((reward / total) * 100);

}
