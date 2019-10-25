var express = require('express')


//App setup

var app = express();

var server = app.listen(1010, function(){
    console.log('listening to request on port 1010');
})

app.use(express.static('public'));
