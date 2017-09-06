var Crawler = require("crawler");
var c = new Crawler({
    maxConnections : 10,
    rateLimit: 2000
});


function crawlToto(drawdate) {
  return new Promise(function(resolve) { 
    c.queue([{
      uri: 'http://sg.myfreepost.com/sgTOTO_get.php?drawdate=31-Aug-2017(Thu)',
      jQuery: true,

      // The global callback won't be called 
      callback: function (error, res, done) {
          if(error){
              console.log(error);
              done();
          }else{
              var $ = res.$;
              console.log('===== Grabbed ====', res.body.length, 'bytes');
              console.log($("title").html());
              console.log($("body").html());
              var resultTable = $("#TABLE_13");            
              console.log(resultTable.html());          
                            
              done();
              resolve(resultTable.html());
          }

      }
    }])
  });
}


module.exports = {
  crawlToto
}