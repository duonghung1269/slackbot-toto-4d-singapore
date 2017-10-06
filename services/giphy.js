var request = require('request');
var GIPHY_RANDOM_URL = `http://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_TOKEN}`;

function giphyRandom() {
    console.log("Get giphyRandom...");
    return new Promise(function(resolve) { 
      request({
        url: GIPHY_RANDOM_URL,
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
  giphyRandom
}

/*
// Gipphy Random Response example

{
    "data": {
        "type": "gif",
        "id": "cMvTwFoEvp1Xa",
        "url": "http://giphy.com/gifs/amber-heard-gif-hunt-cMvTwFoEvp1Xa",
        "image_original_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/giphy.gif",
        "image_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/giphy.gif",
        "image_mp4_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/giphy.mp4",
        "image_frames": "10",
        "image_width": "245",
        "image_height": "245",
        "fixed_height_downsampled_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/200_d.gif",
        "fixed_height_downsampled_width": "200",
        "fixed_height_downsampled_height": "200",
        "fixed_width_downsampled_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/200w_d.gif",
        "fixed_width_downsampled_width": "200",
        "fixed_width_downsampled_height": "200",
        "fixed_height_small_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/100.gif",
        "fixed_height_small_still_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/100_s.gif",
        "fixed_height_small_width": "100",
        "fixed_height_small_height": "100",
        "fixed_width_small_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/100w.gif",
        "fixed_width_small_still_url": "https://media0.giphy.com/media/cMvTwFoEvp1Xa/100w_s.gif",
        "fixed_width_small_width": "100",
        "fixed_width_small_height": "100",
        "username": "",
        "caption": ""
    },
    "meta": {
        "status": 200,
        "msg": "OK",
        "response_id": "59afc965534e716836477202"
    }
}

*/