if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');
var singaporePools = require('./singapore-pools');
var TotoModel = require('./totoModel');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

// listen message with format ex: toto 1234 1,2,3,4,5,6
// syntax has 3 parts, separate by spaces
// first part is keyword, should be toto (case insensitive)
// second part is draw number, ex 1234
// third part is 6 numbers to check, separate by command (,)
controller.hears(['^[tT][oO][tT][oO] [0-9]{4} (\\d{1,2})+(,\\d{1,2})*$'],'direct_message,direct_mention,ambient',function(bot,message) {
    var text = message.text;
    console.log('Text message===',text, message.channel);
    bot.replyAndUpdate(message,"Waiting to check TOTO result ... :kissing_closed_eyes:");  
    console.log("1. Message obj", message)  
    var arr = text.split(" ");
    var keyword = arr[0];
    var drawNumber = arr[1]
    var numbers = arr[2];
    var isHalfBet = "false";
    var partsPurchased = "1";
    var totalNumberOfParts = "1";
    
    var request = new TotoModel.TotoRequestModel(drawNumber, isHalfBet, numbers, partsPurchased, totalNumberOfParts);
  
    singaporePools.getTotoFromServer(request).then(function(res) {
        if (res.statusCode != 200) {
          bot.replyAndUpdate(message, "Server is busy! Try again!!!")
          return;
        }
        
        console.log("2. Message obj", message)
      
        var data = res.body;
        var jsonData = JSON.parse(data.d);
        console.log('jsonData===', jsonData)  
      
        var totoReponse = new TotoModel.TotoResponseModel(jsonData);
      
        if (totoReponse.prizes.length == 0) {
          bot.replyAndUpdate(message, `You're bad luck!! Try another numbers! :sob: \n${totoReponse.displayWinningNumbers()}`);
          console.log("3. Message obj", message)
          return;
        }
      
        
        bot.replyAndUpdate(message, "CONGRATULATION!!! You're so lucky man :heart_eyes:");
        bot.replyAndUpdate(message, totoReponse.displayData());
    });
});

controller.hears(['help'],'direct_message,direct_mention',function(bot,message) {
    bot.reply(message, "type your TOTO DrawNumber and numbers to check result, ex: toto 1234 1,2,3,4,5,6")
});