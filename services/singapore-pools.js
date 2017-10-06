var request = require('request');
var TOTO_DRAW_DAYS = [1, 4]; // Monday, Thursday

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

function getNextDrawNumber(drawId) {
    console.log("Get Next Draw Number...");
    return new Promise(function(resolve) { 
      request({
        url: `https://lottery.nestia.com/api/v4.5/toto/draws/${drawId}/broadcast`,
        method: "GET",
        headers: { 'Content-Type': 'application/json; charset=UTF-8',
                 'Accept': 'application/json, text/javascript, */*; q=0.01',
                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'},
        json: true
      },function(err, res, body) {
          console.log(res.statusCode)  
          console.log(res.body);
          resolve(res);
        });
        
    });
}



// Get Day of week
// return: 0 Sunday, 1 Monday, 2 Tuesdays, 3 Wednesday, 4 Thursday, 5 Friday, 6 Saturday
function getDayOfWeek() {
  var day = new Date();
  return day.getDay();
}

function isTotoDrawToday() {
    var dayOfWeek = getDayOfWeek();
    return TOTO_DRAW_DAYS.indexOf(dayOfWeek) != -1;
}

module.exports = {
  getTotoFromServer,isTotoDrawToday,getNextDrawNumber
}