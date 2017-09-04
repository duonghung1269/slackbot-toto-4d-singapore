var request = require('request');

// ex numbers: 02,10,12,18,23,26
function getTotoFromServer(totoRequestModel) {
    console.log("Retrieving latest toto result...", totoRequestModel);
    return new Promise(function(resolve) { 
      request({
        url: "http://www.singaporepools.com.sg/_layouts/15/TotoApplication/TotoCommonPage.aspx/CalculatePrizeForTOTO",
        method: "POST",
        headers: { 'Content-Type': 'application/json; charset=UTF-8',
                 'Accept': 'application/json, text/javascript, */*; q=0.01'},
        body: totoRequestModel,
        json: true
      },function(err, res, body) {
          console.log(res.statusCode)  
          console.log(res.body);
          resolve(res);
        });
        
    });
}

module.exports = {
  getTotoFromServer
}