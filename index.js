var request = require('request');
var express = require('express');
var rp = require('request-promise');

var request = request.defaults({
    jar: true
});

var app = express()

var getUserDialogue = function() { 
    return rp(`https://api.telegram.org/bot329503495:AAFK4qOsh0Vq6WNDOdvBDkIEctG7qdsckFQ/getupdates`);
}
var getMovieDetails = function (user_dialogue) {
    return rp(`http://api.quodb.com/search/${user_dialogue}?titles_per_page=1&phrases_per_title=1&page=1`);
}
var getNextPhrase  = function(title_id, phrase_id) { 
    return rp(`http://api.quodb.com/quotes/${title_id}/${phrase_id}`);
}
var replyTelegram = function(chat_id, reply_dialogue) {
    return rp(`https://api.telegram.org/bot329503495:AAFK4qOsh0Vq6WNDOdvBDkIEctG7qdsckFQ/sendmessage?chat_id=${chat_id}&text=${reply_dialogue}`);
}


app.get('/', function(req, res) {
    
    var chat_id = 0;

    getUserDialogue()
    .then( (data)=> {
        data = JSON.parse(data);
        var last_index = data["result"].length - 1;
        var user_dialogue = data["result"][last_index]["message"]["text"];
        chat_id = data["result"][last_index]["message"]["chat"]["id"];
        return getMovieDetails(user_dialogue);
    })
    .then((data) => {
        data = JSON.parse(data);
        title_id = data["docs"][0]["title_id"];
        phrase_id = data["docs"][0]["phrase_id"];
        return getNextPhrase(title_id, phrase_id);
    })
    .then((data) => {
        data = JSON.parse(data);
        data = data["docs"][3];
        var reply_dialogue = `${data["phrase"]}\n-${data["title"]}`;
        return replyTelegram(chat_id, reply_dialogue);
    })
    .then( ()=> {
        res.status(200);
        res.send('OK');
    });

});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
 