function getColorPrediction(number){

    if([1,3,7,9].includes(number)){
        return "🟢 GREEN";
    }

    if([2,4,6,8].includes(number)){
        return "🔴 RED";
    }

    return "🟣 VIOLET";

}

function getBigSmallPrediction(number){

    if(number >= 5){
        return "🔵 BIG";
    }

    return "🟡 SMALL";

}
