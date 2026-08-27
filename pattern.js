alert("Pattern Loaded");

// ========================================
// PATTERN.JS
// PATTERN ANALYSIS + BIG/SMALL + COLOR
// ========================================

// ========================================
// SAFE INPUT READER
// ========================================

function getCurrentInput() {

    const ids = ["n1", "n2", "n3", "n4", "n5"];

    const values = ids.map(id => {

        const element = document.getElementById(id);

        if (!element) {
            return NaN;
        }

        return Number(element.value);
    });

    return values;
}


// ========================================
// INPUT VALIDATION
// ========================================

function isValidCurrentInput() {

    const input = getCurrentInput();

    return (
        input.length === 5 &&
        input.every(
            n =>
                Number.isInteger(n) &&
                n >= 0 &&
                n <= 9
        )
    );
}


// ========================================
// PATTERN PREDICTION
// ========================================

function getPatternPrediction() {

    if (!isValidCurrentInput()) {
        return null;
    }

    const currentInput = getCurrentInput();

    let bestNumber = null;
    let bestScore = -Infinity;

    /*
       Longest pattern first:
       5 → 4 → 3 → 2

       Only existing learned patterns are used.
    */

    for (let len = 5; len >= 2; len--) {

        const pattern =
            currentInput
                .slice(0, len)
                .join(",");

        const memory =
            patternMemory[pattern];

        if (!memory) {
            continue;
        }

        const nextNumbers =
            memory.nextNumbers || {};

        const total =
            Number(memory.total) || 0;

        if (total <= 0) {
            continue;
        }

        for (const key of Object.keys(nextNumbers)) {

            const number =
                Number(key);

            if (
                !Number.isInteger(number) ||
                number < 0 ||
                number > 9
            ) {
                continue;
            }

            const frequency =
                Number(nextNumbers[key]) || 0;

            if (frequency <= 0) {
                continue;
            }

            /*
               Simple stable score.

               Frequency is the main signal.
               Longer matching pattern gets more weight.
               Trust/stability are secondary filters.
            */

            const trust =
                Number(memory.trust);

            const safeTrust =
                Number.isFinite(trust)
                    ? trust
                    : 50;

            const stability =
                Number(memory.stability) || 0;

            const patternWeight =
                Number(memory.patternWeight) || 50;

            const score =

                (frequency * len * 10) +

                (safeTrust * 0.50) +

                (stability * 0.30) +

                (patternWeight * 0.20);

            if (score > bestScore) {

                bestScore = score;

                bestNumber = number;
            }
        }

        /*
           Agar 5-number pattern mil gaya,
           use priority do.
        */

        if (
            len === 5 &&
            bestNumber !== null
        ) {
            return bestNumber;
        }
    }

    return bestNumber;
}


// ========================================
// BASIC MEMORY PREDICTION
// ========================================

function getMemoryPrediction() {

    if (!isValidCurrentInput()) {
        return null;
    }

    const currentInput =
        getCurrentInput();

    const pattern =
        currentInput.join(",");

    const memory =
        patternMemory[pattern];

    if (!memory) {
        return null;
    }

    const numbers =
        memory.numbers || {};

    let bestNumber = null;
    let bestCount = -1;

    for (const key of Object.keys(numbers)) {

        const number =
            Number(key);

        const count =
            Number(numbers[key]) || 0;

        if (count > bestCount) {

            bestCount = count;

            bestNumber = number;
        }
    }

    return bestNumber;
}


// ========================================
// PATTERN SCORE
// ========================================

