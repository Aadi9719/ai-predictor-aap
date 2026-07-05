alert("script.js Connected Successfully ✅");

document.getElementById("analyzeBtn").onclick = function(){

    let n1 = Number(document.getElementById("n1").value);
    let n2 = Number(document.getElementById("n2").value);

    document.getElementById("result").innerHTML =

    "Number 1 : " + n1 +
    "<br><br>" +
    "Number 2 : " + n2;

};
