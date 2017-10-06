var request = require('request');
var GettyImageModel = require('../models/gettyImageModel');

var babyImagesResult = {
  result_count: -1
}

function getRandomBabyImage() {
    console.log("Get RandomBabyImage...");
  
  var pageSize = 10;
  var totalPages =  Math.ceil(babyImagesResult.result_count == -1 ? 1 : babyImagesResult.result_count / pageSize);
  var randomPageNumber =  Math.ceil(totalPages * Math.random());  
  
  console.log("TotalPage = ", totalPages);
  console.log("randomPageNumber = ", randomPageNumber);
  
  var url = `https://api.gettyimages.com/v3/search/images?phrase=baby&page_size=${pageSize}&page=${randomPageNumber}&minimum_size=large&age_of_people=baby&fields=detail_set&sort_order=most_popular`;
  
    return new Promise(function(resolve) { 
      request({
        url: url,
        method: "GET",
        headers: { 'Api-Key' : process.env.GETTY_IMAGES_KEY,
                 'Accept': 'application/json, text/javascript, */*; q=0.01'},
        json: true
      },function(err, res, body) {
          console.log(res.statusCode)  
          //console.log(res.body);
          
          if (res.statusCode == 200 && res.body) {
            babyImagesResult.result_count = res.body.result_count;
            console.log("TOTOAL RESULT COUNT = ", res.body.result_count);
          }
        
          var result = res.body;
          var images = result.images;
          var totalImages = images.length;
        
          var randomImage = undefined;
          if (totalImages) {
            var randIndex = Math.floor(Math.random() * totalImages);
            console.log("Random images index = ", randIndex);
            randomImage = images[randIndex];
          }
          
          resolve(new GettyImageModel.GettyImageModel(randomImage));
        });
        
    });
}

module.exports = {
  getRandomBabyImage
}