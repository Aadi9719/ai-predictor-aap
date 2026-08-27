// ========================================
// PREDICTION.JS
// FINAL PREDICTION ENGINE
// ========================================


// ========================================
// COLOR
// ========================================

function getColorPrediction(number) {

    number = Number(number);

    if ([1, 3, 7, 9].includes(number)) {
        return "🟢 GREEN";
    }

    if ([2, 4, 6, 8].includes(number)) {
        return "🔴 RED";
    }

    return "🟣 VIOLET";
}


// ========================================
// BIG / SMALL
// ========================================

function getBigSmallPrediction(number) {

    number = Number(number);

    if (number >= 5) {
        return "🔵 BIG";
    }

    return "🟡 SMALL";
}


// ========================================
// TREND PREDICTION
// ========================================

function getTrendPrediction() {

    if (!Array.isArray(allResults) || allResults.length < 20) {
        return null;
    }

    // allResults[0] = latest result
    const recent = allResults.slice(0, 20);

    const count = {};

    for (let i = 1; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 1 &&
            n <= 9
        ) {
            count[n]++;
        }

    });

    let best = null;
    let max = -1;

    for (let i = 1; i <= 9; i++) {

        if (count[i] > max) {

            max = count[i];
            best = i;

        }

    }

    return best;
}


// ========================================
// TREND SCORE
// ========================================

function getTrendScore() {

    if (!Array.isArray(allResults) || allResults.length < 20) {
        return 0;
    }

    const recent = allResults.slice(0, 20);

    const count = {};

    for (let i = 1; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 1 &&
            n <= 9
        ) {
            count[n]++;
        }

    });

    let maxFrequency = 0;

    for (let i = 1; i <= 9; i++) {

        if (count[i] > maxFrequency) {
            maxFrequency = count[i];
        }

    }

    /*
       20 results mein maximum frequency
       ko trend strength maana ja raha hai.

       Example:
       4/20 = 20%
       6/20 = 30%
    */

    const score =
        (maxFrequency / 20) * 100;

    return Math.round(
        Math.min(100, score)
    );
}


// ========================================
// HOT / COLD
// ========================================

function getHotColdNumbers() {

    if (!Array.isArray(allResults) || allResults.length < 20) {

        return {
            hot: null,
            cold: null
        };

    }

    const recent = allResults.slice(0, 20);

    const count = {};

    for (let i = 1; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(function (value) {

        const n = Number(value);

        if (
            Number.isInteger(n) &&
            n >= 1 &&
            n <= 9
        ) {
            count[n]++;
        }

    });

    let hot = null;
    let cold = null;

    let hotCount = -1;
    let coldCount = Infinity;

    for (let i = 1; i <= 9; i++) {

        if (count[i] > hotCount) {

            hotCount = count[i];
            hot = i;

        }

        if (count[i] < coldCount) {

            coldCount = count[i];
            cold = i;

        }

    }

    return {
        hot: hot,
        cold: cold
    };
}


// ========================================
// FINAL NUMBER PREDICTION
// ========================================

function getFinalPrediction() {

    let memory = null;
    let trend = null;
    let hot = null;

    // -----------------------------
    // Memory
    // -----------------------------

    if (typeof getPatternPrediction === "function") {

        try {
            memory = getPatternPrediction();
        } catch (error) {

            console.error(
                "Pattern prediction error:",
                error
            );

            memory = null;
        }

    }


    // -----------------------------
    // Trend
    // -----------------------------

    trend = getTrendPrediction();


    // -----------------------------
    // Hot
    // -----------------------------

    const hotCold = getHotColdNumbers();

    hot = hotCold.hot;


    // -----------------------------
    // Memory + Trend agreement
    // -----------------------------

    if (
        memory !== null &&
        trend !== null &&
        memory === trend
    ) {

        return memory;

    }


    // -----------------------------
    // Strong pattern memory
    // -----------------------------

    if (
        memory !== null &&
        typeof getPatternScore === "function"
    ) {

        let patternScore = 0;

        try {
            patternScore = getPatternScore();
        } catch (error) {

            console.error(
                "Pattern score error:",
                error
            );

        }

        if (patternScore >= 70) {
            return memory;
        }

    }


    // -----------------------------
    // Strong trend
    // -----------------------------

    if (
        trend !== null &&
        getTrendScore() >= 70
    ) {

        return trend;

    }


    // -----------------------------
    // Hot fallback
    // -----------------------------

    if (hot !== null) {
        return hot;
    }


    // -----------------------------
    // Memory fallback
    // -----------------------------

    if (memory !== null) {
        return memory;
    }


    // -----------------------------
    // Trend fallback
    // -----------------------------

    if (trend !== null) {
        return trend;
    }


    return null;
}


// ========================================
// FINAL AI SCORE
// ========================================

function getFinalAIScore() {

    let memoryScore = 0;
    let patternScore = 0;
    let trendScore = getTrendScore();


    // Prediction confidence
    if (
        typeof getPredictionConfidence === "function"
    ) {

        try {

            memoryScore =
                Number(
                    getPredictionConfidence()
                ) || 0;

        } catch (error) {

            console.error(
                "Prediction confidence error:",
                error
            );

        }

    }


    // Pattern score
    if (
        typeof getPatternScore === "function"
    ) {

        try {

            patternScore =
                Number(
                    getPatternScore()
                ) || 0;

        } catch (error) {

            console.error(
                "Pattern score error:",
                error
            );

        }

    }


    memoryScore =
        Math.max(
            0,
            Math.min(
                100,
                memoryScore
            )
        );


    patternScore =
        Math.max(
            0,
            Math.min(
                100,
                patternScore
            )
        );


    trendScore =
        Math.max(
            0,
            Math.min(
                100,
                trendScore
            )
        );


    const finalScore =
        (memoryScore * 0.35) +
        (patternScore * 0.40) +
        (trendScore * 0.25);


    return Math.round(
        Math.min(
            100,
            finalScore
        )
    );
}