function getPatternScore() {

    if (!isValidCurrentInput()) {
        return 0;
    }

    const pattern =
        getCurrentInput().join(",");

    const memory =
        patternMemory[pattern];

    if (!memory) {
        return 0;
    }

    const total =
        Number(memory.total) || 0;

    const confidence =
        Number(memory.confidence) || 0;

    const trust =
        Number(memory.trust);

    const safeTrust =
        Number.isFinite(trust)
            ? trust
            : 50;

    const patternWeight =
        Number(memory.patternWeight) || 50;

    const stability =
        Number(memory.stability) || 0;

    const colorStability =
        Number(memory.colorStability) || 0;

    /*
       Keep score bounded.
    */

    let score = 0;

    score += Math.min(total * 2, 20);

    score += Math.min(
        confidence * 0.20,
        20
    );

    score +=
        safeTrust * 0.20;

    score +=
        patternWeight * 0.20;

    score +=
        stability * 0.20;

    score +=
        colorStability * 0.10;

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(score)
        )
    );
}


// ========================================
// PATTERN WIN RATE
// ========================================

function getPatternWinRate(pattern) {

    const memory =
        patternMemory[pattern];

    if (!memory) {
        return 0;
    }

    const win =
        Number(memory.win) || 0;

    const loss =
        Number(memory.loss) || 0;

    const total =
        win + loss;

    if (total <= 0) {
        return 50;
    }

    return Math.round(
        (win / total) * 100
    );
}


// ========================================
// PATTERN STRENGTH
// ========================================

function getPatternStrength(pattern) {

    const memory =
        patternMemory[pattern];

    if (!memory) {
        return 0;
    }

    const seen =
        Number(memory.total) || 0;

    const winRate =
        getPatternWinRate(pattern);

    let strength =
        (seen * 2) +
        (winRate * 3);

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(strength)
        )
    );
}


// ========================================
// RECENT ACCURACY
// ========================================

function getRecentAccuracy(pattern) {

    const memory =
        patternMemory[pattern];

    if (!memory) {
        return 50;
    }

    const win =
        Number(memory.win) || 0;

    const loss =
        Number(memory.loss) || 0;

    const total =
        win + loss;

    if (total < 5) {
        return 50;
    }

    return Math.round(
        (win / total) * 100
    );
}


// ========================================
// PRIORITY LEVEL
// ========================================

function getPriorityLevel(pattern) {

    const winRate =
        getPatternWinRate(pattern);

    const strength =
        getPatternStrength(pattern);

    const recent =
        getRecentAccuracy(pattern);

    return Math.round(
        (winRate * 0.40) +
        (strength * 0.30) +
        (recent * 0.30)
    );
}


// ========================================
// TREND PREDICTION
// ========================================

function getTrendPrediction() {

    if (
        !Array.isArray(allResults) ||
        allResults.length < 20
    ) {
        return null;
    }

    const recent =
        allResults.slice(0, 20);

    const count = {};

    for (let i = 0; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(n => {

        const number =
            Number(n);

        if (
            Number.isInteger(number) &&
            number >= 0 &&
            number <= 9
        ) {
            count[number]++;
        }
    });

    let best = null;
    let max = -1;

    for (let i = 1; i <= 9; i++) {

        if (count[i] > max) {

            max =
                count[i];

            best = i;
        }
    }

    return best;
}


// ========================================
// TREND SCORE
// ========================================

function getTrendScore() {

    if (
        !Array.isArray(allResults) ||
        allResults.length < 20
    ) {
        return 0;
    }

    const recent =
        allResults.slice(0, 20);

    const count = {};

    let currentStreak = 1;
    let maxStreak = 1;

    for (
        let i = 0;
        i < recent.length;
        i++
    ) {

        const number =
            Number(recent[i]);

        count[number] =
            (count[number] || 0) + 1;

        if (i > 0) {

            if (
                Number(recent[i]) ===
                Number(recent[i - 1])
            ) {

                currentStreak++;

                maxStreak =
                    Math.max(
                        maxStreak,
                        currentStreak
                    );

            } else {

                currentStreak = 1;
            }
        }
    }

    let maxFrequency = 0;

    for (const key of Object.keys(count)) {

        if (
            count[key] >
            maxFrequency
        ) {
            maxFrequency =
                count[key];
        }
    }

    const frequencyScore =
        (maxFrequency / 20) * 70;

    const streakScore =
        Math.min(
            (maxStreak / 5) * 30,
            30
        );

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(
                frequencyScore +
                streakScore
            )
        )
    );
}


