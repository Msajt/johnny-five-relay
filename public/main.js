window.onload = function(){
    let socket = new WebSocket('ws://localhost:8080');
    
    let b1 = document.getElementById('relayon');
    let b2 = document.getElementById('relayoff');
    let s = document.getElementById("degree");
    let res = document.getElementById("result");
    let resLamp = document.getElementById("lamp-use");
    
    let cont = 0;
    let gotData = false;

    b1.addEventListener('click', activateLamp);

    b2.addEventListener('click', deactivateLamp);

    s.addEventListener("input", function() {
        res.innerHTML = s.value;
        socket.send(s.value);
    }, false);
    
    socket.addEventListener("message", serverValues => {
        let ldrMaxValue = s.value;
        let ldrValue = serverValues.data;
        console.log(serverValues.data);
        
        if(ldrValue < ldrMaxValue) activateLamp();
        else if(ldrValue >= ldrMaxValue) deactivateLamp();
    })
    
    function activateLamp(){
        cont++;
        console.log(cont, "segundos");
        socket.send(['lamp', 'on']);
        //s.value = 0;
        res.innerHTML = "The lamp was activated";
        gotData = false;
    }
    
    function deactivateLamp(){
        socket.send(['lamp', 'off']);
        //s.value = 180;
        res.innerHTML = "The lamp was deactivated";
        if(!gotData) sendToThingSpeak(cont);
        cont = 0;
    }

    function sendToThingSpeak(time){
        //let KEY = "D3SAMTQTOWZDH853";
        //const http = newXMLHttpRequest();
        let energyUse = (time/60) * 15;
        socket.send(['energy', energyUse]);
        // http.open("GET", `https://api.thingspeak.com/update?api_key=${KEY}&field1=0${energyUse}`);
        // http.send();
        console.log("Dados enviados");
        resLamp.innerHTML = `A lampada consumiu ${energyUse}W/min`;
        gotData = true;
    }
}
