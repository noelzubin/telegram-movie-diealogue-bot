var request = require('request');
var express = require('express');
var rp = require('request-promise');

var request = request.defaults({
    jar: true
});

var app = express()

app.get('/', function (req, res) {
    res.send("hello there");
    get_request = {
        url : "https://api.telegram.org/bot329503495:AAFK4qOsh0Vq6WNDOdvBDkIEctG7qdsckFQ/getupdates"
    }
    rp( get_request )
        .then( req_data => {
            req_data = JSON.parse(req_data);
            last_index = req_data["result"].length - 1;
            req_dial = req_data["result"][last_index]["message"]["text"]
            chat_id = req_data["result"][last_index]["message"]["chat"]["id"]
            var dialogue = {
                url: `http://api.quodb.com/search/${req_dial}?titles_per_page=1&phrases_per_title=1&page=1`,
            };
            rp(dialogue)
                .then((response) => {
                    data = JSON.parse(response);
                    var title_id = data["docs"][0]["title_id"]
                    var phrase_id = data["docs"][0]["phrase_id"]
                    var next_phrase = {
                        url: `http://api.quodb.com/quotes/${title_id}/${phrase_id}`
                    };
                    rp(next_phrase)
                        .then((response) => {
                            next_phrases = JSON.parse(response);
                            return next_phrases["docs"][3];                            
                        })
                        .then(data => {
                            reply_dialogue = `${data["phrase"]}\n-${data["title"]}`
                            reply = {
                                url: `https://api.telegram.org/bot329503495:AAFK4qOsh0Vq6WNDOdvBDkIEctG7qdsckFQ/sendmessage?chat_id=${chat_id}&text=${reply_dialogue}`
                            }
                            rp(reply)
                            .then( response => {
                                res.status(200);
                                res.send("OK");
                            }) 
                        })
                })
               
        }) 
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
 