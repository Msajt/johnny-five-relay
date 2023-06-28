const express = require('express');
const app = express();
const port = 8082;

const { Board, Led, Button, Sensor, Relay} = require("johnny-five");
const board = new Board({ port: "COM9" });

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

const ThingSpeakClient = require('thingspeakclient');
const client = new ThingSpeakClient();
    client.attachChannel(1971838, {writeKey: 'D3SAMTQTOWZDH853'});


app.listen(port, () => {
    console.log(`Listening to requests on port ${port}`);
})

app.use(express.static('public'));

board.on("ready", () => {
    let led    = new Led(3);
    let button = new Button({
        pin: 8,
        isPullup: true
    });
    let ldr = new Sensor({
        pin: "A0",
        freq: 1000
    })

    let relay = new Relay({
        pin: "A1"
    })
        relay.close();

    let isPushed = false;
    let ldrValue = 0;

    wss.on("connection", (ws, req) => {
        console.log("Conectado");
        ws.on("message", function(data){
            let dataValue = data.toString();
            let dataArray = dataValue.split(",")
            console.log(data.toString());

            // switch(dataValue){
            //     case "lamp-on":
            //         relay.open();
            //         break;
            //     case "lamp-off":
            //         relay.close();
            //         break;
            // }

            if(dataArray[0] == 'lamp'){
                if(dataArray[1] == 'on') relay.open();
                else if(dataArray[1] == 'off') relay.close();
            }
            else if(dataArray[0] == 'energy'){
                client.updateChannel(1971838, { field1: dataArray[1]}, (err, resp) => {
                    if (!err && resp > 0) console.log('update successfully. Entry number was: ' + resp);
                })
            }

            // if(dataValue == 0) relay.open();
            // else if(dataValue == 180) relay.close();
            
        })

        setInterval(() => ws.send(ldrValue), 1000);
            
    })

    button.on("down", (value) => {
        if(!isPushed){
                //led.toggle();
                console.log('Teste LED', led.toggle());
                relay.toggle();
            isPushed = true;
        }
        
    })
    button.on("up", () => {
        if(isPushed){
            isPushed = false;
        }
    })

    ldr.on("data", function(){
        ldrValue = this.value;
        console.log(ldrValue);
        // if(ldrValue > 30) led.off();
        //     else led.on();
    })

    board.on("exit", () => {
        led.off();
    });
});