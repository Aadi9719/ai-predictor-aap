alert("DECISION BRAIN JS LOADED");

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

    let rankScore = getDynamicRankScore(masterScore);

    rankScore = Math.round(
    (rankScore * 0.70) +
    (confidence * 0.30)
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

    if(confidence < 50){

    decision = "WAIT";

    }

    if(rankScore < 50){

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

        rankScore,
        
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

window.showAIDebug = function(){

    alert("SHOW DEBUG START");

    let brain = getDecisionBrain();

    let currentPattern = [
    Number(document.getElementById("n1").value),
    Number(document.getElementById("n2").value),
    Number(document.getElementById("n3").value),
    Number(document.getElementById("n4").value),
    Number(document.getElementById("n5").value)
].join(",");

let rewardRatio = getRewardRatio(currentPattern);

alert(
    "Pattern = " + currentPattern +
    "\nReward Ratio = " + rewardRatio
);

    alert(
    "Pattern Memory Exists = " +
    Boolean(patternMemory[currentPattern])
);

    let memory = patternMemory[currentPattern];

alert(
    "Reward = " + (memory.reward || 0) +
    "\nPenalty = " + (memory.penalty || 0)
);
    
    alert(
    "Master=" + brain.masterScore +
    "\nConfidence=" + brain.confidence +
    "\nRank=" + brain.rankScore +
    "\nDecision=" + brain.decision
);
    
    console.log("=== AI DEBUG ===");
    console.log("Pattern Score:", brain.patternScore);
    console.log("Trend Score:", brain.trendScore);
    console.log("AI Score:", brain.aiScore);
    console.log("Big/Small Score:", brain.bigSmallScore);
    console.log("Color Score:", brain.colorScore);
    console.log("Master Score:", brain.masterScore);
    console.log("Confidence:", brain.confidence);
    console.log("Rank Score:", brain.rankScore);
    console.log("Decision:", brain.decision);

    return "DEBUG OK";
};

function testRewardPenaltyUpdate() {

    alert("INSIDE REWARD TEST");
    
    let testPattern = "TEST_PATTERN";

    alert("PATTERN SET = " + testPattern);

    alert("MEMORY TYPE = " + typeof patternMemory);
    
    alert("BEFORE MEMORY CREATE");
    
    patternMemory[testPattern] = {
        reward: 0,
        penalty: 0,
        learningAge: 0
    };

    alert("MEMORY CREATED");
    
    let before = {
        reward: patternMemory[testPattern].reward,
        penalty: patternMemory[testPattern].penalty
    };

    updateRewardPenalty(testPattern, true);

    let after = {
        reward: patternMemory[testPattern].reward,
        penalty: patternMemory[testPattern].penalty
    };

    alert(
        "BEFORE\n" +
        "Reward = " + before.reward +
        "\nPenalty = " + before.penalty +
        "\n\nAFTER\n" +
        "Reward = " + after.reward +
        "\nPenalty = " + after.penalty
    );

    delete patternMemory[testPattern];
}
