function getDecisionBrain() {

    let patternScore = getPatternScore();

    let trendScore = getTrendScore();

    let aiScore = getFinalAIScore();

    let bigSmallScore = getBigSmallAIScore();

    let colorScore = getColorAIScore();

    return {

        patternScore,

        trendScore,

        aiScore,

        bigSmallScore,

        colorScore

    };

}
