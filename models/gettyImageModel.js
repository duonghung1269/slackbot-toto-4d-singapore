'use strict';

function GettyImageModel(jsonResponse) 
{
  this.id = jsonResponse.id;
  this.caption = jsonResponse.caption;
  this.display_sizes = jsonResponse.display_sizes;
  this.getThumbImage = function() {    
    return getImageUrl(jsonResponse.display_sizes, "thumb");
  };
  this.getCompImage = function() {    
    return getImageUrl(jsonResponse.display_sizes, "comp");
  };
  this.getPreviewImage = function() {    
    return getImageUrl(jsonResponse.display_sizes, "preview");
  };
  
}

function getImageUrl(displaySizes, type) {
  var imageUrl = "";
  displaySizes.forEach(function(displaySize) {
      if (displaySize.name == type) {
        imageUrl = displaySize.uri;
        return imageUrl;
      }
            
    });
  
  return imageUrl;
}

module.exports = 
  {
    GettyImageModel
  }