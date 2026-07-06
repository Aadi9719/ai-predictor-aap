alert("Script Loaded");

document.getElementById("analyzeBtn").onclick = function () {
    alert("Analyze Button Working ✅");
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
