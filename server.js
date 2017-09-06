if (!process.env.token) {
    console.log('Error: Missing Slackbot token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');
var CronJob = require('cron').CronJob;
var singaporePools = require('./services/singapore-pools');
var quote = require('./services/quote');
var giphy = require('./services/giphy')
var TotoModel = require('./models/totoModel');

// this cachedMessage to use for job toto live to reply to slack channel
var cachedMessage = undefined;
var totoLiveNumbers = [];

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

var nextDrawNumber = 3299;
// debug cronTime: '*/10 * * * * *' // every 10 seconds
// cronTime: '*/5 30-40 18 * * 1,4',
var totoBroadcastJob = new CronJob({
  cronTime: '*/5 30-40 18 * * 1,4',
  onTick: function() {
    /*
     * Runs every 5 seconds from 18:30 to 18-40 on Tuesday and Thursday    
     */
    
    // live job
    singaporePools.getNextDrawNumber(nextDrawNumber).then(function(res) {
        if (res.statusCode != 200) {
          bot.replyAndUpdate(cachedMessage, "Server is busy! Let wait!!!")
          return;
        }              
      
        var jsonData = res.body;         
        console.log('jsonData===', jsonData)              
      
        if (!jsonData) {
          console.log("==== Undefined getNextDrawNumber response ====");
          return;
        }
      
        if (nextDrawNumber != jsonData.next_draw_id) {
          nextDrawNumber = jsonData.next_draw_id;
        }                
        
        // live not started yet
        if (!jsonData.numbers || jsonData.status == 1) {
          console.log("Live not started yet");
          return;
        }
      
        var numberOfDrawedNumbers = jsonData.numbers.length;
        var totoLiveStoredLength = totoLiveNumbers.length;
        if (numberOfDrawedNumbers == 1 && totoLiveStoredLength != numberOfDrawedNumbers) {
          var number = jsonData.numbers[0];
          totoLiveNumbers.push(number);
          bot.replyAndUpdate(cachedMessage, `The first draw number is: *${number}*`);            
          return;
        } else if (numberOfDrawedNumbers > 1 && numberOfDrawedNumbers < 6 && totoLiveStoredLength != numberOfDrawedNumbers) {
          var number = jsonData.numbers[numberOfDrawedNumbers - 1];
          totoLiveNumbers.push(number);
          bot.replyAndUpdate(cachedMessage, `The next draw number is: *${number}*`);            
          return;
        } else if (numberOfDrawedNumbers == 7 && totoLiveStoredLength != numberOfDrawedNumbers) {
          var number = jsonData.numbers[numberOfDrawedNumbers - 1];
          bot.replyAndUpdate(cachedMessage, `The *bonus* draw number is: *${jsonData.numbers[number]}*`);  
          totoLiveNumbers.push(number);
          return;
        }
        
        bot.replyAndUpdate(cachedMessage, "Thanks for watching Toto live! See you on next Draw!");
        
    });
  }, function () {
    /* This function is executed when the job stops */
    // clear stored toto live numbers
    totoLiveNumbers = [];
  },
  start: false,
  timeZone: 'Asia/Singapore'
});

totoBroadcastJob.start();

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
      
        cachedMessage = message;  
      
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
      
        cachedMessage = message;
    
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
      
        cachedMessage = message;
    
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
  cachedMessage = message;  
  
  var services = "*Toto checking*\n  ex: toto 1234 1,2,3,4,5,6\n" +
                   "*Quote*\n  ex: quote\n" +
                   "*Gif*\n  ex: gif";
    bot.reply(message, services)    
});