// ========================================
// HOT / COLD
// ========================================

function getHotColdNumbers() {

    if (
        !Array.isArray(allResults) ||
        allResults.length < 20
    ) {

        return {
            hot: null,
            cold: null
        };
    }

    const recent =
        allResults.slice(0, 20);

    const count = {};

    for (let i = 0; i <= 9; i++) {
        count[i] = 0;
    }

    recent.forEach(n => {

        const number =
            Number(n);

        if (
            Number.isInteger(number) &&
            number >= 0 &&
            number <= 9
        ) {
            count[number]++;
        }
    });

    let hot = null;
    let cold = null;

    let hotCount = -1;
    let coldCount = Infinity;

    for (let i = 1; i <= 9; i++) {

        if (count[i] > hotCount) {

            hotCount =
                count[i];

            hot = i;
        }

        if (count[i] < coldCount) {

            coldCount =
                count[i];

            cold = i;
        }
    }

    return {
        hot,
        cold
    };
}


// ========================================
// FINAL NUMBER PREDICTION
// ========================================

function getFinalPrediction() {

    const memory =
        getPatternPrediction();

    const trend =
        getTrendPrediction();

    const hotCold =
        getHotColdNumbers();

    const hot =
        hotCold.hot;

    /*
       1. Strong exact pattern
    */

    if (memory !== null) {

        return memory;
    }

    /*
       2. Trend
    */

    if (trend !== null) {

        return trend;
    }

    /*
       3. Hot number
    */

    if (hot !== null) {

        return hot;
    }

    return null;
}


// ========================================
// BIG / SMALL
// ========================================

function getBigSmallPatternPrediction() {

    if (!isValidCurrentInput()) {
        return null;
    }

    const input =
        getCurrentInput();

    for (
        let len = 5;
        len >= 2;
        len--
    ) {

        const pattern =
            input
                .slice(0, len)
                .join(",");

        const memory =
            patternMemory[pattern];

        if (!memory) {
            continue;
        }

        const big =
            Number(memory.BIG) || 0;

        const small =
            Number(memory.SMALL) || 0;

        if (
            big === 0 &&
            small === 0
        ) {
            continue;
        }

        return (
            big >= small
                ? "BIG"
                : "SMALL"
        );
    }

    return null;
}


// ========================================
// BIG / SMALL CONFIDENCE
// ========================================

function getBigSmallConfidence() {

    if (!isValidCurrentInput()) {
        return 0;
    }

    const input =
        getCurrentInput();

    for (
        let len = 5;
        len >= 2;
        len--
    ) {

        const pattern =
            input
                .slice(0, len)
                .join(",");

        const memory =
            patternMemory[pattern];

        if (!memory) {
            continue;
        }

        const big =
            Number(memory.BIG) || 0;

        const small =
            Number(memory.SMALL) || 0;

        const total =
            big + small;

        if (total <= 0) {
            continue;
        }

        const best =
            Math.max(
                big,
                small
            );

        return Math.round(
            (best / total) * 100
        );
    }

    return 0;
}


// ========================================
// BIG / SMALL AI SCORE
// ========================================

function getBigSmallAIScore() {

    const confidence =
        getBigSmallConfidence();

    const trend =
        getTrendScore();

    return Math.min(
        100,
        Math.round(
            (confidence * 0.70) +
            (trend * 0.30)
        )
    );
}


// ========================================
// RECENT BIG / SMALL
// ========================================

function getBigSmallRatio(data) {

    let big = 0;
    let small = 0;

    if (!Array.isArray(data)) {
        return { big, small };
    }

    data.forEach(n => {

        const number =
            Number(n);

        if (number >= 5) {
            big++;
        } else {
            small++;
        }
    });

    return {
        big,
        small
    };
}


