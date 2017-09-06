'use strict';

function TotoRequestModel(drawNumber, isHalfBet, numbers, partsPurchased, totalNumberOfParts) {
	this.drawNumber = drawNumber;
	this.isHalfBet = isHalfBet;
	this.numbers = numbers;
	this.partsPurchased = partsPurchased;
	this.totalNumberOfParts = totalNumberOfParts;	
}

function TotoResponseModel(response) {
  this.winningNumbers = response.WinningNumbers;
  this.additionalNumber = response.AdditionalNumber;
  this.prizes = [];
  // response.Prizes.foreach(function(prize) {
  //   this.prizes.push(new TotoPrizeModel(prize));
  // });
  
  console.log("====response.Prizes.length", response.Prizes.length);
  for (var i = 0; i < response.Prizes.length; i++) {
    this.prizes.push(new TotoPrizeModel(response.Prizes[i]));
  }
  
  this.displayData = function() {
    var str = `*Winning Numbers:* _${this.winningNumbers.join(' ')}_\n` +
            `*Additional Number:* _${this.additionalNumber}_\n`;
    for (var i = 0; i < this.prizes.length; i++) {
      str += this.prizes[i].displayData() + `\n`;
    }
    
    return str;
  }
  
  this.displayWinningNumbers = function() {
    return `*Winning Numbers:* _${this.winningNumbers.join(' ')}_\n`;
  }
}

function TotoPrizeModel(prize) {
  this.groupNumber = prize.GroupNumber;
  this.numberOfSharesWon = prize.NumberOfSharesWon;
  this.total = prize.Total;
  
  this.displayData = function() {
    return `*Prize Group:* ${this.groupNumber}\n` +
            `*No. of Winning Shares:* ${this.numberOfSharesWon}\n` +
            `*Your TOTO bet won:* \`S$${this.total / this.numberOfSharesWon}\``;
  }
}

module.exports = 
  {
    TotoRequestModel,TotoResponseModel,TotoPrizeModel
  }