function updateStats(){

    document.getElementById("totalPatterns").innerText =
    Object.keys(patternMemory).length;

    document.getElementById("wins").innerText =
    aiWins;

    document.getElementById("losses").innerText =
    aiLosses;

    let total = aiWins + aiLosses;

    let accuracy = 0;

    if(total > 0){

        accuracy = Math.round((aiWins / total) * 100);

    }

    document.getElementById("accuracy").innerText =
    accuracy + "%";

}

function addHistory(text){

    let historyList =
    document.getElementById("historyList");

    let item =
    document.createElement("p");

    item.innerHTML = text;

    historyList.prepend(item);

}
