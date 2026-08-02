function getDecisionBrain() {

    let patternScore = getPatternScore();

    let trendScore = getTrendScore();

    let aiScore = getFinalAIScore();

    let bigSmallScore = getBigSmallAIScore();

    let colorScore = getColorAIScore();

    let masterScore = Math.round(

(patternScore * 0.30) +

(trendScore * 0.20) +

(aiScore * 0.25) +

(bigSmallScore * 0.15) +

(colorScore * 0.10)

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
