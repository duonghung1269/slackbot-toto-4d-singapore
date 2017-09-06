if (!process.env.token) {
    console.log('Error: Missing Slackbot token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');
var singaporePools = require('./services/singapore-pools');
var quote = require('./services/quote');
var giphy = require('./services/giphy')
var TotoModel = require('./models/totoModel');


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
controller.hears(['^[tT][oO][tT][oO] [0-9]{4} (\\d{1,2})+(,\\d{1,2})*$'],'direct_message,direct_mention',function(bot,message) {
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

// Reply random Quote
controller.hears(['[qQ]uote'],'direct_message,direct_mention',function(bot,message) {
    bot.reply(message, "Finding your interesting quote...");
    
  quote.getRandomQuote().then(function(res) {
        var jsonData = res.body;
        console.log('Quote ===', jsonData)  
    
        if (res.statusCode != 200 || !jsonData) {
          bot.replyAndUpdate(message, "Quote Server is busy! Try again!!!")
          return;
        }                      
      
        // var responseMessage = {
        //   "attachments": [
        //     {
        //       "fallback": jsonData.quoteText,
        //       "color": "#36a64f",
        //       "pretext": "Is this your favorite quote?",
        //       "author_name": jsonData.quoteAuthor,
        //       "author_link": jsonData.quoteLink,              
        //       "title": "Quote",
        //       "title_link": jsonData.quoteLink,
        //       "text": jsonData.quoteText,              
        //       "ts": 123456789
        //     }
        //   ]
        // }
    
        var responseMessage = {
          "mrkdwn": true,
          "attachments": [
            {
              "fallback": jsonData.quoteText,
              "color": "#2391ff",                            
              "text": jsonData.quoteText,      
              "author_name": "Author: " + jsonData.quoteAuthor,                                     
            }
          ]
        }
    
        bot.replyAndUpdate(message, responseMessage);        
    });
});

// Reply random giphy image
controller.hears(['^[gG][iI][fF]$'],'direct_message,direct_mention',function(bot,message) {        
  giphy.giphyRandom().then(function(res) {
        console.log('giphy ===', res.body)
        var jsonData = res.body;          
    
        if (res.statusCode != 200 || !jsonData || jsonData.meta.status != 200) {
          bot.replyAndUpdate(message, "Giphy Server is busy! Try again!!!")
          return;
        }                      
      
        var responseMessage = {
          "attachments": [
            {
              "fallback": jsonData.data.image_original_url,
              "color": "#2301ff",                
              "image_url": jsonData.data.image_original_url,
              "thumb_url": jsonData.data.fixed_width_small_url,
              "footer": "Gif",
              "footer_icon": jsonData.data.image_original_url,
            }
          ]
        }            
    
        bot.replyAndUpdate(message, responseMessage);        
    });
});

controller.hears(['^[hH]elp$'],'direct_message,direct_mention',function(bot,message) {
    var services = "*Toto checking*\n  ex: toto 1234 1,2,3,4,5,6\n" +
                   "*Quote*\n  ex: quote\n" +
                   "*Gif*\n  ex: gif";
    bot.reply(message, services)
});