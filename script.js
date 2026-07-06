alert("Script Loaded");

document.getElementById("analyzeBtn").onclick = function () {

    let n1 = Number(document.getElementById("n1").value);
    let n2 = Number(document.getElementById("n2").value);
    let n3 = Number(document.getElementById("n3").value);
    let n4 = Number(document.getElementById("n4").value);
    let n5 = Number(document.getElementById("n5").value);

    let numbers = [n1, n2, n3, n4, n5];

    // Save history
    allResults.push(...numbers);

    localStorage.setItem(
        "allResults",
        JSON.stringify(allResults)
    );

    // Temporary prediction
    nextPrediction = Math.floor(Math.random() * 10);

    document.getElementById("result").innerHTML =
    `
    <h2>AI Prediction 🔥</h2>

    Next Number :
    <b>${nextPrediction}</b>

    <br><br>

    Total Saved Numbers :
    ${allResults.length}
    `;

    console.log(allResults);

};

document.getElementById("checkBtn").onclick = function () {
    alert("Check Button Working ✅");
};
// =========================
// AI DATA
// =========================

let allResults =
JSON.parse(localStorage.getItem("allResults")) || [];

let patternMemory =
JSON.parse(localStorage.getItem("patternMemory")) || {};

let aiWins =
Number(localStorage.getItem("aiWins")) || 0;

let aiLosses =
Number(localStorage.getItem("aiLosses")) || 0;

let nextPrediction = null;
