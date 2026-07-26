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
    
    return {

        patternScore,

        trendScore,

        aiScore,

        bigSmallScore,

        colorScore,

        masterScore
        
    };

}
