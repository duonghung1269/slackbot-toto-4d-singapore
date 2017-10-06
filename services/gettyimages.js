var request = require('request');
var GettyImageModel = require('../models/gettyImageModel');

var babyImagesResult = {
  result_count: -1
}

function getRandomBabyImage() {
    console.log("Get RandomBabyImage...");
  
  var pageSize = 100;
  console.log("babyImagesResult.result_count = ", babyImagesResult.result_count);
  // A page number greater than 100 is not allowed for anonymous users.
  var maxPageNumer = 100;
  var totalPages =  Math.ceil(babyImagesResult.result_count == -1 ? 1 : babyImagesResult.result_count / pageSize);
  var randomPageNumber =  Math.ceil((totalPages % maxPageNumer) * Math.random());  
  
  console.log("TotalPage = ", totalPages);
  console.log("randomPageNumber = ", randomPageNumber);
  
  //var url = `https://api.gettyimages.com/v3/search/images?phrase=baby&page_size=${pageSize}&page=${randomPageNumber}&minimum_size=large&age_of_people=newborn&fields=detail_set&sort_order=most_popular`;
  var url = `https://api.gettyimages.com/v3/search/images`;
  console.log("GETTY URL == ", url);
    return new Promise(function(resolve) { 
      request({
        url: url,
        method: "GET",
        headers: { 'Api-Key' : process.env.GETTY_IMAGES_KEY,
                 'Accept': 'application/json, text/javascript, */*; q=0.01'},
        qs: {
          'phrase': 'baby',
          'page_size': pageSize,
          'page': randomPageNumber,
          'age_of_people': ['0-1_months', '2-5_months', '6-11_months', '12-17_months', '18-23_months', '2-3_years'],
          'fields' : 'detail_set',          
        },
        json: true
      },function(err, res, body) {
          console.log(res.statusCode)  
          //console.log(res.body);
          
          if (err || res.statusCode != 200) {
            resolve(err);
            return;
          }
        
          if (res.statusCode == 200 && res.body) {
            babyImagesResult.result_count = Number(res.body.result_count);
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
