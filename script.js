alert("script.js Connected Successfully ✅");

let allResults =
JSON.parse(localStorage.getItem("allResults")) || [];

document.getElementById("analyzeBtn").onclick = function(){

    let n1 = Number(document.getElementById("n1").value);
let n2 = Number(document.getElementById("n2").value);
let n3 = Number(document.getElementById("n3").value);
let n4 = Number(document.getElementById("n4").value);
let n5 = Number(document.getElementById("n5").value);

let numbers = [n1,n2,n3,n4,n5];

    allResults.push(...numbers);

    localStorage.setItem(
"allResults",
JSON.stringify(allResults)
);

console.log(allResults);
    
    document.getElementById("result").innerHTML =
numbers.join(" | ");

    "Number 1 : " + n1 +
    "<br><br>" +
    "Number 2 : " + n2;

};

document.getElementById("checkBtn").onclick = function(){

    let actualResult = Number(
        prompt("Enter Actual Result")
    );

    if(isNaN(actualResult)){
        alert("Please Enter Valid Number");
        return;
    }

    updateLearningMemory(actualResult);

    alert("AI Learned Successfully ✅");

};

alert("END OF SCRIPT");
