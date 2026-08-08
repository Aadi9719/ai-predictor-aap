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

    let confidence = getConfidenceScore({

    patternScore,
    trendScore,
    aiScore,
    bigSmallScore,
    colorScore

});
    
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

    if(confidence < 50){

    decision = "WAIT";

    }
 
    return {

        patternScore,

        trendScore,

        aiScore,

        bigSmallScore,

        colorScore,

        masterScore,

        confidence,
        
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

function getConfidenceScore(brain){

    if(!brain){
        return 0;
    }

    let scores = [
        brain.patternScore || 0,
        brain.trendScore || 0,
        brain.aiScore || 0,
        brain.bigSmallScore || 0,
        brain.colorScore || 0
    ];

    let total = 0;

    scores.forEach(score => {
        total += Math.max(0, Math.min(100, score));
    });

    let average = total / scores.length;

    let confidence = Math.round(average);

    if(confidence > 100){
        confidence = 100;
    }

    if(confidence < 0){
        confidence = 0;
    }

    return confidence;
}

function getDynamicRankScore(score){

    score = Number(score) || 0;

    if(score < 0){
        score = 0;
    }

    if(score > 100){
        score = 100;
    }

    return Math.round(score);
}
