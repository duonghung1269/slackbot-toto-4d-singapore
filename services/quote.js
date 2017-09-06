var request = require('request');

function getRandomQuote() {
    console.log("Get Random Quote...");
    return new Promise(function(resolve) { 
      request({
        url: "http://api.forismatic.com/api/1.0/?method=getQuote&key=457653&format=json&lang=en",
        method: "GET",        
        json: true
      },function(err, res, body) {
          console.log(res.statusCode)  
          console.log(res.body);
          resolve(res);
        });
        
    });
}

module.exports = {
  getRandomQuote
}