function getRecentBigSmallPrediction() {

    if (
        !Array.isArray(allResults) ||
        allResults.length === 0
    ) {
        return "UNKNOWN";
    }

    const last20 =
        allResults.slice(0, 20);

    const last100 =
        allResults.slice(0, 100);

    const last1000 =
        allResults.slice(0, 1000);

    const r20 =
        getBigSmallRatio(last20);

    const r100 =
        getBigSmallRatio(last100);

    const r1000 =
        getBigSmallRatio(last1000);

    const bigScore =
        (r20.big * 0.50) +
        (r100.big * 0.30) +
        (r1000.big * 0.20);

    const smallScore =
        (r20.small * 0.50) +
        (r100.small * 0.30) +
        (r1000.small * 0.20);

    return (
        bigScore >= smallScore
            ? "BIG"
            : "SMALL"
    );
}


function getFinalBigSmallPrediction() {

    const pattern =
        getBigSmallPatternPrediction();

    const recent =
        getRecentBigSmallPrediction();

    const confidence =
        getBigSmallConfidence();

    if (
        pattern !== null &&
        pattern === recent &&
        confidence >= 60
    ) {
        return pattern;
    }

    if (
        pattern !== null &&
        confidence >= 70
    ) {
        return pattern;
    }

    return recent;
}


// ========================================
// COLOR
// ========================================

function getColorPrediction(number) {

    number =
        Number(number);

    if (
        [1, 3, 7, 9]
            .includes(number)
    ) {
        return "GREEN";
    }

    if (
        [2, 4, 6, 8]
            .includes(number)
    ) {
        return "RED";
    }

    return "VIOLET";
}


function getColorPatternPrediction() {

    if (!isValidCurrentInput()) {
        return null;
    }

    const input =
        getCurrentInput();

    for (
        let len = 5;
        len >= 2;
        len--
    ) {

        const pattern =
            input
                .slice(0, len)
                .join(",");

        const memory =
            patternMemory[pattern];

        if (!memory) {
            continue;
        }

        const green =
            Number(memory.GREEN) || 0;

        const red =
            Number(memory.RED) || 0;

        if (
            green === 0 &&
            red === 0
        ) {
            continue;
        }

        return (
            green >= red
                ? "GREEN"
                : "RED"
        );
    }

    return null;
}


function getColorConfidence() {

    if (!isValidCurrentInput()) {
        return 0;
    }

    const input =
        getCurrentInput();

    for (
        let len = 5;
        len >= 2;
        len--
    ) {

        const pattern =
            input
                .slice(0, len)
                .join(",");

        const memory =
            patternMemory[pattern];

        if (!memory) {
            continue;
        }

        const green =
            Number(memory.GREEN) || 0;

        const red =
            Number(memory.RED) || 0;

        const total =
            green + red;

        if (total <= 0) {
            continue;
        }

        return Math.round(
            (Math.max(green, red) /
                total) * 100
        );
    }

    return 0;
}


function getColorAIScore() {

    const confidence =
        getColorConfidence();

    const trend =
        getTrendScore();

    return Math.min(
        100,
        Math.round(
            (confidence * 0.70) +
            (trend * 0.30)
        )
    );
}


// ========================================
// RECENT COLOR
// ========================================

function getColorRatio(data) {

    let green = 0;
    let red = 0;
    let violet = 0;

    if (!Array.isArray(data)) {
        return {
            green,
            red,
            violet
        };
    }

    data.forEach(n => {

        const number =
            Number(n);

        if (
            [1, 3, 7, 9]
                .includes(number)
        ) {

            green++;

        } else if (
            [2, 4, 6, 8]
                .includes(number)
        ) {

            red++;

        } else {

            violet++;
        }
    });

    return {
        green,
        red,
        violet
    };
}


