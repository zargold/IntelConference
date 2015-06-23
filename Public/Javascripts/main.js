(function (global) {
  var Template = function (str) {
    this.template = str || '';
 
    Object.defineProperties( this, {
      modifier: {
        writable: true,
        value: this._modifier
      }
    });
 
    return this;
  }
 
  Object.defineProperties( Template.prototype, {
    _regex: {
      writable: false,
      value: /#{(((?!{).)*)}/g
    },
 
    _modifier: {
      writable: false,
      value: function ( match, key ) {
        return this[key] || '';
      }
    },
 
    parse: {
      writable: false,
      value: function (data) {
        return this.template.replace(this._regex, this.modifier.bind(data));
      }
    }
  });
 
  global['Template'] = Template;
 
}(this));

//Prevent Name space pollution with app obj.
var app = {};

app.moments;

window.onload = function(){
  var carousel = document.getElementById("carousel");
  var carouselTemp = document.getElementById("carousel-temp")
  //Test Asynchronous Process
  //console.log(carousel);
  var strip = document.getElementById("strip");
  var stripTemp = document.getElementById("strip-template")
  app.countSlides = 0;
  //Template Filling using Parsed data
  app.fillOut = function(){
    //Capture the Template Info.
    var thumbs = new Template(stripTemp.innerText.trim());
    var caros = new Template(carouselTemp.innerText.trim());
    //Fill out both Views in single iteration for optimized big O.
    app.moments.forEach(function(moment){
      var tinyLi = document.createElement("li");
      var bigDiv = document.createElement("div");
      bigDiv.innerHTML = caros.parse(moment);
      tinyLi.innerHTML = thumbs.parse(moment);
      tinyLi.className = "thumbs";
      carousel.appendChild(bigDiv);
      strip.appendChild(tinyLi);
      app.countSlides++;
      
    });
    // setTimeout(1000, function(){
      app.startSlider(app.countSlides);
    // })
    
  };

  //Parse through the Image.
  app.parseResponse = function(){
    //Fix a typo in the JSON file
    var moments = this.responseText.replace(";", ":");
    moments = JSON.parse(moments);

    //Capture the overall Title
    var title = moments.album.name;
    
    //Place photos in app.moments array
    var photos = moments.photos;
    app.moments = photos;
    app.fillOut();
  };


  //Make the get Request
  app.fetchImages = function(){
    var xhr = new XMLHttpRequest()
    xhr.onload = app.parseResponse;
    xhr.open('GET', '/gallery_json.js', true)
    xhr.send();
  };

  app.fetchImages();
  app.startSlider = function(slideCount){
        // Feature Test
    if ( 'querySelector' in document && 'addEventListener' in window && Array.prototype.forEach ) {

      // SELECTORS
      var sliders = document.querySelectorAll('[data-slider]');
      var mySwipe = Array;

      // Activate all sliders
      Array.prototype.forEach.call(sliders, function (slider, index) {

          // SELECTORS
          var slideNav = slider.querySelector('[data-slider-nav]'); // Slider nav wrapper

          // METHODS

          // Stop all videos from playing when leaving the slide
          var stopVideo = function () {
              var currentSlide = mySwipe[index].getPos() - 1;
              var iframe = slider.querySelector( '[data-index="' + currentSlide + '"] iframe');
              var video = slider.querySelector( '[data-index="' + currentSlide + '"] video' );
              if ( iframe !== null ) {
                  var iframeSrc = iframe.src;
                  iframe.src = iframeSrc;
              }
              if ( video !== null ) {
                  video.pause();
              }
          };

          // Handle next button
          var handleNextBtn = function (event) {
              event.preventDefault();
              stopVideo();
              mySwipe[index].next();
          };

          // Handle previous button
          var handlePrevBtn = function (event) {
              event.preventDefault();
              stopVideo();
              mySwipe[index].prev();
          };

          // Handle keypress
          var handleKeypress = function (event) {
              if ( event.keyCode == 37 ) {
                  stopVideo();
                  mySwipe[index].prev();
              }
              if ( event.keyCode == 39) {
                  stopVideo();
                  mySwipe[index].next();
              }
          };

          //My custom strategy to swipe seemlessly to thumbnails.
          //First add Event listeners to each thumbnail.
          for (var i = 1; i <= slideCount; i++) {
            var imagei = document.getElementById("thumb" + i);
            imagei.addEventListener("click", function(){handleThumbClick(this)});
          }

          var handleThumbClick = function(elem) {
            var elID = elem.id.replace("thumb", "");
            elID = parseInt(elID, 10);

            var curr = mySwipe[index].getPos();
            //Find minimal amount of steps required
            var times = elID - curr;
            if ( times > 0 ){
              for( var i = 0; i < times; i++ ) {
                mySwipe[index].next();
              }
            //Apply Prev method to slide backwards minimally.
            } else if ( times < 0 ) {
              for( var i = 0; i > times; i-- ) {
                mySwipe[index].prev();
              }
            }
            curr = mySwipe[index].getPos();
          }

          // Select Buttons add events
          var btnPrev = document.getElementById("navigate-left"); // Next slide button
          var btnNext = document.getElementById("navigate-right"); // Previous slide button

          // Toggle Previous & Next Buttons
          btnNext.addEventListener('click', handleNextBtn, false);

          btnPrev.addEventListener('click', handlePrevBtn, false);

          window.addEventListener('keydown', handleKeypress, false);

          // Activate Slider
          mySwipe[index] = Swipe(slider, {
              // startSlide: 2,
              // speed: 400,
              // auto: 3000,
              continuous: true,
              // disableScroll: false,
              // stopPropagation: false,
          });
        });
      }
    } 
}