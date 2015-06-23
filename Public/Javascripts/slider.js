/* =======================================
    Slider v4.2
    A simple, responsive, touch-enabled image slider, forked from Swipe.
    Script by Brad Birdsall.
    http://swipejs.com/
    Forked by Chris Ferdinandi.
    http://gomakethings.com
    Code contributed by Ron Ilan.
    https://github.com/bradbirdsall/Swipe/pull/277
    Licensed under the MIT license.
    http://gomakethings.com/mit/
 * =====================================*/

if ( 'querySelector' in document && 'addEventListener' in window ) {

  var Swipe = function (container, options) {

    "use strict";

    // utilities
    var noop = function() {}; // simple no operation function
    var offloadFn = function(fn) { setTimeout(fn || noop, 0); }; // offload a functions execution

    // check browser capabilities
    var browser = {
      addEventListener: !!window.addEventListener,
      pointer: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
      touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
      transitions: (function(temp) {
        var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
        for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
        return false;
      })(document.createElement('swipe'))
    };

    var eventNames = {
      START: 'touchstart',
      MOVE: 'touchmove',
      END: 'touchend'
    };

    var pointerType = 'touch';

    if (window.navigator.pointerEnabled) {
      eventNames.START = "pointerdown";
      eventNames.MOVE = "pointermove";
      eventNames.END = "pointerup";
    } else if (window.navigator.msPointerEnabled) {
      eventNames.START = "MSPointerDown";
      eventNames.MOVE = "MSPointerMove";
      eventNames.END = "MSPointerUp";
      pointerType = 2;
    }

    // quit if no root element
    if (!container) return;
    var element = container.children[0];
    var slides, slidePos, width, length;
    options = options || {};
    var index = parseInt(options.startSlide - 1, 10) || 0;
    var speed = options.speed !== undefined ? options.speed : 300;
    options.continuous = options.continuous !== undefined ? options.continuous : true;

    var setup = function () {

      // cache slides
      slides = element.children;
      length = slides.length;

      // set continuous to false if only one slide
      if (slides.length < 2) options.continuous = false;

      // create an array to store current positions of each slide
      slidePos = new Array(slides.length);

      // determine width of each slide
      width = container.getBoundingClientRect().width || container.offsetWidth;

      element.style.width = (slides.length * width) + 'px';

      // stack elements
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];

        slide.style.width = width + 'px';
        slide.setAttribute('data-index', pos);

        if (browser.transitions) {
          slide.style.left = (pos * -width) + 'px';
          move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
        }

      }

      // reposition elements before and after index
      if (options.continuous && browser.transitions) {
        move(circle(index-1), -width, 0);
        move(circle(index+1), width, 0);
      }

      if (!browser.transitions) element.style.left = (index * -width) + 'px';

      visibleThree(index, slides);
      container.style.visibility = 'visible';

    };

    var prev = function () {

      if (options.continuous) slide(index-1);
      else if (index) slide(index-1);

    };

    var next = function () {

      if (options.continuous) slide(index+1);
      else if (index < slides.length - 1) slide(index+1);

    };

    var circle = function (index) {

      // a simple positive modulo using slides.length
      return (slides.length + (index % slides.length)) % slides.length;

    };

    var slide = function (to, slideSpeed) {

      // do nothing if already on requested slide
      if (index == to) return;

      if (browser.transitions) {

        var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

        // get the actual position of the slide
        if (options.continuous) {
          var natural_direction = direction;
          direction = -slidePos[circle(to)] / width;

          // if going forward but to < index, use to = slides.length + to
          // if going backward but to > index, use to = -slides.length + to
          if (direction !== natural_direction) to =  -direction * slides.length + to;

        }

        var diff = Math.abs(index-to) - 1;

        // move all the slides between index and to in the right direction
        while (diff--) move( circle((to > index ? to : index) - diff - 1), width * direction, 0);

        to = circle(to);

        move(index, width * direction, slideSpeed || speed);
        move(to, 0, slideSpeed || speed);

        if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place

      } else {

        to = circle(to);
        animate(index * -width, to * -width, slideSpeed || speed);
        //no fallback for a circular continuous if the browser does not accept transitions
      }

      index = to;
      offloadFn(options.callback && options.callback(index, slides[index]));
    };

    var move = function (index, dist, speed) {
      translate(index, dist, speed);
      slidePos[index] = dist;

    };

    var translate = function (index, dist, speed) {
      //console.log("translate");
      var slide = slides[index];
      var style = slide && slide.style;

      if (!style) return;

      style.webkitTransitionDuration = (speed || 1) + 'ms';
      style.MozTransitionDuration = (speed || 1) + 'ms';
      style.msTransitionDuration = (speed || 1) + 'ms';
      style.OTransitionDuration = (speed || 1) + 'ms';
      style.transitionDuration = (speed || 1) + 'ms';

      style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
      style.msTransform = 'translateX(' + dist + 'px)';
      style.MozTransform = 'translateX(' + dist + 'px)';
      style.OTransform = 'translateX(' + dist + 'px)';

    };

    var animate = function (from, to, speed) {
      console.log("animate");
      // if not an animation, just reposition
      if (!speed) {

        element.style.left = to + 'px';

        visibleThree(index, slides);
        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        return;

      }

      var start = +new Date;

      var timer = setInterval(function() {

        var timeElap = +new Date - start;

        if (timeElap > speed) {

          element.style.left = to + 'px';

          if (delay) begin();
          visibleThree(index, slides);
          options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

          clearInterval(timer);
          return;

        }

        element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

      }, 4);

    };

    // hide all slides other than current one
    function visibleThree(index, slides) {
      var pos = slides.length;
      // first make this one visible
      slides[index].style.visibility = 'visible';

      // then check all others for hiding
      while(pos--) {

        if(pos === circle(index) || pos === circle(index-1) || pos === circle(index+1)){
          slides[pos].style.visibility = 'visible';
        } else {
          slides[pos].style.visibility = 'hidden';
        }

      }

    }

    // setup auto slideshow
    var delay = options.auto || 0;
    var interval;

    var begin = function () {

      interval = setTimeout(next, delay);

    };

    var stop = function () {

      delay = 0;
      clearTimeout(interval);

    };


    // setup initial vars
    var start = {};
    var delta = {};
    var isScrolling;

    // setup event capturing
    var events = {

      handleEvent: function(event) {

        switch (event.type) {
          case eventNames.START: this.start(event); break;
          case eventNames.MOVE: this.move(event); break;
          case eventNames.END: offloadFn(this.end(event)); break;
          case 'webkitTransitionEnd':
          case 'msTransitionEnd':
          case 'oTransitionEnd':
          case 'otransitionend':
          case 'transitionend': offloadFn(this.transitionEnd(event)); break;
          case 'resize': offloadFn(setup.call()); break;
        }

        if (options.stopPropagation) event.stopPropagation();

      },
      start: function(event) {

        var touches = browser.touch ? event.touches[0] : event;

        // measure start values
        start = {

          // get initial touch coords
          x: touches.pageX,
          y: touches.pageY,

          // store time to determine touch duration
          time: +new Date

        };

        // used for testing first move event
        isScrolling = undefined;

        // reset delta and end measurements
        delta = {};

        // attach touchmove and touchend listeners
        element.addEventListener(eventNames.MOVE, this, false);
        element.addEventListener(eventNames.END, this, false);

      },
      move: function(event) {

        if ( browser.pointer && (event.pointerType !== pointerType) ) return;

        // ensure swiping with one touch and not pinching
        if ( browser.touch && event.touches.length > 1 || event.scale && event.scale !== 1) return;

        if (options.disableScroll) event.preventDefault();
        if ( browser.pointer && (event.pointerType !== pointerType) ) return;
        var touches = browser.touch ? event.touches[0] : event;

        // measure change in x and y
        delta = {
          x: touches.pageX - start.x,
          y: touches.pageY - start.y
        };

        // determine if scrolling test has run - one time test
        if ( typeof isScrolling == 'undefined') {
          isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
        }

        // if user is not trying to scroll vertically
        if (!isScrolling) {

          // prevent native scrolling
          event.preventDefault();

          // stop slideshow
          stop();

          // increase resistance if first or last slide
          if (options.continuous) { // we don't add resistance at the end

            translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
            translate(index, delta.x + slidePos[index], 0);
            translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);

          } else {

            delta.x =
              delta.x /
                ( (!index && delta.x > 0               // if first slide and sliding left
                || index == slides.length - 1        // or if last slide and sliding right
                && delta.x < 0                       // and if sliding at all
                ) ?
                ( Math.abs(delta.x) / width + 1 )      // determine resistance level
                : 1 );                                 // no resistance if false

            // translate 1:1
            translate(index-1, delta.x + slidePos[index-1], 0);
            translate(index, delta.x + slidePos[index], 0);
            translate(index+1, delta.x + slidePos[index+1], 0);
          }

        }

      },
      end: function(event) {

        // measure duration
        var duration = +new Date - start.time;

        // determine if slide attempt triggers next/prev slide
        var isValidSlide =
              Number(duration) < 250               // if slide duration is less than 250ms
              && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
              || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

        // determine if slide attempt is past start and end
        var isPastBounds =
          !index && delta.x > 0 // if first slide and slide amt is greater than 0
          || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

        if (options.continuous) isPastBounds = false;

        // determine direction of swipe (true:right, false:left)
        var direction = delta.x < 0;

        // if not scrolling vertically
        if (!isScrolling) {

          if (isValidSlide && !isPastBounds) {

            if (direction) {

              if (options.continuous) { // we need to get the next in this direction in place

                move(circle(index-1), -width, 0);
                move(circle(index+2), width, 0);

              } else {
                move(index-1, -width, 0);
              }

              move(index, slidePos[index]-width, speed);
              move(circle(index+1), slidePos[circle(index+1)]-width, speed);
              index = circle(index+1);

            } else {
              if (options.continuous) { // we need to get the next in this direction in place

                move(circle(index+1), width, 0);
                move(circle(index-2), -width, 0);

              } else {
                move(index+1, width, 0);
              }

              move(index, slidePos[index]+width, speed);
              move(circle(index-1), slidePos[circle(index-1)]+width, speed);
              index = circle(index-1);

            }

            options.callback && options.callback(index, slides[index]);

          } else {

            if (options.continuous) {

              move(circle(index-1), -width, speed);
              move(index, 0, speed);
              move(circle(index+1), width, speed);

            } else {

              move(index-1, -width, speed);
              move(index, 0, speed);
              move(index+1, width, speed);
            }

          }

        }

        // kill touchmove and touchend event listeners until touchstart called again
        element.removeEventListener(eventNames.MOVE, events, false);
        element.removeEventListener(eventNames.END, events, false);

      },
      transitionEnd: function(event) {

        visibleThree(index, slides);

        if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

          if (delay) begin();

          options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        }

      }

    };

    // trigger setup
    setup();

    // start auto slideshow if applicable
    if (delay) begin();


    // add event listeners
    if (browser.addEventListener) {

      // set touchstart event on element
      if (browser.touch || browser.pointer) element.addEventListener(eventNames.START, events, false);

      if (browser.transitions) {
        element.addEventListener('webkitTransitionEnd', events, false);
        element.addEventListener('msTransitionEnd', events, false);
        element.addEventListener('oTransitionEnd', events, false);
        element.addEventListener('otransitionend', events, false);
        element.addEventListener('transitionend', events, false);
      }

      // set resize event on window
      window.addEventListener('resize', events, false);

    } else {

      window.onresize = function () { setup() }; // to play nice with old IE

    }

    // expose the Swipe API
    return {
      setup: function() {

        setup();

      },
      
      slide: function(to, speed) {
        // cancel slideshow
        stop();

        slide(to, speed);

      },
      prev: function() {
        // cancel slideshow
        stop();

        prev();

      },

      next: function() {
        // cancel slideshow
        stop();

        next();

      },

      getPos: function() {
        // return current index position
        return index + 1;
      },

      getNumSlides: function() {
        // return total number of slides
        return length;
      },

      kill: function() {

        // cancel slideshow
        stop();

        // reset element
        element.style.width = 'auto';
        element.style.left = 0;

        // reset slides
        var pos = slides.length;
        while(pos--) {

          var slide = slides[pos];
          slide.style.width = '100%';
          slide.style.left = 0;

          if (browser.transitions) translate(pos, 0, 0);

        }

        // removed event listeners
        if (browser.addEventListener) {

          // remove current event listeners
          element.removeEventListener(eventNames.START, events, false);
          element.removeEventListener('webkitTransitionEnd', events, false);
          element.removeEventListener('msTransitionEnd', events, false);
          element.removeEventListener('oTransitionEnd', events, false);
          element.removeEventListener('otransitionend', events, false);
          element.removeEventListener('transitionend', events, false);
          window.removeEventListener('resize', events, false);

        }
        else {
          window.onresize = null;

        }

      }
    };

  };

}