function getRecentColorPrediction() {

    if (
        !Array.isArray(allResults) ||
        allResults.length === 0
    ) {
        return "UNKNOWN";
    }

    const r20 =
        getColorRatio(
            allResults.slice(0, 20)
        );

    const r100 =
        getColorRatio(
            allResults.slice(0, 100)
        );

    const r1000 =
        getColorRatio(
            allResults.slice(0, 1000)
        );

    const greenScore =
        (r20.green * 0.50) +
        (r100.green * 0.30) +
        (r1000.green * 0.20);

    const redScore =
        (r20.red * 0.50) +
        (r100.red * 0.30) +
        (r1000.red * 0.20);

    const violetScore =
        (r20.violet * 0.50) +
        (r100.violet * 0.30) +
        (r1000.violet * 0.20);

    if (
        greenScore >= redScore &&
        greenScore >= violetScore
    ) {
        return "GREEN";
    }

    if (
        redScore >= greenScore &&
        redScore >= violetScore
    ) {
        return "RED";
    }

    return "VIOLET";
}


function getFinalColorPrediction() {

    const pattern =
        getColorPatternPrediction();

    const recent =
        getRecentColorPrediction();

    const confidence =
        getColorConfidence();

    if (
        pattern !== null &&
        pattern === recent &&
        confidence >= 60
    ) {
        return pattern;
    }

    if (
        pattern !== null &&
        confidence >= 70
    ) {
        return pattern;
    }

    return recent;
}


// ========================================
// CANDIDATE NUMBERS
// ========================================

function getCandidateNumbers() {

    const bs =
        getFinalBigSmallPrediction();

    const color =
        getFinalColorPrediction();

    if (
        bs === "BIG" &&
        color === "GREEN"
    ) {
        return [7, 9];
    }

    if (
        bs === "BIG" &&
        color === "RED"
    ) {
        return [6, 8];
    }

    if (
        bs === "SMALL" &&
        color === "GREEN"
    ) {
        return [1, 3];
    }

    if (
        bs === "SMALL" &&
        color === "RED"
    ) {
        return [2, 4];
    }

    return [
        1, 2, 3, 4, 5,
        6, 7, 8, 9
    ];
}


// ========================================
// CANDIDATE PRIORITY
// ========================================

function getCandidatePriority(number) {

    number =
        Number(number);

    let priority = 0;

    const hotCold =
        getHotColdNumbers();

    if (
        hotCold.hot !== null &&
        number === hotCold.hot
    ) {
        priority += 15;
    }

    const candidates =
        getCandidateNumbers();

    if (
        candidates.includes(number)
    ) {
        priority += 20;
    }

    const trend =
        getTrendPrediction();

    if (
        trend !== null &&
        number === trend
    ) {
        priority += 10;
    }

    return priority;
}


// ========================================
// MASTER NUMBER SCORE
// ========================================

function getMasterNumberScore(
    number,
    pattern
) {

    number =
        Number(number);

    let patternScore = 0;

    if (pattern) {

        const memory =
            patternMemory[pattern];

        if (memory) {

            patternScore =
                getPatternScore();
        }
    }

    const bigSmall =
        getBigSmallConfidence();

    const color =
        getColorConfidence();

    const trend =
        getTrendScore();

    let numberScore = 50;

    if (
        patternMemory[pattern] &&
        patternMemory[pattern].numberWeight &&
        patternMemory[pattern]
            .numberWeight[number] !== undefined
    ) {

        numberScore =
            Number(
                patternMemory[pattern]
                    .numberWeight[number]
            ) || 50;
    }

    const score =

        (patternScore * 0.40) +

        (bigSmall * 0.20) +

        (color * 0.15) +

        (trend * 0.15) +

        (numberScore * 0.10);

    return Math.round(
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        )
    );
}


// ========================================
// PATTERN DEBUG
// ========================================

function getCurrentPattern() {

    if (!isValidCurrentInput()) {
        return null;
    }

    return getCurrentInput().join(",");
}


function getPatternDebugInfo() {

    const pattern =
        getCurrentPattern();

    if (!pattern) {

        return {
            pattern: null,
            exists: false,
            total: 0,
            prediction: null
        };
    }

    const memory =
        patternMemory[pattern];

    return {

        pattern,

        exists:
            !!memory,

        total:
            memory
                ? Number(memory.total) || 0
                : 0,

        prediction:
            getPatternPrediction()
    };
}


console.log(
    "Pattern.js Ready ✅"
);

