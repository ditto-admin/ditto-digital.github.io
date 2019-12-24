(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Form = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Form =
/*#__PURE__*/
function () {
  function Form(id) {
    var _this = this;

    _classCallCheck(this, Form);

    // Initialize Form reference and submit listener
    this.form = document.querySelector("#".concat(id));
    this.form.addEventListener('submit', function (e) {
      e.preventDefault();

      _this.submit(e);
    });
    document.querySelector('button.resubmit').addEventListener('click', function (e) {
      location.reload(false);
    }); // Bind Form functions

    this.getData = this.getData.bind(this);
    this.validate = this.validate.bind(this);
    this.submit = this.submit.bind(this);
  } // TODO: clean up


  _createClass(Form, [{
    key: "getData",
    value: function getData() {
      var elements = this.form.elements;
      var honeypot;
      var fields = Object.keys(elements).filter(function (k) {
        // Filter out fields we don't need the value of
        if (elements[k].name === 'honeypot') {
          honeypot = elements[k].value;
          return false;
        } else if (elements[k].tagName === 'BUTTON') {
          return false;
        }

        return true;
      }).map(function (k) {
        // Map to a new array of just the element names
        if (elements[k].name !== undefined) {
          return elements[k].name; // special case for Edge's html collection
        } else if (elements[k].length > 0) {
          return elements[k].item(0).name;
        }
      });
      var formData = {};
      fields.forEach(function (name) {
        var element = elements[name]; // console.log(element);

        if (element.type == 'checkbox') {
          formData[name] = element.checked;
        } else formData[name] = element.value;
      }); // add form-specific values into the data

      formData.formDataNameOrder = JSON.stringify(fields);
      formData.formGoogleSheetName = this.form.dataset.sheet || "responses"; // default sheet name

      formData.formGoogleSendEmail = this.form.dataset.email || ""; // no email by default

      return {
        data: formData,
        honeypot: honeypot
      };
    }
  }, {
    key: "validate",
    value: function validate() {
      // Reset labels (required & error messaging)
      var labels = Array.from(this.form.querySelectorAll('label'));

      for (var _i = 0; _i < labels.length; _i++) {
        var l = labels[_i];
        l.classList.remove('error');
      } // Run HTML Form validation check


      var isValid = this.form.checkValidity(); // Setup variables

      var invalidElements = [];
      var elements = this.form.elements; // Get any invalid elements (deemed invalid by checkValidity)

      if (!isValid) invalidElements = this.form.querySelectorAll(':invalid'); // Add any invalid checkboxes to the list of invalids

      var checkboxGroups = this.form.querySelectorAll('.checkbox-group');

      if (checkboxGroups.length) {
        for (var i = 0; i < checkboxGroups.length; i++) {
          if (invalidElements.length > 0) invalidElements = Array.from(invalidElements);else invalidElements = [];

          if (checkboxGroups[i].querySelectorAll('input[type="checkbox"]:checked').length == 0) {
            invalidElements.push(checkboxGroups[i]);
            checkboxGroups[i].querySelector('label').classList.add('error');
            invalidElements[invalidElements.length - 1].name = checkboxGroups[i].dataset.name;
            isValid = false;
          }
        }
      } // Add error class to invalids' labels, and return data or false


      if (!isValid) {
        for (var _i2 = 0; _i2 < invalidElements.length; _i2++) {
          console.log(invalidElements[_i2]);

          if (invalidElements[_i2].classList.contains('checkbox-group')) {
            invalidElements[_i2].classList.add('error');

            continue;
          }

          this.form.querySelector("label[for='".concat(invalidElements[_i2].name, "'")).classList.add('error');
        }

        return false;
      }

      return this.getData();
    }
  }, {
    key: "submit",
    value: function submit(event) {
      var form = event.target;
      var formData = this.validate();
      this.form.classList.add('submitted'); // Check if formData is validated

      if (!formData) {
        var jumpTo = this.form.querySelector('label.error').getBoundingClientRect().top - 146;
        window.scrollBy(0, jumpTo);
        return false;
      } // TODO: remove next two lines to make submit work


      console.log('[DEBUG]: data: ', formData.data); // return false;

      var data = formData.data; // If a honeypot field is filled, assume it was done so by a spam bot.

      if (formData.honeypot) {
        return false;
      } // this.showConfirmation();
      // return false;


      var url = form.action;
      var xhr = new XMLHttpRequest();
      var self = this;
      xhr.open('POST', url); // xhr.withCredentials = true;

      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          form.reset();
          console.log('%c [Form]: Submitted! ', 'color: gold');
          self.showConfirmation();
        }
      }; // url encode form data for sending as post data


      var encoded = Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
      }).join('&');
      xhr.send(encoded);
    }
  }, {
    key: "showConfirmation",
    value: function showConfirmation() {
      console.log("fuckin CONFIRMED");
      this.form.classList.add('hide');
      document.querySelector('.form-confirmation').classList.add('show');
      var jumpTo = document.querySelector('.form-confirmation').getBoundingClientRect().top - 146;
      window.scrollBy(0, jumpTo);
    }
  }]);

  return Form;
}();

exports.Form = Form;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Gallery = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Gallery =
/*#__PURE__*/
function () {
  function Gallery(id) {
    _classCallCheck(this, Gallery);

    this.id = id;
    this.currentIndex = 0;
    this.gallery = undefined;
    this.galleryItems = [];
    this.indicatorWrapper = undefined;
    this.timer = undefined;
  }

  _createClass(Gallery, [{
    key: "init",
    value: function init() {
      var _this = this;

      this.gallery = document.querySelector("#".concat(this.id));
      this.galleryItems = this.gallery.querySelectorAll('.gallery-item');
      this.indicatorWrapper = this.gallery.querySelector('.indicator-wrapper');
      this.setupIndicator();
      var self = this; // store a reference of the context for anon functions

      this.gallery.querySelector('.gallery-arrows .arrow.left').addEventListener('click', function () {
        self.handleDecrementItem(self);
      });
      this.gallery.querySelector('.gallery-arrows .arrow.right').addEventListener('click', function () {
        self.handleIncrementItem(self);
      }); // Handle Mobile swipe gestures

      var swipeXStart = 0;
      var swipeXEnd = 0;
      this.gallery.addEventListener('touchstart', function (e) {
        swipeXStart = e.touches[0].clientX;
      });
      this.gallery.addEventListener('touchend', function (e) {
        swipeXEnd = e.changedTouches[0].clientX;

        if (swipeXEnd > swipeXStart) {
          // swiped left
          self.handleDecrementItem(self);
        } else if (swipeXEnd < swipeXStart) {
          // swiped right
          self.handleIncrementItem(self);
        }
      }); // FIXME: one day maybe make this setTimer call once the gallery is in view

      window.setTimeout(function () {
        _this.setTimer();
      }, 5000);
    }
  }, {
    key: "setTimer",
    value: function setTimer() {
      var _this2 = this;

      clearInterval(this.timer);
      this.timer = setInterval(function () {
        _this2.handleTimer();
      }, 5000);
    }
  }, {
    key: "handleTimer",
    value: function handleTimer() {
      this.currentIndex++;
      console.log('oi');

      if (this.currentIndex == this.galleryItems.length) {
        this.currentIndex = 0;
      }

      this.handleIndicator(undefined, this.currentIndex);
    }
  }, {
    key: "setupIndicator",
    value: function setupIndicator() {
      var _this3 = this;

      var count = this.galleryItems.length - 1;
      var indicator;

      var _loop = function _loop(i) {
        indicator = document.createElement('div');
        indicator.classList.add('indicator', "i-".concat(i));
        if (i == 0) indicator.classList.add('current');
        indicator.addEventListener('click', function (e) {
          _this3.handleIndicator(e.target, i);
        });

        _this3.indicatorWrapper.appendChild(indicator);
      };

      for (var i = 0; i < this.galleryItems.length; i++) {
        _loop(i);
      }
    }
  }, {
    key: "handleIndicator",
    value: function handleIndicator(indicator, index) {
      var indicators = this.indicatorWrapper.querySelectorAll('[class*="indicator"]');

      if (this.indicatorWrapper.querySelector('.current')) {
        this.indicatorWrapper.querySelector('.current').classList.remove('current');
      }

      if (indicator == undefined) {
        indicator = indicators[index];
      }

      console.log(indicator);
      indicator.classList.add('current');
      this.setCurrentItem(this.galleryItems[index], index);
    }
  }, {
    key: "handleDecrementItem",
    value: function handleDecrementItem(self) {
      if (self.currentIndex == 0) {
        self.currentIndex = self.galleryItems.length - 1;
        console.log(self.currentIndex, self.galleryItems.length - 1);
        self.handleIndicator(undefined, self.currentIndex);
      } else {
        self.currentIndex--;
        self.handleIndicator(undefined, self.currentIndex);
        self.animate('left');
      }
    }
  }, {
    key: "handleIncrementItem",
    value: function handleIncrementItem(self) {
      if (self.currentIndex == self.galleryItems.length - 1) {
        self.currentIndex = 0;
        self.handleIndicator(undefined, self.currentIndex);
      } else {
        self.currentIndex++;
        self.handleIndicator(undefined, self.currentIndex);
        self.animate('right');
      }
    }
  }, {
    key: "setCurrentItem",
    value: function setCurrentItem(item, index) {
      this.setTimer();
      this.gallery.querySelector('.current').classList.remove('current');
      item.classList.add('current');
      this.currentIndex = index;
    }
  }, {
    key: "animate",
    value: function animate(direction) {
      if (direction == 'left') {
        this.gallery.classList.remove('animate-right');
        this.gallery.classList.add('animate-left');
      } else if (direction == 'right') {
        this.gallery.classList.remove('animate-left');
        this.gallery.classList.add('animate-right');
      }
    }
  }]);

  return Gallery;
}();

exports.Gallery = Gallery;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Player = void 0;

var _howler = require("./howler");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Player – sound sample player object that the playstate of an audio file and
 * the UI to control the playback of the sample
 * @type {object}
 */
var Player =
/*#__PURE__*/
function () {
  function Player(id, src) {
    _classCallCheck(this, Player);

    this.id = id;
    this.isPlaying = false; // The sound sample and it's metadata

    this.sample = {
      sound: undefined,
      src: src,
      info: {
        time: 0,
        minute: 0,
        second: 0,
        timeFormatted: ''
      }
    };
    this.player = null; // Scrubber element

    this.scrubber = null; // Timestamp element

    this.timestamp = null; // Global timer for counting ticks for UI updates

    this.timer = {
      // id: 0 (all)
      timestamp: undefined,
      // id: 1
      scrubber: undefined // id: 2

    };
  }
  /**
   * Initialize Player instance and UI
   * @return none
   */


  _createClass(Player, [{
    key: "init",
    value: function init() {
      // Setup player element
      this.player = document.querySelector("#".concat(this.id)); // Setup scrubber element

      this.scrubber = this.player.querySelector('.scrubber'); // Setup timestamp element

      this.timestamp = this.player.querySelector('.timestamp-timeleft');
      this.scrubber.step = 0.01;
      var self = this; // temp for using class functions within listener function

      var tempPlayState; // used to keep playing if scrubbing during playback

      this.scrubber.addEventListener('mousedown', function (e) {
        self.isPlaying = self.sample.sound.playing();
        tempPlayState = JSON.parse(JSON.stringify(self.isPlaying));
        self.soundPause();
      });
      this.scrubber.addEventListener('mouseup', function (e) {
        console.log("updating range value", e.target.value, Math.round(e.target.value));
        self.soundScrub(e.target.value);
        self.isPlaying = tempPlayState;
        if (self.isPlaying) self.soundStart();
      }); // Setup sample sound

      this.sample.sound = new _howler.Howl({
        src: [this.sample.src]
      });
      this.soundLoad(); // Setup sound listeners

      this.sample.sound.once('load', function () {
        self.soundLoad();
      });
      this.sample.sound.on('end', function () {
        self.soundEnd();
      });
    }
    /**
     * Update the timestamp UI
     * @param  {number} seekVal value being seeked to match the timestamp to
     * @return none
     */

  }, {
    key: "updateTimestamp",
    value: function updateTimestamp(seekVal) {
      // TODO: fix timestamp so it doesn't let you select O using the slider, round
      // up to 1 if 1 > t > 0
      if (seekVal == undefined) seekVal = Math.round(this.sample.sound.seek());
      var c = {}; // Current time

      c.time = this.sample.info.time - Math.round(this.sample.sound.seek());
      c.minute = Math.floor(c.time / 60);
      c.second = c.time - c.minute * 60;
      c.formattedTime = "".concat(c.minute, ":").concat(('0' + c.second).slice(-2));
      this.timestamp.innerHTML = c.formattedTime;
    }
    /**
     * Update the scrub handle UI
     * @param  {number} seekVal value being seeked to match the scrubber to
     * @return none
     */

  }, {
    key: "updateScrubberPosition",
    value: function updateScrubberPosition(seekVal) {
      if (seekVal == undefined) this.scrubber.value = this.sample.sound.seek();else this.scrubber.value = seekVal;
    }
    /**
     * Load sound information and set scrubber UI variables
     * (Callback for sound.onload)
     * @return none
     */

  }, {
    key: "soundLoad",
    value: function soundLoad() {
      console.log('Sound loaded.');
      this.sample.info.time = Math.floor(this.sample.sound.duration());
      this.sample.info.minute = Math.floor(this.sample.info.time / 60);
      this.sample.info.second = this.sample.info.time - this.sample.info.minute * 60;
      this.sample.info.formattedTime = "".concat(this.sample.info.minute, ":").concat(('0' + this.sample.info.second).slice(-2));
      this.timestamp.innerHTML = this.sample.info.formattedTime;
      this.scrubber.max = this.sample.info.time;
      this.scrubber.value = 0;
    }
    /**
     * Handler for scrubbing (seeking) the sound sample
     * @param  {number} seekVal value to seek the sound to
     * @return none
     */

  }, {
    key: "soundScrub",
    value: function soundScrub(seekVal) {
      console.log('Sound scrubbed.');
      this.sample.sound.seek(seekVal);
      this.updateTimestamp(seekVal);
      this.updateScrubberPosition(seekVal);
    }
    /**
     * Handler for starting the sound sample
     * @return none
     */

  }, {
    key: "soundStart",
    value: function soundStart() {
      // Prevent overlapping instances of the sound
      if (this.sample.sound.playing()) return;
      console.log('Sound start.');
      this.setTimer(0);
      this.sample.sound.play();
      this.isPlaying = true;
    }
    /**
     * Handler for pausing the sound sample
     * @return none
     */

  }, {
    key: "soundPause",
    value: function soundPause() {
      // const temp = JSON.parse(JSON.stringify(this.isPlaying));
      // console.log('temp', temp);
      console.log('Sound paused.');
      this.clearTimer(0);
      this.sample.sound.pause();
      this.isPlaying = false;
    }
    /**
     * Handler for stopping the sound sample
     * @return none
     */

  }, {
    key: "soundStop",
    value: function soundStop() {
      console.log('Sound stopped.');
      this.clearTimer(0);
      this.sample.sound.stop();
      this.isPlaying = false;
    }
    /**
     * Handler for when the sound sample ends
     * (Callback for sound.onend)
     * @return none
     */

  }, {
    key: "soundEnd",
    value: function soundEnd() {
      console.log('Sound finished.');
      this.clearTimer(0);
      this.isPlaying = false;
      this.resetPlayer();
    }
    /**
     * Toggles the sound between play and pause
     * @return none
     */

  }, {
    key: "soundToggle",
    value: function soundToggle() {
      if (this.isPlaying) {
        this.soundPause();
        this.togglePlayButton('play');
      } else {
        this.soundStart();
        this.togglePlayButton('pause');
      }
    }
    /**
     * Handler for UI Play button that toggles between play and pause icons
     * @return {[type]} [description]
     */

  }, {
    key: "togglePlayButton",
    value: function togglePlayButton(specifiedIcon) {
      var button = this.player.querySelector('.player-icon');

      if (specifiedIcon !== undefined) {
        switch (specifiedIcon) {
          case 'play':
            button.classList.remove('pause');
            button.classList.add('play');
            break;

          case 'pause':
            button.classList.remove('play');
            button.classList.add('pause');
            break;

          default:
            break;
        }
      } else {
        if (this.isPlaying) {
          button.classList.remove('play');
          button.classList.add('pause');
        } else {
          button.classList.remove('pause');
          button.classList.add('play');
        }
      }
    }
  }, {
    key: "resetPlayer",
    value: function resetPlayer() {
      this.soundScrub(0);
      this.togglePlayButton('play');
    }
    /**
     * Clear intervals to maintain ticks for UI
     * @param  {number} timerId 0 for all timers, 1 for timestamp, 2 for scrubber
     * @return none
     */

  }, {
    key: "clearTimer",
    value: function clearTimer(timerId) {
      switch (timerId) {
        case 0:
          clearInterval(this.timer.timestamp);
          clearInterval(this.timer.scrubber);
          break;

        case 1:
          clearInterval(this.timer.timestamp);
          break;

        case 2:
          clearInterval(this.timer.scrubber);
          break;
      }
    }
    /**
     * Set intervals to maintain ticks for UI
     * @param {number} timerId 0 for all timers, 1 for timestamp, 2 for scrubber
     */

  }, {
    key: "setTimer",
    value: function setTimer(timerId) {
      var _this = this;

      switch (timerId) {
        case 0:
          this.timer.timestamp = setInterval(function () {
            _this.updateTimestamp();
          }, 500);
          this.timer.scrubber = setInterval(function () {
            _this.updateScrubberPosition();
          }, 15);
          break;

        case 1:
          this.timer.timestamp = setInterval(function () {
            _this.updateTimestamp();
          }, 500);
          break;

        case 2:
          this.timer.scrubber = setInterval(function () {
            _this.updateScrubberPosition();
          }, 15);
          break;
      }
    }
  }]);

  return Player;
}();

exports.Player = Player;

},{"./howler":4}],4:[function(require,module,exports){
(function (global){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
 *  howler.js v2.1.2
 *  howlerjs.com
 *
 *  (c) 2013-2019, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
(function () {
  'use strict';
  /** Global Methods **/

  /***************************************************************************/

  /**
   * Create the global controller. All contained methods and properties apply
   * to all sounds that are currently playing or will be in the future.
   */

  var HowlerGlobal = function HowlerGlobal() {
    this.init();
  };

  HowlerGlobal.prototype = {
    /**
     * Initialize the global Howler object.
     * @return {Howler}
     */
    init: function init() {
      var self = this || Howler; // Create a global ID counter.

      self._counter = 1000; // Pool of unlocked HTML5 Audio objects.

      self._html5AudioPool = [];
      self.html5PoolSize = 10; // Internal properties.

      self._codecs = {};
      self._howls = [];
      self._muted = false;
      self._volume = 1;
      self._canPlayEvent = 'canplaythrough';
      self._navigator = typeof window !== 'undefined' && window.navigator ? window.navigator : null; // Public properties.

      self.masterGain = null;
      self.noAudio = false;
      self.usingWebAudio = true;
      self.autoSuspend = true;
      self.ctx = null; // Set to false to disable the auto audio unlocker.

      self.autoUnlock = true; // Setup the various state values for global tracking.

      self._setup();

      return self;
    },

    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function volume(vol) {
      var self = this || Howler;
      vol = parseFloat(vol); // If we don't have an AudioContext created yet, run the setup.

      if (!self.ctx) {
        setupAudioContext();
      }

      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        self._volume = vol; // Don't update any of the nodes if we are muted.

        if (self._muted) {
          return self;
        } // When using Web Audio, we just need to adjust the master gain.


        if (self.usingWebAudio) {
          self.masterGain.gain.setValueAtTime(vol, Howler.ctx.currentTime);
        } // Loop through and change volume for all HTML5 audio nodes.


        for (var i = 0; i < self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds(); // Loop through all sounds and change the volumes.


            for (var j = 0; j < ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node) {
                sound._node.volume = sound._volume * vol;
              }
            }
          }
        }

        return self;
      }

      return self._volume;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    mute: function mute(muted) {
      var self = this || Howler; // If we don't have an AudioContext created yet, run the setup.

      if (!self.ctx) {
        setupAudioContext();
      }

      self._muted = muted; // With Web Audio, we just need to mute the master gain.

      if (self.usingWebAudio) {
        self.masterGain.gain.setValueAtTime(muted ? 0 : self._volume, Howler.ctx.currentTime);
      } // Loop through and mute all HTML5 Audio nodes.


      for (var i = 0; i < self._howls.length; i++) {
        if (!self._howls[i]._webAudio) {
          // Get all of the sounds in this Howl group.
          var ids = self._howls[i]._getSoundIds(); // Loop through all sounds and mark the audio node as muted.


          for (var j = 0; j < ids.length; j++) {
            var sound = self._howls[i]._soundById(ids[j]);

            if (sound && sound._node) {
              sound._node.muted = muted ? true : sound._muted;
            }
          }
        }
      }

      return self;
    },

    /**
     * Unload and destroy all currently loaded Howl objects.
     * @return {Howler}
     */
    unload: function unload() {
      var self = this || Howler;

      for (var i = self._howls.length - 1; i >= 0; i--) {
        self._howls[i].unload();
      } // Create a new AudioContext to make sure it is fully reset.


      if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== 'undefined') {
        self.ctx.close();
        self.ctx = null;
        setupAudioContext();
      }

      return self;
    },

    /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function codecs(ext) {
      return (this || Howler)._codecs[ext.replace(/^x-/, '')];
    },

    /**
     * Setup various state values for global tracking.
     * @return {Howler}
     */
    _setup: function _setup() {
      var self = this || Howler; // Keeps track of the suspend/resume state of the AudioContext.

      self.state = self.ctx ? self.ctx.state || 'suspended' : 'suspended'; // Automatically begin the 30-second suspend process

      self._autoSuspend(); // Check if audio is available.


      if (!self.usingWebAudio) {
        // No audio is available on this system if noAudio is set to true.
        if (typeof Audio !== 'undefined') {
          try {
            var test = new Audio(); // Check if the canplaythrough event is available.

            if (typeof test.oncanplaythrough === 'undefined') {
              self._canPlayEvent = 'canplay';
            }
          } catch (e) {
            self.noAudio = true;
          }
        } else {
          self.noAudio = true;
        }
      } // Test to make sure audio isn't disabled in Internet Explorer.


      try {
        var test = new Audio();

        if (test.muted) {
          self.noAudio = true;
        }
      } catch (e) {} // Check for supported codecs.


      if (!self.noAudio) {
        self._setupCodecs();
      }

      return self;
    },

    /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */
    _setupCodecs: function _setupCodecs() {
      var self = this || Howler;
      var audioTest = null; // Must wrap in a try/catch because IE11 in server mode throws an error.

      try {
        audioTest = typeof Audio !== 'undefined' ? new Audio() : null;
      } catch (err) {
        return self;
      }

      if (!audioTest || typeof audioTest.canPlayType !== 'function') {
        return self;
      }

      var mpegTest = audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''); // Opera version <33 has mixed MP3 support, so we need to check for and block it.

      var checkOpera = self._navigator && self._navigator.userAgent.match(/OPR\/([0-6].)/g);

      var isOldOpera = checkOpera && parseInt(checkOpera[0].split('/')[1], 10) < 33;
      self._codecs = {
        mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''))),
        mpeg: !!mpegTest,
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
        aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
        caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
        m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
        flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
      };
      return self;
    },

    /**
     * Some browsers/devices will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _unlockAudio: function _unlockAudio() {
      var self = this || Howler; // Only run this if Web Audio is supported and it hasn't already been unlocked.

      if (self._audioUnlocked || !self.ctx) {
        return;
      }

      self._audioUnlocked = false;
      self.autoUnlock = false; // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
      // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
      // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.

      if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
        self._mobileUnloaded = true;
        self.unload();
      } // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
      // http://stackoverflow.com/questions/24119684


      self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050); // Call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS, Android, etc.

      var unlock = function unlock(e) {
        // Create a pool of unlocked HTML5 Audio objects that can
        // be used for playing sounds without user interaction. HTML5
        // Audio objects must be individually unlocked, as opposed
        // to the WebAudio API which only needs a single activation.
        // This must occur before WebAudio setup or the source.onended
        // event will not fire.
        for (var i = 0; i < self.html5PoolSize; i++) {
          try {
            var audioNode = new Audio(); // Mark this Audio object as unlocked to ensure it can get returned
            // to the unlocked pool when released.

            audioNode._unlocked = true; // Add the audio node to the pool.

            self._releaseHtml5Audio(audioNode);
          } catch (e) {
            self.noAudio = true;
          }
        } // Loop through any assigned audio nodes and unlock them.


        for (var i = 0; i < self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds(); // Loop through all sounds and unlock the audio nodes.


            for (var j = 0; j < ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node && !sound._node._unlocked) {
                sound._node._unlocked = true;

                sound._node.load();
              }
            }
          }
        } // Fix Android can not play in suspend state.


        self._autoResume(); // Create an empty buffer.


        var source = self.ctx.createBufferSource();
        source.buffer = self._scratchBuffer;
        source.connect(self.ctx.destination); // Play the empty buffer.

        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        } // Calling resume() on a stack initiated by user gesture is what actually unlocks the audio on Android Chrome >= 55.


        if (typeof self.ctx.resume === 'function') {
          self.ctx.resume();
        } // Setup a timeout to check that we are unlocked on the next event loop.


        source.onended = function () {
          source.disconnect(0); // Update the unlocked state and prevent this check from happening again.

          self._audioUnlocked = true; // Remove the touch start listener.

          document.removeEventListener('touchstart', unlock, true);
          document.removeEventListener('touchend', unlock, true);
          document.removeEventListener('click', unlock, true); // Let all sounds know that audio has been unlocked.

          for (var i = 0; i < self._howls.length; i++) {
            self._howls[i]._emit('unlock');
          }
        };
      }; // Setup a touch start listener to attempt an unlock in.


      document.addEventListener('touchstart', unlock, true);
      document.addEventListener('touchend', unlock, true);
      document.addEventListener('click', unlock, true);
      return self;
    },

    /**
     * Get an unlocked HTML5 Audio object from the pool. If none are left,
     * return a new Audio object and throw a warning.
     * @return {Audio} HTML5 Audio object.
     */
    _obtainHtml5Audio: function _obtainHtml5Audio() {
      var self = this || Howler; // Return the next object from the pool if one exists.

      if (self._html5AudioPool.length) {
        return self._html5AudioPool.pop();
      } //.Check if the audio is locked and throw a warning.


      var testPlay = new Audio().play();

      if (testPlay && typeof Promise !== 'undefined' && (testPlay instanceof Promise || typeof testPlay.then === 'function')) {
        testPlay.catch(function () {
          console.warn('HTML5 Audio pool exhausted, returning potentially locked audio object.');
        });
      }

      return new Audio();
    },

    /**
     * Return an activated HTML5 Audio object to the pool.
     * @return {Howler}
     */
    _releaseHtml5Audio: function _releaseHtml5Audio(audio) {
      var self = this || Howler; // Don't add audio to the pool if we don't know if it has been unlocked.

      if (audio._unlocked) {
        self._html5AudioPool.push(audio);
      }

      return self;
    },

    /**
     * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
     * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
     * @return {Howler}
     */
    _autoSuspend: function _autoSuspend() {
      var self = this;

      if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === 'undefined' || !Howler.usingWebAudio) {
        return;
      } // Check if any sounds are playing.


      for (var i = 0; i < self._howls.length; i++) {
        if (self._howls[i]._webAudio) {
          for (var j = 0; j < self._howls[i]._sounds.length; j++) {
            if (!self._howls[i]._sounds[j]._paused) {
              return self;
            }
          }
        }
      }

      if (self._suspendTimer) {
        clearTimeout(self._suspendTimer);
      } // If no sound has played after 30 seconds, suspend the context.


      self._suspendTimer = setTimeout(function () {
        if (!self.autoSuspend) {
          return;
        }

        self._suspendTimer = null;
        self.state = 'suspending';
        self.ctx.suspend().then(function () {
          self.state = 'suspended';

          if (self._resumeAfterSuspend) {
            delete self._resumeAfterSuspend;

            self._autoResume();
          }
        });
      }, 30000);
      return self;
    },

    /**
     * Automatically resume the Web Audio AudioContext when a new sound is played.
     * @return {Howler}
     */
    _autoResume: function _autoResume() {
      var self = this;

      if (!self.ctx || typeof self.ctx.resume === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      if (self.state === 'running' && self._suspendTimer) {
        clearTimeout(self._suspendTimer);
        self._suspendTimer = null;
      } else if (self.state === 'suspended') {
        self.ctx.resume().then(function () {
          self.state = 'running'; // Emit to all Howls that the audio has resumed.

          for (var i = 0; i < self._howls.length; i++) {
            self._howls[i]._emit('resume');
          }
        });

        if (self._suspendTimer) {
          clearTimeout(self._suspendTimer);
          self._suspendTimer = null;
        }
      } else if (self.state === 'suspending') {
        self._resumeAfterSuspend = true;
      }

      return self;
    }
  }; // Setup the global audio controller.

  var Howler = new HowlerGlobal();
  /** Group Methods **/

  /***************************************************************************/

  /**
   * Create an audio group controller.
   * @param {Object} o Passed in properties for this group.
   */

  var Howl = function Howl(o) {
    var self = this; // Throw an error if no source is provided.

    if (!o.src || o.src.length === 0) {
      console.error('An array of source files must be passed with any new Howl.');
      return;
    }

    self.init(o);
  };

  Howl.prototype = {
    /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */
    init: function init(o) {
      var self = this; // If we don't have an AudioContext created yet, run the setup.

      if (!Howler.ctx) {
        setupAudioContext();
      } // Setup user-defined default properties.


      self._autoplay = o.autoplay || false;
      self._format = typeof o.format !== 'string' ? o.format : [o.format];
      self._html5 = o.html5 || false;
      self._muted = o.mute || false;
      self._loop = o.loop || false;
      self._pool = o.pool || 5;
      self._preload = typeof o.preload === 'boolean' ? o.preload : true;
      self._rate = o.rate || 1;
      self._sprite = o.sprite || {};
      self._src = typeof o.src !== 'string' ? o.src : [o.src];
      self._volume = o.volume !== undefined ? o.volume : 1;
      self._xhrWithCredentials = o.xhrWithCredentials || false; // Setup all other default properties.

      self._duration = 0;
      self._state = 'unloaded';
      self._sounds = [];
      self._endTimers = {};
      self._queue = [];
      self._playLock = false; // Setup event listeners.

      self._onend = o.onend ? [{
        fn: o.onend
      }] : [];
      self._onfade = o.onfade ? [{
        fn: o.onfade
      }] : [];
      self._onload = o.onload ? [{
        fn: o.onload
      }] : [];
      self._onloaderror = o.onloaderror ? [{
        fn: o.onloaderror
      }] : [];
      self._onplayerror = o.onplayerror ? [{
        fn: o.onplayerror
      }] : [];
      self._onpause = o.onpause ? [{
        fn: o.onpause
      }] : [];
      self._onplay = o.onplay ? [{
        fn: o.onplay
      }] : [];
      self._onstop = o.onstop ? [{
        fn: o.onstop
      }] : [];
      self._onmute = o.onmute ? [{
        fn: o.onmute
      }] : [];
      self._onvolume = o.onvolume ? [{
        fn: o.onvolume
      }] : [];
      self._onrate = o.onrate ? [{
        fn: o.onrate
      }] : [];
      self._onseek = o.onseek ? [{
        fn: o.onseek
      }] : [];
      self._onunlock = o.onunlock ? [{
        fn: o.onunlock
      }] : [];
      self._onresume = []; // Web Audio or HTML5 Audio?

      self._webAudio = Howler.usingWebAudio && !self._html5; // Automatically try to enable audio.

      if (typeof Howler.ctx !== 'undefined' && Howler.ctx && Howler.autoUnlock) {
        Howler._unlockAudio();
      } // Keep track of this Howl group in the global controller.


      Howler._howls.push(self); // If they selected autoplay, add a play event to the load queue.


      if (self._autoplay) {
        self._queue.push({
          event: 'play',
          action: function action() {
            self.play();
          }
        });
      } // Load the source file unless otherwise specified.


      if (self._preload) {
        self.load();
      }

      return self;
    },

    /**
     * Load the audio file.
     * @return {Howler}
     */
    load: function load() {
      var self = this;
      var url = null; // If no audio is available, quit immediately.

      if (Howler.noAudio) {
        self._emit('loaderror', null, 'No audio support.');

        return;
      } // Make sure our source is in an array.


      if (typeof self._src === 'string') {
        self._src = [self._src];
      } // Loop through the sources and pick the first one that is compatible.


      for (var i = 0; i < self._src.length; i++) {
        var ext, str;

        if (self._format && self._format[i]) {
          // If an extension was specified, use that instead.
          ext = self._format[i];
        } else {
          // Make sure the source is a string.
          str = self._src[i];

          if (typeof str !== 'string') {
            self._emit('loaderror', null, 'Non-string found in selected audio sources - ignoring.');

            continue;
          } // Extract the file extension from the URL or base64 data URI.


          ext = /^data:audio\/([^;,]+);/i.exec(str);

          if (!ext) {
            ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          }
        } // Log a warning if no extension was found.


        if (!ext) {
          console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
        } // Check if this extension is available.


        if (ext && Howler.codecs(ext)) {
          url = self._src[i];
          break;
        }
      }

      if (!url) {
        self._emit('loaderror', null, 'No codec support for selected audio sources.');

        return;
      }

      self._src = url;
      self._state = 'loading'; // If the hosting page is HTTPS and the source isn't,
      // drop down to HTML5 Audio to avoid Mixed Content errors.

      if (window.location.protocol === 'https:' && url.slice(0, 5) === 'http:') {
        self._html5 = true;
        self._webAudio = false;
      } // Create a new sound object and add it to the pool.


      new Sound(self); // Load and decode the audio data for playback.

      if (self._webAudio) {
        loadBuffer(self);
      }

      return self;
    },

    /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Number}          Sound ID.
     */
    play: function play(sprite, internal) {
      var self = this;
      var id = null; // Determine if a sprite, sound id or nothing was passed

      if (typeof sprite === 'number') {
        id = sprite;
        sprite = null;
      } else if (typeof sprite === 'string' && self._state === 'loaded' && !self._sprite[sprite]) {
        // If the passed sprite doesn't exist, do nothing.
        return null;
      } else if (typeof sprite === 'undefined') {
        // Use the default sound sprite (plays the full audio length).
        sprite = '__default'; // Check if there is a single paused sound that isn't ended. 
        // If there is, play that sound. If not, continue as usual.  

        if (!self._playLock) {
          var num = 0;

          for (var i = 0; i < self._sounds.length; i++) {
            if (self._sounds[i]._paused && !self._sounds[i]._ended) {
              num++;
              id = self._sounds[i]._id;
            }
          }

          if (num === 1) {
            sprite = null;
          } else {
            id = null;
          }
        }
      } // Get the selected node, or get one from the pool.


      var sound = id ? self._soundById(id) : self._inactiveSound(); // If the sound doesn't exist, do nothing.

      if (!sound) {
        return null;
      } // Select the sprite definition.


      if (id && !sprite) {
        sprite = sound._sprite || '__default';
      } // If the sound hasn't loaded, we must wait to get the audio's duration.
      // We also need to wait to make sure we don't run into race conditions with
      // the order of function calls.


      if (self._state !== 'loaded') {
        // Set the sprite value on this sound.
        sound._sprite = sprite; // Mark this sound as not ended in case another sound is played before this one loads.

        sound._ended = false; // Add the sound to the queue to be played on load.

        var soundId = sound._id;

        self._queue.push({
          event: 'play',
          action: function action() {
            self.play(soundId);
          }
        });

        return soundId;
      } // Don't play the sound if an id was passed and it is already playing.


      if (id && !sound._paused) {
        // Trigger the play event, in order to keep iterating through queue.
        if (!internal) {
          self._loadQueue('play');
        }

        return sound._id;
      } // Make sure the AudioContext isn't suspended, and resume it if it is.


      if (self._webAudio) {
        Howler._autoResume();
      } // Determine how long to play for and where to start playing.


      var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
      var duration = Math.max(0, (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000 - seek);
      var timeout = duration * 1000 / Math.abs(sound._rate);
      var start = self._sprite[sprite][0] / 1000;
      var stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
      var loop = !!(sound._loop || self._sprite[sprite][2]);
      sound._sprite = sprite; // Mark the sound as ended instantly so that this async playback
      // doesn't get grabbed by another call to play while this one waits to start.

      sound._ended = false; // Update the parameters of the sound.

      var setParams = function setParams() {
        sound._paused = false;
        sound._seek = seek;
        sound._start = start;
        sound._stop = stop;
        sound._loop = loop;
      }; // End the sound instantly if seek is at the end.


      if (seek >= stop) {
        self._ended(sound);

        return;
      } // Begin the actual playback.


      var node = sound._node;

      if (self._webAudio) {
        // Fire this when the sound is ready to play to begin Web Audio playback.
        var playWebAudio = function playWebAudio() {
          self._playLock = false;
          setParams();

          self._refreshBuffer(sound); // Setup the playback params.


          var vol = sound._muted || self._muted ? 0 : sound._volume;
          node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
          sound._playStart = Howler.ctx.currentTime; // Play the sound using the supported method.

          if (typeof node.bufferSource.start === 'undefined') {
            sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
          } else {
            sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
          } // Start a new timer if none is present.


          if (timeout !== Infinity) {
            self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
          }

          if (!internal) {
            setTimeout(function () {
              self._emit('play', sound._id);

              self._loadQueue();
            }, 0);
          }
        };

        if (Howler.state === 'running') {
          playWebAudio();
        } else {
          self._playLock = true; // Wait for the audio context to resume before playing.

          self.once('resume', playWebAudio); // Cancel the end timer.

          self._clearTimer(sound._id);
        }
      } else {
        // Fire this when the sound is ready to play to begin HTML5 Audio playback.
        var playHtml5 = function playHtml5() {
          node.currentTime = seek;
          node.muted = sound._muted || self._muted || Howler._muted || node.muted;
          node.volume = sound._volume * Howler.volume();
          node.playbackRate = sound._rate; // Some browsers will throw an error if this is called without user interaction.

          try {
            var play = node.play(); // Support older browsers that don't support promises, and thus don't have this issue.

            if (play && typeof Promise !== 'undefined' && (play instanceof Promise || typeof play.then === 'function')) {
              // Implements a lock to prevent DOMException: The play() request was interrupted by a call to pause().
              self._playLock = true; // Set param values immediately.

              setParams(); // Releases the lock and executes queued actions.

              play.then(function () {
                self._playLock = false;
                node._unlocked = true;

                if (!internal) {
                  self._emit('play', sound._id);

                  self._loadQueue();
                }
              }).catch(function () {
                self._playLock = false;

                self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' + 'on mobile devices and Chrome where playback was not within a user interaction.'); // Reset the ended and paused values.


                sound._ended = true;
                sound._paused = true;
              });
            } else if (!internal) {
              self._playLock = false;
              setParams();

              self._emit('play', sound._id);

              self._loadQueue();
            } // Setting rate before playing won't work in IE, so we set it again here.


            node.playbackRate = sound._rate; // If the node is still paused, then we can assume there was a playback issue.

            if (node.paused) {
              self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' + 'on mobile devices and Chrome where playback was not within a user interaction.');

              return;
            } // Setup the end timer on sprites or listen for the ended event.


            if (sprite !== '__default' || sound._loop) {
              self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
            } else {
              self._endTimers[sound._id] = function () {
                // Fire ended on this audio node.
                self._ended(sound); // Clear this listener.


                node.removeEventListener('ended', self._endTimers[sound._id], false);
              };

              node.addEventListener('ended', self._endTimers[sound._id], false);
            }
          } catch (err) {
            self._emit('playerror', sound._id, err);
          }
        }; // If this is streaming audio, make sure the src is set and load again.


        if (node.src === 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA') {
          node.src = self._src;
          node.load();
        } // Play immediately if ready, or wait for the 'canplaythrough'e vent.


        var loadedNoReadyState = window && window.ejecta || !node.readyState && Howler._navigator.isCocoonJS;

        if (node.readyState >= 3 || loadedNoReadyState) {
          playHtml5();
        } else {
          self._playLock = true;

          var listener = function listener() {
            // Begin playback.
            playHtml5(); // Clear this listener.

            node.removeEventListener(Howler._canPlayEvent, listener, false);
          };

          node.addEventListener(Howler._canPlayEvent, listener, false); // Cancel the end timer.

          self._clearTimer(sound._id);
        }
      }

      return sound._id;
    },

    /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */
    pause: function pause(id) {
      var self = this; // If the sound hasn't loaded or a play() promise is pending, add it to the load queue to pause when capable.

      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'pause',
          action: function action() {
            self.pause(id);
          }
        });

        return self;
      } // If no id is passed, get all ID's to be paused.


      var ids = self._getSoundIds(id);

      for (var i = 0; i < ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]); // Get the sound.


        var sound = self._soundById(ids[i]);

        if (sound && !sound._paused) {
          // Reset the seek position.
          sound._seek = self.seek(ids[i]);
          sound._rateSeek = 0;
          sound._paused = true; // Stop currently running fades.

          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound has been created.
              if (!sound._node.bufferSource) {
                continue;
              }

              if (typeof sound._node.bufferSource.stop === 'undefined') {
                sound._node.bufferSource.noteOff(0);
              } else {
                sound._node.bufferSource.stop(0);
              } // Clean up the buffer source.


              self._cleanBuffer(sound._node);
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.pause();
            }
          }
        } // Fire the pause event, unless `true` is passed as the 2nd argument.


        if (!arguments[1]) {
          self._emit('pause', sound ? sound._id : null);
        }
      }

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Howl}
     */
    stop: function stop(id, internal) {
      var self = this; // If the sound hasn't loaded, add it to the load queue to stop when capable.

      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'stop',
          action: function action() {
            self.stop(id);
          }
        });

        return self;
      } // If no id is passed, get all ID's to be stopped.


      var ids = self._getSoundIds(id);

      for (var i = 0; i < ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]); // Get the sound.


        var sound = self._soundById(ids[i]);

        if (sound) {
          // Reset the seek position.
          sound._seek = sound._start || 0;
          sound._rateSeek = 0;
          sound._paused = true;
          sound._ended = true; // Stop currently running fades.

          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound's AudioBufferSourceNode has been created.
              if (sound._node.bufferSource) {
                if (typeof sound._node.bufferSource.stop === 'undefined') {
                  sound._node.bufferSource.noteOff(0);
                } else {
                  sound._node.bufferSource.stop(0);
                } // Clean up the buffer source.


                self._cleanBuffer(sound._node);
              }
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.currentTime = sound._start || 0;

              sound._node.pause(); // If this is a live stream, stop download once the audio is stopped.


              if (sound._node.duration === Infinity) {
                self._clearSound(sound._node);
              }
            }
          }

          if (!internal) {
            self._emit('stop', sound._id);
          }
        }
      }

      return self;
    },

    /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */
    mute: function mute(muted, id) {
      var self = this; // If the sound hasn't loaded, add it to the load queue to mute when capable.

      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'mute',
          action: function action() {
            self.mute(muted, id);
          }
        });

        return self;
      } // If applying mute/unmute to all sounds, update the group's value.


      if (typeof id === 'undefined') {
        if (typeof muted === 'boolean') {
          self._muted = muted;
        } else {
          return self._muted;
        }
      } // If no id is passed, get all ID's to be muted.


      var ids = self._getSoundIds(id);

      for (var i = 0; i < ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          sound._muted = muted; // Cancel active fade and set the volume to the end value.

          if (sound._interval) {
            self._stopFade(sound._id);
          }

          if (self._webAudio && sound._node) {
            sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
          } else if (sound._node) {
            sound._node.muted = Howler._muted ? true : muted;
          }

          self._emit('mute', sound._id);
        }
      }

      return self;
    },

    /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */
    volume: function volume() {
      var self = this;
      var args = arguments;
      var vol, id; // Determine the values based on arguments.

      if (args.length === 0) {
        // Return the value of the groups' volume.
        return self._volume;
      } else if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
        // First check if this is an ID, and if not, assume it is a new volume.
        var ids = self._getSoundIds();

        var index = ids.indexOf(args[0]);

        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          vol = parseFloat(args[0]);
        }
      } else if (args.length >= 2) {
        vol = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      } // Update the volume or return the current volume.


      var sound;

      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        // If the sound hasn't loaded, add it to the load queue to change volume when capable.
        if (self._state !== 'loaded' || self._playLock) {
          self._queue.push({
            event: 'volume',
            action: function action() {
              self.volume.apply(self, args);
            }
          });

          return self;
        } // Set the group volume.


        if (typeof id === 'undefined') {
          self._volume = vol;
        } // Update one or all volumes.


        id = self._getSoundIds(id);

        for (var i = 0; i < id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            sound._volume = vol; // Stop currently running fades.

            if (!args[2]) {
              self._stopFade(id[i]);
            }

            if (self._webAudio && sound._node && !sound._muted) {
              sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
            } else if (sound._node && !sound._muted) {
              sound._node.volume = vol * Howler.volume();
            }

            self._emit('volume', sound._id);
          }
        }
      } else {
        sound = id ? self._soundById(id) : self._sounds[0];
        return sound ? sound._volume : 0;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes (if no id is passsed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */
    fade: function fade(from, to, len, id) {
      var self = this; // If the sound hasn't loaded, add it to the load queue to fade when capable.

      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'fade',
          action: function action() {
            self.fade(from, to, len, id);
          }
        });

        return self;
      } // Make sure the to/from/len values are numbers.


      from = parseFloat(from);
      to = parseFloat(to);
      len = parseFloat(len); // Set the volume to the start position.

      self.volume(from, id); // Fade the volume of one or all sounds.

      var ids = self._getSoundIds(id);

      for (var i = 0; i < ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]); // Create a linear fade or fall back to timeouts with HTML5 Audio.


        if (sound) {
          // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
          if (!id) {
            self._stopFade(ids[i]);
          } // If we are using Web Audio, let the native methods do the actual fade.


          if (self._webAudio && !sound._muted) {
            var currentTime = Howler.ctx.currentTime;
            var end = currentTime + len / 1000;
            sound._volume = from;

            sound._node.gain.setValueAtTime(from, currentTime);

            sound._node.gain.linearRampToValueAtTime(to, end);
          }

          self._startFadeInterval(sound, from, to, len, ids[i], typeof id === 'undefined');
        }
      }

      return self;
    },

    /**
     * Starts the internal interval to fade a sound.
     * @param  {Object} sound Reference to sound to fade.
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id to fade.
     * @param  {Boolean} isGroup   If true, set the volume on the group.
     */
    _startFadeInterval: function _startFadeInterval(sound, from, to, len, id, isGroup) {
      var self = this;
      var vol = from;
      var diff = to - from;
      var steps = Math.abs(diff / 0.01);
      var stepLen = Math.max(4, steps > 0 ? len / steps : len);
      var lastTick = Date.now(); // Store the value being faded to.

      sound._fadeTo = to; // Update the volume value on each interval tick.

      sound._interval = setInterval(function () {
        // Update the volume based on the time since the last tick.
        var tick = (Date.now() - lastTick) / len;
        lastTick = Date.now();
        vol += diff * tick; // Make sure the volume is in the right bounds.

        vol = Math.max(0, vol);
        vol = Math.min(1, vol); // Round to within 2 decimal points.

        vol = Math.round(vol * 100) / 100; // Change the volume.

        if (self._webAudio) {
          sound._volume = vol;
        } else {
          self.volume(vol, sound._id, true);
        } // Set the group's volume.


        if (isGroup) {
          self._volume = vol;
        } // When the fade is complete, stop it and fire event.


        if (to < from && vol <= to || to > from && vol >= to) {
          clearInterval(sound._interval);
          sound._interval = null;
          sound._fadeTo = null;
          self.volume(to, sound._id);

          self._emit('fade', sound._id);
        }
      }, stepLen);
    },

    /**
     * Internal method that stops the currently playing fade when
     * a new fade starts, volume is changed or the sound is stopped.
     * @param  {Number} id The sound id.
     * @return {Howl}
     */
    _stopFade: function _stopFade(id) {
      var self = this;

      var sound = self._soundById(id);

      if (sound && sound._interval) {
        if (self._webAudio) {
          sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
        }

        clearInterval(sound._interval);
        sound._interval = null;
        self.volume(sound._fadeTo, id);
        sound._fadeTo = null;

        self._emit('fade', id);
      }

      return self;
    },

    /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */
    loop: function loop() {
      var self = this;
      var args = arguments;
      var loop, id, sound; // Determine the values for loop and id.

      if (args.length === 0) {
        // Return the grou's loop value.
        return self._loop;
      } else if (args.length === 1) {
        if (typeof args[0] === 'boolean') {
          loop = args[0];
          self._loop = loop;
        } else {
          // Return this sound's loop value.
          sound = self._soundById(parseInt(args[0], 10));
          return sound ? sound._loop : false;
        }
      } else if (args.length === 2) {
        loop = args[0];
        id = parseInt(args[1], 10);
      } // If no id is passed, get all ID's to be looped.


      var ids = self._getSoundIds(id);

      for (var i = 0; i < ids.length; i++) {
        sound = self._soundById(ids[i]);

        if (sound) {
          sound._loop = loop;

          if (self._webAudio && sound._node && sound._node.bufferSource) {
            sound._node.bufferSource.loop = loop;

            if (loop) {
              sound._node.bufferSource.loopStart = sound._start || 0;
              sound._node.bufferSource.loopEnd = sound._stop;
            }
          }
        }
      }

      return self;
    },

    /**
     * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   rate() -> Returns the first sound node's current playback rate.
     *   rate(id) -> Returns the sound id's current playback rate.
     *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
     *   rate(rate, id) -> Sets the playback rate of passed sound id.
     * @return {Howl/Number} Returns self or the current playback rate.
     */
    rate: function rate() {
      var self = this;
      var args = arguments;
      var rate, id; // Determine the values based on arguments.

      if (args.length === 0) {
        // We will simply return the current rate of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new rate value.
        var ids = self._getSoundIds();

        var index = ids.indexOf(args[0]);

        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          rate = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        rate = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      } // Update the playback rate or return the current value.


      var sound;

      if (typeof rate === 'number') {
        // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
        if (self._state !== 'loaded' || self._playLock) {
          self._queue.push({
            event: 'rate',
            action: function action() {
              self.rate.apply(self, args);
            }
          });

          return self;
        } // Set the group rate.


        if (typeof id === 'undefined') {
          self._rate = rate;
        } // Update one or all volumes.


        id = self._getSoundIds(id);

        for (var i = 0; i < id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            // Keep track of our position when the rate changed and update the playback
            // start position so we can properly adjust the seek position for time elapsed.
            if (self.playing(id[i])) {
              sound._rateSeek = self.seek(id[i]);
              sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
            }

            sound._rate = rate; // Change the playback rate.

            if (self._webAudio && sound._node && sound._node.bufferSource) {
              sound._node.bufferSource.playbackRate.setValueAtTime(rate, Howler.ctx.currentTime);
            } else if (sound._node) {
              sound._node.playbackRate = rate;
            } // Reset the timers.


            var seek = self.seek(id[i]);
            var duration = (self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000 - seek;
            var timeout = duration * 1000 / Math.abs(sound._rate); // Start a new end timer if sound is already playing.

            if (self._endTimers[id[i]] || !sound._paused) {
              self._clearTimer(id[i]);

              self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
            }

            self._emit('rate', sound._id);
          }
        }
      } else {
        sound = self._soundById(id);
        return sound ? sound._rate : self._rate;
      }

      return self;
    },

    /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */
    seek: function seek() {
      var self = this;
      var args = arguments;
      var seek, id; // Determine the values based on arguments.

      if (args.length === 0) {
        // We will simply return the current position of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new seek position.
        var ids = self._getSoundIds();

        var index = ids.indexOf(args[0]);

        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else if (self._sounds.length) {
          id = self._sounds[0]._id;
          seek = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        seek = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      } // If there is no ID, bail out.


      if (typeof id === 'undefined') {
        return self;
      } // If the sound hasn't loaded, add it to the load queue to seek when capable.


      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'seek',
          action: function action() {
            self.seek.apply(self, args);
          }
        });

        return self;
      } // Get the sound.


      var sound = self._soundById(id);

      if (sound) {
        if (typeof seek === 'number' && seek >= 0) {
          // Pause the sound and update position for restarting playback.
          var playing = self.playing(id);

          if (playing) {
            self.pause(id, true);
          } // Move the position of the track and cancel timer.


          sound._seek = seek;
          sound._ended = false;

          self._clearTimer(id); // Update the seek position for HTML5 Audio.


          if (!self._webAudio && sound._node && !isNaN(sound._node.duration)) {
            sound._node.currentTime = seek;
          } // Seek and emit when ready.


          var seekAndEmit = function seekAndEmit() {
            self._emit('seek', id); // Restart the playback if the sound was playing.


            if (playing) {
              self.play(id, true);
            }
          }; // Wait for the play lock to be unset before emitting (HTML5 Audio).


          if (playing && !self._webAudio) {
            var emitSeek = function emitSeek() {
              if (!self._playLock) {
                seekAndEmit();
              } else {
                setTimeout(emitSeek, 0);
              }
            };

            setTimeout(emitSeek, 0);
          } else {
            seekAndEmit();
          }
        } else {
          if (self._webAudio) {
            var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
            var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
            return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
          } else {
            return sound._node.currentTime;
          }
        }
      }

      return self;
    },

    /**
     * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
     * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
     * @return {Boolean} True if playing and false if not.
     */
    playing: function playing(id) {
      var self = this; // Check the passed sound ID (if any).

      if (typeof id === 'number') {
        var sound = self._soundById(id);

        return sound ? !sound._paused : false;
      } // Otherwise, loop through all sounds and check if any are playing.


      for (var i = 0; i < self._sounds.length; i++) {
        if (!self._sounds[i]._paused) {
          return true;
        }
      }

      return false;
    },

    /**
     * Get the duration of this sound. Passing a sound id will return the sprite duration.
     * @param  {Number} id The sound id to check. If none is passed, return full source duration.
     * @return {Number} Audio duration in seconds.
     */
    duration: function duration(id) {
      var self = this;
      var duration = self._duration; // If we pass an ID, get the sound and return the sprite length.

      var sound = self._soundById(id);

      if (sound) {
        duration = self._sprite[sound._sprite][1] / 1000;
      }

      return duration;
    },

    /**
     * Returns the current loaded state of this Howl.
     * @return {String} 'unloaded', 'loading', 'loaded'
     */
    state: function state() {
      return this._state;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */
    unload: function unload() {
      var self = this; // Stop playing any active sounds.

      var sounds = self._sounds;

      for (var i = 0; i < sounds.length; i++) {
        // Stop the sound if it is currently playing.
        if (!sounds[i]._paused) {
          self.stop(sounds[i]._id);
        } // Remove the source or disconnect.


        if (!self._webAudio) {
          // Set the source to 0-second silence to stop any downloading (except in IE).
          self._clearSound(sounds[i]._node); // Remove any event listeners.


          sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);

          sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false); // Release the Audio object back to the pool.


          Howler._releaseHtml5Audio(sounds[i]._node);
        } // Empty out all of the nodes.


        delete sounds[i]._node; // Make sure all timers are cleared out.

        self._clearTimer(sounds[i]._id);
      } // Remove the references in the global Howler object.


      var index = Howler._howls.indexOf(self);

      if (index >= 0) {
        Howler._howls.splice(index, 1);
      } // Delete this sound from the cache (if no other Howl is using it).


      var remCache = true;

      for (i = 0; i < Howler._howls.length; i++) {
        if (Howler._howls[i]._src === self._src || self._src.indexOf(Howler._howls[i]._src) >= 0) {
          remCache = false;
          break;
        }
      }

      if (cache && remCache) {
        delete cache[self._src];
      } // Clear global errors.


      Howler.noAudio = false; // Clear out `self`.

      self._state = 'unloaded';
      self._sounds = [];
      self = null;
      return null;
    },

    /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
     * @return {Howl}
     */
    on: function on(event, fn, id, once) {
      var self = this;
      var events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(once ? {
          id: id,
          fn: fn,
          once: once
        } : {
          id: id,
          fn: fn
        });
      }

      return self;
    },

    /**
     * Remove a custom event. Call without parameters to remove all events.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */
    off: function off(event, fn, id) {
      var self = this;
      var events = self['_on' + event];
      var i = 0; // Allow passing just an event and ID.

      if (typeof fn === 'number') {
        id = fn;
        fn = null;
      }

      if (fn || id) {
        // Loop through event store and remove the passed function.
        for (i = 0; i < events.length; i++) {
          var isId = id === events[i].id;

          if (fn === events[i].fn && isId || !fn && isId) {
            events.splice(i, 1);
            break;
          }
        }
      } else if (event) {
        // Clear out all events of this type.
        self['_on' + event] = [];
      } else {
        // Clear out all events of every type.
        var keys = Object.keys(self);

        for (i = 0; i < keys.length; i++) {
          if (keys[i].indexOf('_on') === 0 && Array.isArray(self[keys[i]])) {
            self[keys[i]] = [];
          }
        }
      }

      return self;
    },

    /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    once: function once(event, fn, id) {
      var self = this; // Setup the event listener.

      self.on(event, fn, id, 1);
      return self;
    },

    /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */
    _emit: function _emit(event, id, msg) {
      var self = this;
      var events = self['_on' + event]; // Loop through event store and fire all functions.

      for (var i = events.length - 1; i >= 0; i--) {
        // Only fire the listener if the correct ID is used.
        if (!events[i].id || events[i].id === id || event === 'load') {
          setTimeout(function (fn) {
            fn.call(this, id, msg);
          }.bind(self, events[i].fn), 0); // If this event was setup with `once`, remove it.

          if (events[i].once) {
            self.off(event, events[i].fn, events[i].id);
          }
        }
      } // Pass the event type into load queue so that it can continue stepping.


      self._loadQueue(event);

      return self;
    },

    /**
     * Queue of actions initiated before the sound has loaded.
     * These will be called in sequence, with the next only firing
     * after the previous has finished executing (even if async like play).
     * @return {Howl}
     */
    _loadQueue: function _loadQueue(event) {
      var self = this;

      if (self._queue.length > 0) {
        var task = self._queue[0]; // Remove this task if a matching event was passed.

        if (task.event === event) {
          self._queue.shift();

          self._loadQueue();
        } // Run the task if no event type is passed.


        if (!event) {
          task.action();
        }
      }

      return self;
    },

    /**
     * Fired when playback ends at the end of the duration.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _ended: function _ended(sound) {
      var self = this;
      var sprite = sound._sprite; // If we are using IE and there was network latency we may be clipping
      // audio before it completes playing. Lets check the node to make sure it
      // believes it has completed, before ending the playback.

      if (!self._webAudio && sound._node && !sound._node.paused && !sound._node.ended && sound._node.currentTime < sound._stop) {
        setTimeout(self._ended.bind(self, sound), 100);
        return self;
      } // Should this sound loop?


      var loop = !!(sound._loop || self._sprite[sprite][2]); // Fire the ended event.

      self._emit('end', sound._id); // Restart the playback for HTML5 Audio loop.


      if (!self._webAudio && loop) {
        self.stop(sound._id, true).play(sound._id);
      } // Restart this timer if on a Web Audio loop.


      if (self._webAudio && loop) {
        self._emit('play', sound._id);

        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        sound._playStart = Howler.ctx.currentTime;
        var timeout = (sound._stop - sound._start) * 1000 / Math.abs(sound._rate);
        self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
      } // Mark the node as paused.


      if (self._webAudio && !loop) {
        sound._paused = true;
        sound._ended = true;
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;

        self._clearTimer(sound._id); // Clean up the buffer source.


        self._cleanBuffer(sound._node); // Attempt to auto-suspend AudioContext if no sounds are still playing.


        Howler._autoSuspend();
      } // When using a sprite, end the track.


      if (!self._webAudio && !loop) {
        self.stop(sound._id, true);
      }

      return self;
    },

    /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */
    _clearTimer: function _clearTimer(id) {
      var self = this;

      if (self._endTimers[id]) {
        // Clear the timeout or remove the ended listener.
        if (typeof self._endTimers[id] !== 'function') {
          clearTimeout(self._endTimers[id]);
        } else {
          var sound = self._soundById(id);

          if (sound && sound._node) {
            sound._node.removeEventListener('ended', self._endTimers[id], false);
          }
        }

        delete self._endTimers[id];
      }

      return self;
    },

    /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */
    _soundById: function _soundById(id) {
      var self = this; // Loop through all sounds and find the one with this ID.

      for (var i = 0; i < self._sounds.length; i++) {
        if (id === self._sounds[i]._id) {
          return self._sounds[i];
        }
      }

      return null;
    },

    /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */
    _inactiveSound: function _inactiveSound() {
      var self = this;

      self._drain(); // Find the first inactive node to recycle.


      for (var i = 0; i < self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          return self._sounds[i].reset();
        }
      } // If no inactive node was found, create a new one.


      return new Sound(self);
    },

    /**
     * Drain excess inactive sounds from the pool.
     */
    _drain: function _drain() {
      var self = this;
      var limit = self._pool;
      var cnt = 0;
      var i = 0; // If there are less sounds than the max pool size, we are done.

      if (self._sounds.length < limit) {
        return;
      } // Count the number of inactive sounds.


      for (i = 0; i < self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          cnt++;
        }
      } // Remove excess inactive sounds, going in reverse order.


      for (i = self._sounds.length - 1; i >= 0; i--) {
        if (cnt <= limit) {
          return;
        }

        if (self._sounds[i]._ended) {
          // Disconnect the audio source when using Web Audio.
          if (self._webAudio && self._sounds[i]._node) {
            self._sounds[i]._node.disconnect(0);
          } // Remove sounds until we have the pool size.


          self._sounds.splice(i, 1);

          cnt--;
        }
      }
    },

    /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */
    _getSoundIds: function _getSoundIds(id) {
      var self = this;

      if (typeof id === 'undefined') {
        var ids = [];

        for (var i = 0; i < self._sounds.length; i++) {
          ids.push(self._sounds[i]._id);
        }

        return ids;
      } else {
        return [id];
      }
    },

    /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _refreshBuffer: function _refreshBuffer(sound) {
      var self = this; // Setup the buffer source for playback.

      sound._node.bufferSource = Howler.ctx.createBufferSource();
      sound._node.bufferSource.buffer = cache[self._src]; // Connect to the correct node.

      if (sound._panner) {
        sound._node.bufferSource.connect(sound._panner);
      } else {
        sound._node.bufferSource.connect(sound._node);
      } // Setup looping and playback rate.


      sound._node.bufferSource.loop = sound._loop;

      if (sound._loop) {
        sound._node.bufferSource.loopStart = sound._start || 0;
        sound._node.bufferSource.loopEnd = sound._stop || 0;
      }

      sound._node.bufferSource.playbackRate.setValueAtTime(sound._rate, Howler.ctx.currentTime);

      return self;
    },

    /**
     * Prevent memory leaks by cleaning up the buffer source after playback.
     * @param  {Object} node Sound's audio node containing the buffer source.
     * @return {Howl}
     */
    _cleanBuffer: function _cleanBuffer(node) {
      var self = this;
      var isIOS = Howler._navigator && Howler._navigator.vendor.indexOf('Apple') >= 0;

      if (Howler._scratchBuffer && node.bufferSource) {
        node.bufferSource.onended = null;
        node.bufferSource.disconnect(0);

        if (isIOS) {
          try {
            node.bufferSource.buffer = Howler._scratchBuffer;
          } catch (e) {}
        }
      }

      node.bufferSource = null;
      return self;
    },

    /**
     * Set the source to a 0-second silence to stop any downloading (except in IE).
     * @param  {Object} node Audio node to clear.
     */
    _clearSound: function _clearSound(node) {
      var checkIE = /MSIE |Trident\//.test(Howler._navigator && Howler._navigator.userAgent);

      if (!checkIE) {
        node.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      }
    }
  };
  /** Single Sound Methods **/

  /***************************************************************************/

  /**
   * Setup the sound object, which each node attached to a Howl group is contained in.
   * @param {Object} howl The Howl parent group.
   */

  var Sound = function Sound(howl) {
    this._parent = howl;
    this.init();
  };

  Sound.prototype = {
    /**
     * Initialize a new Sound object.
     * @return {Sound}
     */
    init: function init() {
      var self = this;
      var parent = self._parent; // Setup the default parameters.

      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default'; // Generate a unique ID for this sound.

      self._id = ++Howler._counter; // Add itself to the parent's pool.

      parent._sounds.push(self); // Create the new node.


      self.create();
      return self;
    },

    /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */
    create: function create() {
      var self = this;
      var parent = self._parent;
      var volume = Howler._muted || self._muted || self._parent._muted ? 0 : self._volume;

      if (parent._webAudio) {
        // Create the gain node for controlling volume (the source will connect to this).
        self._node = typeof Howler.ctx.createGain === 'undefined' ? Howler.ctx.createGainNode() : Howler.ctx.createGain();

        self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);

        self._node.paused = true;

        self._node.connect(Howler.masterGain);
      } else {
        // Get an unlocked Audio object from the pool.
        self._node = Howler._obtainHtml5Audio(); // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).

        self._errorFn = self._errorListener.bind(self);

        self._node.addEventListener('error', self._errorFn, false); // Listen for 'canplaythrough' event to let us know the sound is ready.


        self._loadFn = self._loadListener.bind(self);

        self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false); // Setup the new audio node.


        self._node.src = parent._src;
        self._node.preload = 'auto';
        self._node.volume = volume * Howler.volume(); // Begin loading the source.

        self._node.load();
      }

      return self;
    },

    /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */
    reset: function reset() {
      var self = this;
      var parent = self._parent; // Reset all of the parameters of this sound.

      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._rateSeek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default'; // Generate a new ID so that it isn't confused with the previous sound.

      self._id = ++Howler._counter;
      return self;
    },

    /**
     * HTML5 Audio error listener callback.
     */
    _errorListener: function _errorListener() {
      var self = this; // Fire an error event and pass back the code.

      self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0); // Clear the event listener.


      self._node.removeEventListener('error', self._errorFn, false);
    },

    /**
     * HTML5 Audio canplaythrough listener callback.
     */
    _loadListener: function _loadListener() {
      var self = this;
      var parent = self._parent; // Round up the duration to account for the lower precision in HTML5 Audio.

      parent._duration = Math.ceil(self._node.duration * 10) / 10; // Setup a sprite if none is defined.

      if (Object.keys(parent._sprite).length === 0) {
        parent._sprite = {
          __default: [0, parent._duration * 1000]
        };
      }

      if (parent._state !== 'loaded') {
        parent._state = 'loaded';

        parent._emit('load');

        parent._loadQueue();
      } // Clear the event listener.


      self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
    }
  };
  /** Helper Methods **/

  /***************************************************************************/

  var cache = {};
  /**
   * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
   * @param  {Howl} self
   */

  var loadBuffer = function loadBuffer(self) {
    var url = self._src; // Check if the buffer has already been cached and use it instead.

    if (cache[url]) {
      // Set the duration from the cache.
      self._duration = cache[url].duration; // Load the sound into this Howl.

      loadSound(self);
      return;
    }

    if (/^data:[^;]+;base64,/.test(url)) {
      // Decode the base64 data URI without XHR, since some browsers don't support it.
      var data = atob(url.split(',')[1]);
      var dataView = new Uint8Array(data.length);

      for (var i = 0; i < data.length; ++i) {
        dataView[i] = data.charCodeAt(i);
      }

      decodeAudioData(dataView.buffer, self);
    } else {
      // Load the buffer from the URL.
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.withCredentials = self._xhrWithCredentials;
      xhr.responseType = 'arraybuffer';

      xhr.onload = function () {
        // Make sure we get a successful response back.
        var code = (xhr.status + '')[0];

        if (code !== '0' && code !== '2' && code !== '3') {
          self._emit('loaderror', null, 'Failed loading audio file with status: ' + xhr.status + '.');

          return;
        }

        decodeAudioData(xhr.response, self);
      };

      xhr.onerror = function () {
        // If there is an error, switch to HTML5 Audio.
        if (self._webAudio) {
          self._html5 = true;
          self._webAudio = false;
          self._sounds = [];
          delete cache[url];
          self.load();
        }
      };

      safeXhrSend(xhr);
    }
  };
  /**
   * Send the XHR request wrapped in a try/catch.
   * @param  {Object} xhr XHR to send.
   */


  var safeXhrSend = function safeXhrSend(xhr) {
    try {
      xhr.send();
    } catch (e) {
      xhr.onerror();
    }
  };
  /**
   * Decode audio data from an array buffer.
   * @param  {ArrayBuffer} arraybuffer The audio data.
   * @param  {Howl}        self
   */


  var decodeAudioData = function decodeAudioData(arraybuffer, self) {
    // Fire a load error if something broke.
    var error = function error() {
      self._emit('loaderror', null, 'Decoding audio data failed.');
    }; // Load the sound on success.


    var success = function success(buffer) {
      if (buffer && self._sounds.length > 0) {
        cache[self._src] = buffer;
        loadSound(self, buffer);
      } else {
        error();
      }
    }; // Decode the buffer into an audio source.


    if (typeof Promise !== 'undefined' && Howler.ctx.decodeAudioData.length === 1) {
      Howler.ctx.decodeAudioData(arraybuffer).then(success).catch(error);
    } else {
      Howler.ctx.decodeAudioData(arraybuffer, success, error);
    }
  };
  /**
   * Sound is now loaded, so finish setting everything up and fire the loaded event.
   * @param  {Howl} self
   * @param  {Object} buffer The decoded buffer sound source.
   */


  var loadSound = function loadSound(self, buffer) {
    // Set the duration.
    if (buffer && !self._duration) {
      self._duration = buffer.duration;
    } // Setup a sprite if none is defined.


    if (Object.keys(self._sprite).length === 0) {
      self._sprite = {
        __default: [0, self._duration * 1000]
      };
    } // Fire the loaded event.


    if (self._state !== 'loaded') {
      self._state = 'loaded';

      self._emit('load');

      self._loadQueue();
    }
  };
  /**
   * Setup the audio context when available, or switch to HTML5 Audio mode.
   */


  var setupAudioContext = function setupAudioContext() {
    // If we have already detected that Web Audio isn't supported, don't run this step again.
    if (!Howler.usingWebAudio) {
      return;
    } // Check if we are using Web Audio and setup the AudioContext if we are.


    try {
      if (typeof AudioContext !== 'undefined') {
        Howler.ctx = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        Howler.ctx = new webkitAudioContext();
      } else {
        Howler.usingWebAudio = false;
      }
    } catch (e) {
      Howler.usingWebAudio = false;
    } // If the audio context creation still failed, set using web audio to false.


    if (!Howler.ctx) {
      Howler.usingWebAudio = false;
    } // Check if a webview is being used on iOS8 or earlier (rather than the browser).
    // If it is, disable Web Audio as it causes crashing.


    var iOS = /iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform);

    var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);

    var version = appVersion ? parseInt(appVersion[1], 10) : null;

    if (iOS && version && version < 9) {
      var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());

      if (Howler._navigator && Howler._navigator.standalone && !safari || Howler._navigator && !Howler._navigator.standalone && !safari) {
        Howler.usingWebAudio = false;
      }
    } // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).


    if (Howler.usingWebAudio) {
      Howler.masterGain = typeof Howler.ctx.createGain === 'undefined' ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
      Howler.masterGain.gain.setValueAtTime(Howler._muted ? 0 : 1, Howler.ctx.currentTime);
      Howler.masterGain.connect(Howler.ctx.destination);
    } // Re-run the setup on Howler.


    Howler._setup();
  }; // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.


  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  } // Add support for CommonJS libraries such as browserify.


  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  } // Define globally in case AMD is not available or unused.


  if (typeof window !== 'undefined') {
    window.HowlerGlobal = HowlerGlobal;
    window.Howler = Howler;
    window.Howl = Howl;
    window.Sound = Sound;
  } else if (typeof global !== 'undefined') {
    // Add to global in Node.js (for testing, etc).
    global.HowlerGlobal = HowlerGlobal;
    global.Howler = Howler;
    global.Howl = Howl;
    global.Sound = Sound;
  }
})();
/*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *  
 *  howler.js v2.1.2
 *  howlerjs.com
 *
 *  (c) 2013-2019, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */


(function () {
  'use strict'; // Setup default properties.

  HowlerGlobal.prototype._pos = [0, 0, 0];
  HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0];
  /** Global Methods **/

  /***************************************************************************/

  /**
   * Helper method to update the stereo panning position of all current Howls.
   * Future Howls will not use this value unless explicitly set.
   * @param  {Number} pan A value of -1.0 is all the way left and 1.0 is all the way right.
   * @return {Howler/Number}     Self or current stereo panning value.
   */

  HowlerGlobal.prototype.stereo = function (pan) {
    var self = this; // Stop right here if not using Web Audio.

    if (!self.ctx || !self.ctx.listener) {
      return self;
    } // Loop through all Howls and update their stereo panning.


    for (var i = self._howls.length - 1; i >= 0; i--) {
      self._howls[i].stereo(pan);
    }

    return self;
  };
  /**
   * Get/set the position of the listener in 3D cartesian space. Sounds using
   * 3D position will be relative to the listener's position.
   * @param  {Number} x The x-position of the listener.
   * @param  {Number} y The y-position of the listener.
   * @param  {Number} z The z-position of the listener.
   * @return {Howler/Array}   Self or current listener position.
   */


  HowlerGlobal.prototype.pos = function (x, y, z) {
    var self = this; // Stop right here if not using Web Audio.

    if (!self.ctx || !self.ctx.listener) {
      return self;
    } // Set the defaults for optional 'y' & 'z'.


    y = typeof y !== 'number' ? self._pos[1] : y;
    z = typeof z !== 'number' ? self._pos[2] : z;

    if (typeof x === 'number') {
      self._pos = [x, y, z];

      if (typeof self.ctx.listener.positionX !== 'undefined') {
        self.ctx.listener.positionX.setTargetAtTime(self._pos[0], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionY.setTargetAtTime(self._pos[1], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionZ.setTargetAtTime(self._pos[2], Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setPosition(self._pos[0], self._pos[1], self._pos[2]);
      }
    } else {
      return self._pos;
    }

    return self;
  };
  /**
   * Get/set the direction the listener is pointing in the 3D cartesian space.
   * A front and up vector must be provided. The front is the direction the
   * face of the listener is pointing, and up is the direction the top of the
   * listener is pointing. Thus, these values are expected to be at right angles
   * from each other.
   * @param  {Number} x   The x-orientation of the listener.
   * @param  {Number} y   The y-orientation of the listener.
   * @param  {Number} z   The z-orientation of the listener.
   * @param  {Number} xUp The x-orientation of the top of the listener.
   * @param  {Number} yUp The y-orientation of the top of the listener.
   * @param  {Number} zUp The z-orientation of the top of the listener.
   * @return {Howler/Array}     Returns self or the current orientation vectors.
   */


  HowlerGlobal.prototype.orientation = function (x, y, z, xUp, yUp, zUp) {
    var self = this; // Stop right here if not using Web Audio.

    if (!self.ctx || !self.ctx.listener) {
      return self;
    } // Set the defaults for optional 'y' & 'z'.


    var or = self._orientation;
    y = typeof y !== 'number' ? or[1] : y;
    z = typeof z !== 'number' ? or[2] : z;
    xUp = typeof xUp !== 'number' ? or[3] : xUp;
    yUp = typeof yUp !== 'number' ? or[4] : yUp;
    zUp = typeof zUp !== 'number' ? or[5] : zUp;

    if (typeof x === 'number') {
      self._orientation = [x, y, z, xUp, yUp, zUp];

      if (typeof self.ctx.listener.forwardX !== 'undefined') {
        self.ctx.listener.forwardX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setOrientation(x, y, z, xUp, yUp, zUp);
      }
    } else {
      return or;
    }

    return self;
  };
  /** Group Methods **/

  /***************************************************************************/

  /**
   * Add new properties to the core init.
   * @param  {Function} _super Core init method.
   * @return {Howl}
   */


  Howl.prototype.init = function (_super) {
    return function (o) {
      var self = this; // Setup user-defined default properties.

      self._orientation = o.orientation || [1, 0, 0];
      self._stereo = o.stereo || null;
      self._pos = o.pos || null;
      self._pannerAttr = {
        coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : 360,
        coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : 360,
        coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : 0,
        distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : 'inverse',
        maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : 10000,
        panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : 'HRTF',
        refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : 1,
        rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : 1
      }; // Setup event listeners.

      self._onstereo = o.onstereo ? [{
        fn: o.onstereo
      }] : [];
      self._onpos = o.onpos ? [{
        fn: o.onpos
      }] : [];
      self._onorientation = o.onorientation ? [{
        fn: o.onorientation
      }] : []; // Complete initilization with howler.js core's init function.

      return _super.call(this, o);
    };
  }(Howl.prototype.init);
  /**
   * Get/set the stereo panning of the audio source for this sound or all in the group.
   * @param  {Number} pan  A value of -1.0 is all the way left and 1.0 is all the way right.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Number}    Returns self or the current stereo panning value.
   */


  Howl.prototype.stereo = function (pan, id) {
    var self = this; // Stop right here if not using Web Audio.

    if (!self._webAudio) {
      return self;
    } // If the sound hasn't loaded, add it to the load queue to change stereo pan when capable.


    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'stereo',
        action: function action() {
          self.stereo(pan, id);
        }
      });

      return self;
    } // Check for PannerStereoNode support and fallback to PannerNode if it doesn't exist.


    var pannerType = typeof Howler.ctx.createStereoPanner === 'undefined' ? 'spatial' : 'stereo'; // Setup the group's stereo panning if no ID is passed.

    if (typeof id === 'undefined') {
      // Return the group's stereo panning if no parameters are passed.
      if (typeof pan === 'number') {
        self._stereo = pan;
        self._pos = [pan, 0, 0];
      } else {
        return self._stereo;
      }
    } // Change the streo panning of one or all sounds in group.


    var ids = self._getSoundIds(id);

    for (var i = 0; i < ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof pan === 'number') {
          sound._stereo = pan;
          sound._pos = [pan, 0, 0];

          if (sound._node) {
            // If we are falling back, make sure the panningModel is equalpower.
            sound._pannerAttr.panningModel = 'equalpower'; // Check if there is a panner setup and create a new one if not.

            if (!sound._panner || !sound._panner.pan) {
              setupPanner(sound, pannerType);
            }

            if (pannerType === 'spatial') {
              if (typeof sound._panner.positionX !== 'undefined') {
                sound._panner.positionX.setValueAtTime(pan, Howler.ctx.currentTime);

                sound._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime);

                sound._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime);
              } else {
                sound._panner.setPosition(pan, 0, 0);
              }
            } else {
              sound._panner.pan.setValueAtTime(pan, Howler.ctx.currentTime);
            }
          }

          self._emit('stereo', sound._id);
        } else {
          return sound._stereo;
        }
      }
    }

    return self;
  };
  /**
   * Get/set the 3D spatial position of the audio source for this sound or group relative to the global listener.
   * @param  {Number} x  The x-position of the audio source.
   * @param  {Number} y  The y-position of the audio source.
   * @param  {Number} z  The z-position of the audio source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial position: [x, y, z].
   */


  Howl.prototype.pos = function (x, y, z, id) {
    var self = this; // Stop right here if not using Web Audio.

    if (!self._webAudio) {
      return self;
    } // If the sound hasn't loaded, add it to the load queue to change position when capable.


    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'pos',
        action: function action() {
          self.pos(x, y, z, id);
        }
      });

      return self;
    } // Set the defaults for optional 'y' & 'z'.


    y = typeof y !== 'number' ? 0 : y;
    z = typeof z !== 'number' ? -0.5 : z; // Setup the group's spatial position if no ID is passed.

    if (typeof id === 'undefined') {
      // Return the group's spatial position if no parameters are passed.
      if (typeof x === 'number') {
        self._pos = [x, y, z];
      } else {
        return self._pos;
      }
    } // Change the spatial position of one or all sounds in group.


    var ids = self._getSoundIds(id);

    for (var i = 0; i < ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._pos = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || sound._panner.pan) {
              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.positionX !== 'undefined') {
              sound._panner.positionX.setValueAtTime(x, Howler.ctx.currentTime);

              sound._panner.positionY.setValueAtTime(y, Howler.ctx.currentTime);

              sound._panner.positionZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setPosition(x, y, z);
            }
          }

          self._emit('pos', sound._id);
        } else {
          return sound._pos;
        }
      }
    }

    return self;
  };
  /**
   * Get/set the direction the audio source is pointing in the 3D cartesian coordinate
   * space. Depending on how direction the sound is, based on the `cone` attributes,
   * a sound pointing away from the listener can be quiet or silent.
   * @param  {Number} x  The x-orientation of the source.
   * @param  {Number} y  The y-orientation of the source.
   * @param  {Number} z  The z-orientation of the source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial orientation: [x, y, z].
   */


  Howl.prototype.orientation = function (x, y, z, id) {
    var self = this; // Stop right here if not using Web Audio.

    if (!self._webAudio) {
      return self;
    } // If the sound hasn't loaded, add it to the load queue to change orientation when capable.


    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'orientation',
        action: function action() {
          self.orientation(x, y, z, id);
        }
      });

      return self;
    } // Set the defaults for optional 'y' & 'z'.


    y = typeof y !== 'number' ? self._orientation[1] : y;
    z = typeof z !== 'number' ? self._orientation[2] : z; // Setup the group's spatial orientation if no ID is passed.

    if (typeof id === 'undefined') {
      // Return the group's spatial orientation if no parameters are passed.
      if (typeof x === 'number') {
        self._orientation = [x, y, z];
      } else {
        return self._orientation;
      }
    } // Change the spatial orientation of one or all sounds in group.


    var ids = self._getSoundIds(id);

    for (var i = 0; i < ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._orientation = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner) {
              // Make sure we have a position to setup the node with.
              if (!sound._pos) {
                sound._pos = self._pos || [0, 0, -0.5];
              }

              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.orientationX !== 'undefined') {
              sound._panner.orientationX.setValueAtTime(x, Howler.ctx.currentTime);

              sound._panner.orientationY.setValueAtTime(y, Howler.ctx.currentTime);

              sound._panner.orientationZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setOrientation(x, y, z);
            }
          }

          self._emit('orientation', sound._id);
        } else {
          return sound._orientation;
        }
      }
    }

    return self;
  };
  /**
   * Get/set the panner node's attributes for a sound or group of sounds.
   * This method can optionall take 0, 1 or 2 arguments.
   *   pannerAttr() -> Returns the group's values.
   *   pannerAttr(id) -> Returns the sound id's values.
   *   pannerAttr(o) -> Set's the values of all sounds in this Howl group.
   *   pannerAttr(o, id) -> Set's the values of passed sound id.
   *
   *   Attributes:
   *     coneInnerAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      inside of which there will be no volume reduction.
   *     coneOuterAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      outside of which the volume will be reduced to a constant value of `coneOuterGain`.
   *     coneOuterGain - (0 by default) A parameter for directional audio sources, this is the gain outside of the
   *                     `coneOuterAngle`. It is a linear value in the range `[0, 1]`.
   *     distanceModel - ('inverse' by default) Determines algorithm used to reduce volume as audio moves away from
   *                     listener. Can be `linear`, `inverse` or `exponential.
   *     maxDistance - (10000 by default) The maximum distance between source and listener, after which the volume
   *                   will not be reduced any further.
   *     refDistance - (1 by default) A reference distance for reducing volume as source moves further from the listener.
   *                   This is simply a variable of the distance model and has a different effect depending on which model
   *                   is used and the scale of your coordinates. Generally, volume will be equal to 1 at this distance.
   *     rolloffFactor - (1 by default) How quickly the volume reduces as source moves from listener. This is simply a
   *                     variable of the distance model and can be in the range of `[0, 1]` with `linear` and `[0, ∞]`
   *                     with `inverse` and `exponential`.
   *     panningModel - ('HRTF' by default) Determines which spatialization algorithm is used to position audio.
   *                     Can be `HRTF` or `equalpower`.
   *
   * @return {Howl/Object} Returns self or current panner attributes.
   */


  Howl.prototype.pannerAttr = function () {
    var self = this;
    var args = arguments;
    var o, id, sound; // Stop right here if not using Web Audio.

    if (!self._webAudio) {
      return self;
    } // Determine the values based on arguments.


    if (args.length === 0) {
      // Return the group's panner attribute values.
      return self._pannerAttr;
    } else if (args.length === 1) {
      if (_typeof(args[0]) === 'object') {
        o = args[0]; // Set the grou's panner attribute values.

        if (typeof id === 'undefined') {
          if (!o.pannerAttr) {
            o.pannerAttr = {
              coneInnerAngle: o.coneInnerAngle,
              coneOuterAngle: o.coneOuterAngle,
              coneOuterGain: o.coneOuterGain,
              distanceModel: o.distanceModel,
              maxDistance: o.maxDistance,
              refDistance: o.refDistance,
              rolloffFactor: o.rolloffFactor,
              panningModel: o.panningModel
            };
          }

          self._pannerAttr = {
            coneInnerAngle: typeof o.pannerAttr.coneInnerAngle !== 'undefined' ? o.pannerAttr.coneInnerAngle : self._coneInnerAngle,
            coneOuterAngle: typeof o.pannerAttr.coneOuterAngle !== 'undefined' ? o.pannerAttr.coneOuterAngle : self._coneOuterAngle,
            coneOuterGain: typeof o.pannerAttr.coneOuterGain !== 'undefined' ? o.pannerAttr.coneOuterGain : self._coneOuterGain,
            distanceModel: typeof o.pannerAttr.distanceModel !== 'undefined' ? o.pannerAttr.distanceModel : self._distanceModel,
            maxDistance: typeof o.pannerAttr.maxDistance !== 'undefined' ? o.pannerAttr.maxDistance : self._maxDistance,
            refDistance: typeof o.pannerAttr.refDistance !== 'undefined' ? o.pannerAttr.refDistance : self._refDistance,
            rolloffFactor: typeof o.pannerAttr.rolloffFactor !== 'undefined' ? o.pannerAttr.rolloffFactor : self._rolloffFactor,
            panningModel: typeof o.pannerAttr.panningModel !== 'undefined' ? o.pannerAttr.panningModel : self._panningModel
          };
        }
      } else {
        // Return this sound's panner attribute values.
        sound = self._soundById(parseInt(args[0], 10));
        return sound ? sound._pannerAttr : self._pannerAttr;
      }
    } else if (args.length === 2) {
      o = args[0];
      id = parseInt(args[1], 10);
    } // Update the values of the specified sounds.


    var ids = self._getSoundIds(id);

    for (var i = 0; i < ids.length; i++) {
      sound = self._soundById(ids[i]);

      if (sound) {
        // Merge the new values into the sound.
        var pa = sound._pannerAttr;
        pa = {
          coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : pa.coneInnerAngle,
          coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : pa.coneOuterAngle,
          coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : pa.coneOuterGain,
          distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : pa.distanceModel,
          maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : pa.maxDistance,
          refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : pa.refDistance,
          rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : pa.rolloffFactor,
          panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : pa.panningModel
        }; // Update the panner values or create a new panner if none exists.

        var panner = sound._panner;

        if (panner) {
          panner.coneInnerAngle = pa.coneInnerAngle;
          panner.coneOuterAngle = pa.coneOuterAngle;
          panner.coneOuterGain = pa.coneOuterGain;
          panner.distanceModel = pa.distanceModel;
          panner.maxDistance = pa.maxDistance;
          panner.refDistance = pa.refDistance;
          panner.rolloffFactor = pa.rolloffFactor;
          panner.panningModel = pa.panningModel;
        } else {
          // Make sure we have a position to setup the node with.
          if (!sound._pos) {
            sound._pos = self._pos || [0, 0, -0.5];
          } // Create a new panner node.


          setupPanner(sound, 'spatial');
        }
      }
    }

    return self;
  };
  /** Single Sound Methods **/

  /***************************************************************************/

  /**
   * Add new properties to the core Sound init.
   * @param  {Function} _super Core Sound init method.
   * @return {Sound}
   */


  Sound.prototype.init = function (_super) {
    return function () {
      var self = this;
      var parent = self._parent; // Setup user-defined default properties.

      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr; // Complete initilization with howler.js core Sound's init function.

      _super.call(this); // If a stereo or position was specified, set it up.


      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      }
    };
  }(Sound.prototype.init);
  /**
   * Override the Sound.reset method to clean up properties from the spatial plugin.
   * @param  {Function} _super Sound reset method.
   * @return {Sound}
   */


  Sound.prototype.reset = function (_super) {
    return function () {
      var self = this;
      var parent = self._parent; // Reset all spatial plugin properties on this sound.

      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr; // If a stereo or position was specified, set it up.

      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      } else if (self._panner) {
        // Disconnect the panner.
        self._panner.disconnect(0);

        self._panner = undefined;

        parent._refreshBuffer(self);
      } // Complete resetting of the sound.


      return _super.call(this);
    };
  }(Sound.prototype.reset);
  /** Helper Methods **/

  /***************************************************************************/

  /**
   * Create a new panner node and save it on the sound.
   * @param  {Sound} sound Specific sound to setup panning on.
   * @param {String} type Type of panner to create: 'stereo' or 'spatial'.
   */


  var setupPanner = function setupPanner(sound, type) {
    type = type || 'spatial'; // Create the new panner node.

    if (type === 'spatial') {
      sound._panner = Howler.ctx.createPanner();
      sound._panner.coneInnerAngle = sound._pannerAttr.coneInnerAngle;
      sound._panner.coneOuterAngle = sound._pannerAttr.coneOuterAngle;
      sound._panner.coneOuterGain = sound._pannerAttr.coneOuterGain;
      sound._panner.distanceModel = sound._pannerAttr.distanceModel;
      sound._panner.maxDistance = sound._pannerAttr.maxDistance;
      sound._panner.refDistance = sound._pannerAttr.refDistance;
      sound._panner.rolloffFactor = sound._pannerAttr.rolloffFactor;
      sound._panner.panningModel = sound._pannerAttr.panningModel;

      if (typeof sound._panner.positionX !== 'undefined') {
        sound._panner.positionX.setValueAtTime(sound._pos[0], Howler.ctx.currentTime);

        sound._panner.positionY.setValueAtTime(sound._pos[1], Howler.ctx.currentTime);

        sound._panner.positionZ.setValueAtTime(sound._pos[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setPosition(sound._pos[0], sound._pos[1], sound._pos[2]);
      }

      if (typeof sound._panner.orientationX !== 'undefined') {
        sound._panner.orientationX.setValueAtTime(sound._orientation[0], Howler.ctx.currentTime);

        sound._panner.orientationY.setValueAtTime(sound._orientation[1], Howler.ctx.currentTime);

        sound._panner.orientationZ.setValueAtTime(sound._orientation[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setOrientation(sound._orientation[0], sound._orientation[1], sound._orientation[2]);
      }
    } else {
      sound._panner = Howler.ctx.createStereoPanner();

      sound._panner.pan.setValueAtTime(sound._stereo, Howler.ctx.currentTime);
    }

    sound._panner.connect(sound._node); // Update the connections.


    if (!sound._paused) {
      sound._parent.pause(sound._id, true).play(sound._id, true);
    }
  };
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
"use strict";

var _tools = require("./tools");

var _Player = require("./Player");

var _Gallery = require("./Gallery");

var _Form = require("./Form");

//import { player } from './player';
//import { form_submission } from './form_submission';
// NOTE: Embedded form submission js only on the booking.html page or lessons.html page
window.onscroll = function () {
  if (window.scrollY >= window.innerHeight * .30) {
    document.querySelector('nav').classList.add('collapse');
  } else {
    document.querySelector('nav').classList.remove('collapse');
  }
}; //mobile menu toggle


var mobileMenu = document.querySelector('ul.menu');
var hamburger = document.querySelector('.hamburger');
var x_close = document.querySelector('.x_close');
document.querySelector('.mobile-menu-toggle').addEventListener('click', function () {
  if (document.querySelector('nav').classList.contains('menu-toggled')) {
    mobileMenu.classList.remove('toggled');
    setTimeout(function () {
      document.querySelector('nav').classList.remove('menu-toggled');
    }, 100);
    return;
  }

  mobileMenu.classList.toggle('toggled');
  document.querySelector('nav').classList.toggle('menu-toggled');
}); //change mobile icon

hamburger.addEventListener('click', function () {
  hamburger.classList.add('hide');
  x_close.classList.remove('hide');
});
x_close.addEventListener('click', function () {
  hamburger.classList.remove('hide');
  x_close.classList.add('hide');
}); // TODO: Refactor to be in a funciton and only called on the Listen page

var playerElements = document.querySelectorAll('.player');
var players = []; // TODO: make sound source dynamic
// maybe add filename as a data member of the player element in the markup

var _loop = function _loop(i) {
  var player = new _Player.Player(playerElements[i].id, playerElements[i].dataset.src);
  console.log(player);
  player.init();
  players.push(player);
  playerElements[i].querySelector('.player-playPause').addEventListener('click', function (e) {
    console.log("> Player ".concat(player.id));
    player.soundToggle(true);
  });
};

for (var i = 0; i < playerElements.length; i++) {
  _loop(i);
} // TODO: do a check so this only runs when a gallery exists,
// and then dynamically create a Gallery object for each gallery id found.


var gallery;

if (document.querySelector('#gallery-1') !== null) {
  gallery = new _Gallery.Gallery("gallery-1");
  gallery.init();
}

var checkbox; // Convert SVG icons to SVG elements

window.onload = function () {
  (0, _tools.replaceSVG)();
  var form;

  if (document.querySelector('form.gform')) {
    form = new _Form.Form(document.querySelector('form.gform').id);
  } // if (form != undefined) form.getData();
  // else (console.log("Form not found."));
  //Parent Guardian check


  if (document.querySelector("input[name=is_parent]") !== null) {
    checkbox = document.querySelector("input[name=is_parent]");
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        document.querySelector('#students').classList.toggle('hide');
        document.querySelector('input[name="user_studentFirstName"]').required = true;
        document.querySelector('input[name="user_studentLastName"]').required = true;
      } else {
        document.querySelector('#students').classList.toggle('hide');
        document.querySelector('input[name="user_studentFirstName"]').required = false;
        document.querySelector('input[name="user_studentLastName"]').required = false;
      }
    });
  }
}; //Page Load Animation


var el = document.querySelector('.loadOverlay');
el.addEventListener("animationend", overlayDone);

function overlayDone() {
  el.classList.remove('loadOverlay');
}

},{"./Form":1,"./Gallery":2,"./Player":3,"./tools":6}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceSVG = replaceSVG;
// ** Various Tools!!!!
//
var PREFIX = '[TOOLS]: ';
var SHOW_LOG = false;

var log = function log() {
  var _console;

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (SHOW_LOG) (_console = console).log.apply(_console, [PREFIX].concat(args));else return;
};

function replaceSVG() {
  var imgSVG = document.querySelectorAll('img.svg');
  var src;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var i = _step.value;
      src = i.src.split('/');

      for (var j = 0; j < src.length; j++) {
        if (src[j] == 'img') {
          src = src.slice(i);
          src = src.join('/');
          break;
        }
      }

      getAsync(src, function (svg) {
        log(svg);
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(svg, 'text/html');
        var svgEl = xmlDoc.querySelector('svg');
        log(svgEl);
        i.parentNode.replaceChild(svgEl, i);
      });
    };

    for (var _iterator = imgSVG[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function getAsync(url, callback) {
  var http = new XMLHttpRequest();

  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      callback(http.responseText);
    }
  };

  http.open("GET", url, true); // false for synchronous request

  http.send(null);
}

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvRm9ybS5qcyIsInNyYy9qcy9HYWxsZXJ5LmpzIiwic3JjL2pzL1BsYXllci5qcyIsInNyYy9qcy9ob3dsZXIuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy90b29scy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7SUNDYSxJOzs7QUFDWCxnQkFBWSxFQUFaLEVBQWdCO0FBQUE7O0FBQUE7O0FBQ2Q7QUFDQSxTQUFLLElBQUwsR0FBWSxRQUFRLENBQUMsYUFBVCxZQUEyQixFQUEzQixFQUFaO0FBQ0EsU0FBSyxJQUFMLENBQVUsZ0JBQVYsQ0FBMkIsUUFBM0IsRUFBcUMsVUFBQyxDQUFELEVBQUs7QUFDeEMsTUFBQSxDQUFDLENBQUMsY0FBRjs7QUFDQSxNQUFBLEtBQUksQ0FBQyxNQUFMLENBQVksQ0FBWjtBQUNELEtBSEQ7QUFJQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLGlCQUF2QixFQUEwQyxnQkFBMUMsQ0FBMkQsT0FBM0QsRUFBb0UsVUFBQyxDQUFELEVBQUs7QUFDdkUsTUFBQSxRQUFRLENBQUMsTUFBVCxDQUFnQixLQUFoQjtBQUNELEtBRkQsRUFQYyxDQVdkOztBQUNBLFNBQUssT0FBTCxHQUFlLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBZjtBQUNBLFNBQUssUUFBTCxHQUFnQixLQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLElBQW5CLENBQWhCO0FBQ0EsU0FBSyxNQUFMLEdBQWMsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixJQUFqQixDQUFkO0FBQ0QsRyxDQUVEOzs7Ozs4QkFDVTtBQUNSLFVBQUksUUFBUSxHQUFHLEtBQUssSUFBTCxDQUFVLFFBQXpCO0FBQ0EsVUFBSSxRQUFKO0FBQ0EsVUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFaLEVBQXNCLE1BQXRCLENB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Q0FBQyxZQUFOLENBQVI7QUFDRDtBQUNGLEdBSkQ7O0FBS0EsRUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBaUIsR0FBakIsRUFBc0IsSUFBdEIsRUFQK0IsQ0FPRjs7QUFDN0IsRUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVY7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuZXhwb3J0IGNsYXNzIEZvcm0ge1xuICBjb25zdHJ1Y3RvcihpZCkge1xuICAgIC8vIEluaXRpYWxpemUgRm9ybSByZWZlcmVuY2UgYW5kIHN1Ym1pdCBsaXN0ZW5lclxuICAgIHRoaXMuZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xuICAgIHRoaXMuZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSk9PntcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuc3VibWl0KGUpO1xuICAgIH0pO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5yZXN1Ym1pdCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpPT57XG4gICAgICBsb2NhdGlvbi5yZWxvYWQoZmFsc2UpO1xuICAgIH0pO1xuXG4gICAgLy8gQmluZCBGb3JtIGZ1bmN0aW9uc1xuICAgIHRoaXMuZ2V0RGF0YSA9IHRoaXMuZ2V0RGF0YS5iaW5kKHRoaXMpO1xuICAgIHRoaXMudmFsaWRhdGUgPSB0aGlzLnZhbGlkYXRlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdWJtaXQgPSB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLy8gVE9ETzogY2xlYW4gdXBcbiAgZ2V0RGF0YSgpIHtcbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLmZvcm0uZWxlbWVudHM7XG4gICAgbGV0IGhvbmV5cG90O1xuICAgIGxldCBmaWVsZHMgPSBPYmplY3Qua2V5cyhlbGVtZW50cykuZmlsdGVyKChrKT0+IHtcbiAgICAgIC8vIEZpbHRlciBvdXQgZmllbGRzIHdlIGRvbid0IG5lZWQgdGhlIHZhbHVlIG9mXG4gICAgICBpZiAoZWxlbWVudHNba10ubmFtZSA9PT0gJ2hvbmV5cG90Jykge1xuICAgICAgICBob25leXBvdCA9IGVsZW1lbnRzW2tdLnZhbHVlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnRzW2tdLnRhZ05hbWUgPT09ICdCVVRUT04nKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pLm1hcCgoayk9PiB7XG4gICAgICAvLyBNYXAgdG8gYSBuZXcgYXJyYXkgb2YganVzdCB0aGUgZWxlbWVudCBuYW1lc1xuICAgICAgaWYgKGVsZW1lbnRzW2tdLm5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudHNba10ubmFtZTtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgRWRnZSdzIGh0bWwgY29sbGVjdGlvblxuICAgICAgfSBlbHNlIGlmIChlbGVtZW50c1trXS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50c1trXS5pdGVtKDApLm5hbWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgZm9ybURhdGEgPSB7fTtcbiAgICBmaWVsZHMuZm9yRWFjaCgobmFtZSk9PntcbiAgICAgIGxldCBlbGVtZW50ID0gZWxlbWVudHNbbmFtZV07XG4gICAgICAvLyBjb25zb2xlLmxvZyhlbGVtZW50KTtcbiAgICAgIGlmIChlbGVtZW50LnR5cGUgPT0gJ2NoZWNrYm94Jykge1xuICAgICAgICBmb3JtRGF0YVtuYW1lXSA9IGVsZW1lbnQuY2hlY2tlZDtcbiAgICAgIH0gZWxzZSBmb3JtRGF0YVtuYW1lXSA9IGVsZW1lbnQudmFsdWU7XG4gICAgfSk7XG5cbiAgICAvLyBhZGQgZm9ybS1zcGVjaWZpYyB2YWx1ZXMgaW50byB0aGUgZGF0YVxuICAgIGZvcm1EYXRhLmZvcm1EYXRhTmFtZU9yZGVyID0gSlNPTi5zdHJpbmdpZnkoZmllbGRzKTtcbiAgICBmb3JtRGF0YS5mb3JtR29vZ2xlU2hlZXROYW1lID0gdGhpcy5mb3JtLmRhdGFzZXQuc2hlZXQgfHwgXCJyZXNwb25zZXNcIjsgLy8gZGVmYXVsdCBzaGVldCBuYW1lXG4gICAgZm9ybURhdGEuZm9ybUdvb2dsZVNlbmRFbWFpbCA9IHRoaXMuZm9ybS5kYXRhc2V0LmVtYWlsIHx8IFwiXCI7IC8vIG5vIGVtYWlsIGJ5IGRlZmF1bHRcbiAgICByZXR1cm4ge2RhdGE6IGZvcm1EYXRhLCBob25leXBvdDogaG9uZXlwb3R9O1xuICB9XG5cbiAgdmFsaWRhdGUoKSB7XG4gICAgLy8gUmVzZXQgbGFiZWxzIChyZXF1aXJlZCAmIGVycm9yIG1lc3NhZ2luZylcbiAgICBsZXQgbGFiZWxzID0gQXJyYXkuZnJvbSh0aGlzLmZvcm0ucXVlcnlTZWxlY3RvckFsbCgnbGFiZWwnKSk7XG4gICAgZm9yIChsZXQgbCBvZiBsYWJlbHMpIHtcbiAgICAgIGwuY2xhc3NMaXN0LnJlbW92ZSgnZXJyb3InKTtcbiAgICB9XG4gICAgLy8gUnVuIEhUTUwgRm9ybSB2YWxpZGF0aW9uIGNoZWNrXG4gICAgbGV0IGlzVmFsaWQgPSB0aGlzLmZvcm0uY2hlY2tWYWxpZGl0eSgpO1xuXG4gICAgLy8gU2V0dXAgdmFyaWFibGVzXG4gICAgbGV0IGludmFsaWRFbGVtZW50cyA9IFtdO1xuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuZm9ybS5lbGVtZW50cztcblxuICAgIC8vIEdldCBhbnkgaW52YWxpZCBlbGVtZW50cyAoZGVlbWVkIGludmFsaWQgYnkgY2hlY2tWYWxpZGl0eSlcbiAgICBpZiAoIWlzVmFsaWQpIGludmFsaWRFbGVtZW50cyA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCc6aW52YWxpZCcpO1xuXG4gICAgLy8gQWRkIGFueSBpbnZhbGlkIGNoZWNrYm94ZXMgdG8gdGhlIGxpc3Qgb2YgaW52YWxpZHNcbiAgICBsZXQgY2hlY2tib3hHcm91cHMgPSB0aGlzLmZvcm0ucXVlcnlTZWxlY3RvckFsbCgnLmNoZWNrYm94LWdyb3VwJyk7XG4gICAgaWYgKGNoZWNrYm94R3JvdXBzLmxlbmd0aCl7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoZWNrYm94R3JvdXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpbnZhbGlkRWxlbWVudHMubGVuZ3RoID4gMCkgaW52YWxpZEVsZW1lbnRzID0gQXJyYXkuZnJvbShpbnZhbGlkRWxlbWVudHMpO1xuICAgICAgICBlbHNlIGludmFsaWRFbGVtZW50cyA9IFtdO1xuICAgICAgICBpZihjaGVja2JveEdyb3Vwc1tpXS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl06Y2hlY2tlZCcpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgaW52YWxpZEVsZW1lbnRzLnB1c2goY2hlY2tib3hHcm91cHNbaV0pO1xuICAgICAgICAgIGNoZWNrYm94R3JvdXBzW2ldLnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsJykuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICAgICAgICBpbnZhbGlkRWxlbWVudHNbaW52YWxpZEVsZW1lbnRzLmxlbmd0aC0xXS5uYW1lID0gY2hlY2tib3hHcm91cHNbaV0uZGF0YXNldC5uYW1lO1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBBZGQgZXJyb3IgY2xhc3MgdG8gaW52YWxpZHMnIGxhYmVscywgYW5kIHJldHVybiBkYXRhIG9yIGZhbHNlXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGludmFsaWRFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zb2xlLmxvZyhpbnZhbGlkRWxlbWVudHNbaV0pO1xuICAgICAgICBpZiAoaW52YWxpZEVsZW1lbnRzW2ldLmNsYXNzTGlzdC5jb250YWlucygnY2hlY2tib3gtZ3JvdXAnKSl7XG4gICAgICAgICAgaW52YWxpZEVsZW1lbnRzW2ldLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3IoYGxhYmVsW2Zvcj0nJHtpbnZhbGlkRWxlbWVudHNbaV0ubmFtZX0nYClcbiAgICAgICAgICAuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGF0YSgpO1xuICB9XG5cbiAgc3VibWl0KGV2ZW50KSB7XG4gICAgbGV0IGZvcm0gPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IGZvcm1EYXRhID0gdGhpcy52YWxpZGF0ZSgpO1xuICAgIHRoaXMuZm9ybS5jbGFzc0xpc3QuYWRkKCdzdWJtaXR0ZWQnKTtcbiAgICAvLyBDaGVjayBpZiBmb3JtRGF0YSBpcyB2YWxpZGF0ZWRcbiAgICBpZiAoIWZvcm1EYXRhKSB7XG4gICAgICBsZXQganVtcFRvID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsLmVycm9yJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gMTQ2O1xuICAgICAgd2luZG93LnNjcm9sbEJ5KDAsIGp1bXBUbyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFRPRE86IHJlbW92ZSBuZXh0IHR3byBsaW5lcyB0byBtYWtlIHN1Ym1pdCB3b3JrXG4gICAgY29uc29sZS5sb2coJ1tERUJVR106IGRhdGE6ICcsIGZvcm1EYXRhLmRhdGEpO1xuICAgIC8vIHJldHVybiBmYWxzZTtcbiAgICBsZXQgZGF0YSA9IGZvcm1EYXRhLmRhdGE7XG5cbiAgICAvLyBJZiBhIGhvbmV5cG90IGZpZWxkIGlzIGZpbGxlZCwgYXNzdW1lIGl0IHdhcyBkb25lIHNvIGJ5IGEgc3BhbSBib3QuXG4gICAgaWYgKGZvcm1EYXRhLmhvbmV5cG90KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gdGhpcy5zaG93Q29uZmlybWF0aW9uKCk7XG4gICAgLy8gcmV0dXJuIGZhbHNlO1xuICAgIGxldCB1cmwgPSBmb3JtLmFjdGlvbjtcbiAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIHhoci5vcGVuKCdQT1NUJywgdXJsKTtcbiAgICAvLyB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKTtcbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgY29uc29sZS5sb2coJyVjIFtGb3JtXTogU3VibWl0dGVkISAnLCAnY29sb3I6IGdvbGQnKTtcbiAgICAgICAgICBzZWxmLnNob3dDb25maXJtYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyB1cmwgZW5jb2RlIGZvcm0gZGF0YSBmb3Igc2VuZGluZyBhcyBwb3N0IGRhdGFcbiAgICBsZXQgZW5jb2RlZCA9IE9iamVjdC5rZXlzKGRhdGEpLm1hcCgoayk9PiB7XG4gICAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoaykgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChkYXRhW2tdKTtcbiAgICB9KS5qb2luKCcmJyk7XG4gICAgeGhyLnNlbmQoZW5jb2RlZCk7XG4gIH1cbiAgc2hvd0NvbmZpcm1hdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcImZ1Y2tpbiBDT05GSVJNRURcIik7XG4gICAgdGhpcy5mb3JtLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZm9ybS1jb25maXJtYXRpb24nKS5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgbGV0IGp1bXBUbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mb3JtLWNvbmZpcm1hdGlvbicpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIDE0NjtcbiAgICB3aW5kb3cuc2Nyb2xsQnkoMCwganVtcFRvKTtcbiAgfVxufVxuIiwiXG5leHBvcnQgY2xhc3MgR2FsbGVyeSB7XG4gIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICB0aGlzLmdhbGxlcnkgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5nYWxsZXJ5SXRlbXMgPSBbXTtcbiAgICB0aGlzLmluZGljYXRvcldyYXBwZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50aW1lciA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5nYWxsZXJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5pZH1gKTtcbiAgICB0aGlzLmdhbGxlcnlJdGVtcyA9IHRoaXMuZ2FsbGVyeS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2FsbGVyeS1pdGVtJyk7XG4gICAgdGhpcy5pbmRpY2F0b3JXcmFwcGVyID0gdGhpcy5nYWxsZXJ5LnF1ZXJ5U2VsZWN0b3IoJy5pbmRpY2F0b3Itd3JhcHBlcicpO1xuICAgIHRoaXMuc2V0dXBJbmRpY2F0b3IoKTtcbiAgICBsZXQgc2VsZiA9IHRoaXM7IC8vIHN0b3JlIGEgcmVmZXJlbmNlIG9mIHRoZSBjb250ZXh0IGZvciBhbm9uIGZ1bmN0aW9uc1xuXG4gICAgdGhpcy5nYWxsZXJ5LnF1ZXJ5U2VsZWN0b3IoJy5nYWxsZXJ5LWFycm93cyAuYXJyb3cubGVmdCcpLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHNlbGYuaGFuZGxlRGVjcmVtZW50SXRlbShzZWxmKTtcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMuZ2FsbGVyeS5xdWVyeVNlbGVjdG9yKCcuZ2FsbGVyeS1hcnJvd3MgLmFycm93LnJpZ2h0JykuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdjbGljaycsICgpID0+IHtcbiAgICAgICAgc2VsZi5oYW5kbGVJbmNyZW1lbnRJdGVtKHNlbGYpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBIYW5kbGUgTW9iaWxlIHN3aXBlIGdlc3R1cmVzXG4gICAgbGV0IHN3aXBlWFN0YXJ0ID0gMDtcbiAgICBsZXQgc3dpcGVYRW5kID0gMDtcbiAgICB0aGlzLmdhbGxlcnkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKT0+e1xuICAgICAgc3dpcGVYU3RhcnQgPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICB9KTtcbiAgICB0aGlzLmdhbGxlcnkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAoZSk9PntcbiAgICAgIHN3aXBlWEVuZCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgIGlmIChzd2lwZVhFbmQgPiBzd2lwZVhTdGFydCkgeyAvLyBzd2lwZWQgbGVmdFxuICAgICAgICBzZWxmLmhhbmRsZURlY3JlbWVudEl0ZW0oc2VsZik7XG4gICAgICB9IGVsc2UgaWYgKHN3aXBlWEVuZCA8IHN3aXBlWFN0YXJ0KSB7IC8vIHN3aXBlZCByaWdodFxuICAgICAgICBzZWxmLmhhbmRsZUluY3JlbWVudEl0ZW0oc2VsZik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBGSVhNRTogb25lIGRheSBtYXliZSBtYWtlIHRoaXMgc2V0VGltZXIgY2FsbCBvbmNlIHRoZSBnYWxsZXJ5IGlzIGluIHZpZXdcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKT0+e3RoaXMuc2V0VGltZXIoKX0sIDUwMDApO1xuICB9XG5cbiAgc2V0VGltZXIoKSB7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoKCk9Pnt0aGlzLmhhbmRsZVRpbWVyKCl9LCA1MDAwKTtcbiAgfVxuXG4gIGhhbmRsZVRpbWVyKCkge1xuICAgIHRoaXMuY3VycmVudEluZGV4Kys7XG4gICAgY29uc29sZS5sb2coJ29pJyk7XG4gICAgaWYgKHRoaXMuY3VycmVudEluZGV4ID09IHRoaXMuZ2FsbGVyeUl0ZW1zLmxlbmd0aCkge1xuICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZUluZGljYXRvcih1bmRlZmluZWQsIHRoaXMuY3VycmVudEluZGV4KTtcbiAgfVxuXG4gIHNldHVwSW5kaWNhdG9yKCkge1xuICAgIGxldCBjb3VudCA9IHRoaXMuZ2FsbGVyeUl0ZW1zLmxlbmd0aCAtIDE7XG4gICAgbGV0IGluZGljYXRvcjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ2FsbGVyeUl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpbmRpY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGluZGljYXRvci5jbGFzc0xpc3QuYWRkKCdpbmRpY2F0b3InLCBgaS0ke2l9YCk7XG4gICAgICBpZiAoaSA9PSAwKSBpbmRpY2F0b3IuY2xhc3NMaXN0LmFkZCgnY3VycmVudCcpO1xuICAgICAgaW5kaWNhdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVJbmRpY2F0b3IoZS50YXJnZXQsIGkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmluZGljYXRvcldyYXBwZXIuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVJbmRpY2F0b3IoaW5kaWNhdG9yLCBpbmRleCkge1xuICAgIGxldCBpbmRpY2F0b3JzID1cbiAgICAgIHRoaXMuaW5kaWNhdG9yV3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCdbY2xhc3MqPVwiaW5kaWNhdG9yXCJdJyk7XG4gICAgaWYgKHRoaXMuaW5kaWNhdG9yV3JhcHBlci5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCcpKSB7XG4gICAgICAgIHRoaXMuaW5kaWNhdG9yV3JhcHBlci5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCcpXG4gICAgICAgICAgLmNsYXNzTGlzdC5yZW1vdmUoJ2N1cnJlbnQnKTtcbiAgICB9XG4gICAgaWYgKGluZGljYXRvciA9PSB1bmRlZmluZWQpIHtcbiAgICAgIGluZGljYXRvciA9IGluZGljYXRvcnNbaW5kZXhdO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhpbmRpY2F0b3IpO1xuICAgIGluZGljYXRvci5jbGFzc0xpc3QuYWRkKCdjdXJyZW50Jyk7XG4gICAgdGhpcy5zZXRDdXJyZW50SXRlbSh0aGlzLmdhbGxlcnlJdGVtc1tpbmRleF0sIGluZGV4KTtcbiAgfVxuXG4gIGhhbmRsZURlY3JlbWVudEl0ZW0oc2VsZikge1xuICAgIGlmIChzZWxmLmN1cnJlbnRJbmRleCA9PSAwKSB7XG4gICAgICBzZWxmLmN1cnJlbnRJbmRleCA9IHNlbGYuZ2FsbGVyeUl0ZW1zLmxlbmd0aC0xO1xuICAgICAgY29uc29sZS5sb2coc2VsZi5jdXJyZW50SW5kZXgsIHNlbGYuZ2FsbGVyeUl0ZW1zLmxlbmd0aC0xKTtcbiAgICAgIHNlbGYuaGFuZGxlSW5kaWNhdG9yKHVuZGVmaW5lZCwgc2VsZi5jdXJyZW50SW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmN1cnJlbnRJbmRleC0tO1xuICAgICAgc2VsZi5oYW5kbGVJbmRpY2F0b3IodW5kZWZpbmVkLCBzZWxmLmN1cnJlbnRJbmRleCk7XG4gICAgICBzZWxmLmFuaW1hdGUoJ2xlZnQnKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVJbmNyZW1lbnRJdGVtKHNlbGYpIHtcbiAgICBpZiAoc2VsZi5jdXJyZW50SW5kZXggPT0gc2VsZi5nYWxsZXJ5SXRlbXMubGVuZ3RoLTEpIHtcbiAgICAgIHNlbGYuY3VycmVudEluZGV4ID0gMDtcbiAgICAgIHNlbGYuaGFuZGxlSW5kaWNhdG9yKHVuZGVmaW5lZCwgc2VsZi5jdXJyZW50SW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmN1cnJlbnRJbmRleCsrO1xuICAgICAgc2VsZi5oYW5kbGVJbmRpY2F0b3IodW5kZWZpbmVkLCBzZWxmLmN1cnJlbnRJbmRleCk7XG4gICAgICBzZWxmLmFuaW1hdGUoJ3JpZ2h0Jyk7XG4gICAgfVxuICB9XG5cbiAgc2V0Q3VycmVudEl0ZW0oaXRlbSwgaW5kZXgpIHtcbiAgICB0aGlzLnNldFRpbWVyKCk7XG4gICAgdGhpcy5nYWxsZXJ5LnF1ZXJ5U2VsZWN0b3IoJy5jdXJyZW50JykuY2xhc3NMaXN0LnJlbW92ZSgnY3VycmVudCcpO1xuICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnY3VycmVudCcpO1xuICAgIHRoaXMuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhbmltYXRlKGRpcmVjdGlvbikge1xuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2xlZnQnKSB7XG4gICAgICB0aGlzLmdhbGxlcnkuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0ZS1yaWdodCcpO1xuICAgICAgdGhpcy5nYWxsZXJ5LmNsYXNzTGlzdC5hZGQoJ2FuaW1hdGUtbGVmdCcpO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09ICdyaWdodCcpIHtcbiAgICAgIHRoaXMuZ2FsbGVyeS5jbGFzc0xpc3QucmVtb3ZlKCdhbmltYXRlLWxlZnQnKTtcbiAgICAgIHRoaXMuZ2FsbGVyeS5jbGFzc0xpc3QuYWRkKCdhbmltYXRlLXJpZ2h0Jyk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBIb3dsLCBIb3dsZXIgfSBmcm9tICcuL2hvd2xlcic7XG5cbi8qKlxuICogUGxheWVyIOKAkyBzb3VuZCBzYW1wbGUgcGxheWVyIG9iamVjdCB0aGF0IHRoZSBwbGF5c3RhdGUgb2YgYW4gYXVkaW8gZmlsZSBhbmRcbiAqIHRoZSBVSSB0byBjb250cm9sIHRoZSBwbGF5YmFjayBvZiB0aGUgc2FtcGxlXG4gKiBAdHlwZSB7b2JqZWN0fVxuICovXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgY29uc3RydWN0b3IoaWQsIHNyYykge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICAgIC8vIFRoZSBzb3VuZCBzYW1wbGUgYW5kIGl0J3MgbWV0YWRhdGFcbiAgICB0aGlzLnNhbXBsZSA9IHtcbiAgICAgIHNvdW5kOiB1bmRlZmluZWQsXG4gICAgICBzcmM6IHNyYyxcbiAgICAgIGluZm86IHtcbiAgICAgICAgdGltZTogMCxcbiAgICAgICAgbWludXRlOiAwLFxuICAgICAgICBzZWNvbmQ6IDAsXG4gICAgICAgIHRpbWVGb3JtYXR0ZWQ6ICcnLFxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5wbGF5ZXIgPSBudWxsO1xuICAgIC8vIFNjcnViYmVyIGVsZW1lbnRcbiAgICB0aGlzLnNjcnViYmVyID0gbnVsbDtcbiAgICAvLyBUaW1lc3RhbXAgZWxlbWVudFxuICAgIHRoaXMudGltZXN0YW1wID0gbnVsbDtcbiAgICAvLyBHbG9iYWwgdGltZXIgZm9yIGNvdW50aW5nIHRpY2tzIGZvciBVSSB1cGRhdGVzXG4gICAgdGhpcy50aW1lciA9IHsgICAgICAgICAgLy8gaWQ6IDAgKGFsbClcbiAgICAgIHRpbWVzdGFtcDogdW5kZWZpbmVkLCAvLyBpZDogMVxuICAgICAgc2NydWJiZXI6IHVuZGVmaW5lZCAgIC8vIGlkOiAyXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIFBsYXllciBpbnN0YW5jZSBhbmQgVUlcbiAgICogQHJldHVybiBub25lXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIFNldHVwIHBsYXllciBlbGVtZW50XG4gICAgdGhpcy5wbGF5ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0aGlzLmlkfWApO1xuICAgIC8vIFNldHVwIHNjcnViYmVyIGVsZW1lbnRcbiAgICB0aGlzLnNjcnViYmVyID0gdGhpcy5wbGF5ZXIucXVlcnlTZWxlY3RvcignLnNjcnViYmVyJyk7XG4gICAgLy8gU2V0dXAgdGltZXN0YW1wIGVsZW1lbnRcbiAgICB0aGlzLnRpbWVzdGFtcCA9IHRoaXMucGxheWVyLnF1ZXJ5U2VsZWN0b3IoJy50aW1lc3RhbXAtdGltZWxlZnQnKTtcblxuICAgIHRoaXMuc2NydWJiZXIuc3RlcCA9IDAuMDE7XG4gICAgbGV0IHNlbGYgPSB0aGlzOyAvLyB0ZW1wIGZvciB1c2luZyBjbGFzcyBmdW5jdGlvbnMgd2l0aGluIGxpc3RlbmVyIGZ1bmN0aW9uXG5cbiAgICBsZXQgdGVtcFBsYXlTdGF0ZTsgLy8gdXNlZCB0byBrZWVwIHBsYXlpbmcgaWYgc2NydWJiaW5nIGR1cmluZyBwbGF5YmFja1xuICAgIHRoaXMuc2NydWJiZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpPT57XG4gICAgICBzZWxmLmlzUGxheWluZyA9IHNlbGYuc2FtcGxlLnNvdW5kLnBsYXlpbmcoKTtcbiAgICAgIHRlbXBQbGF5U3RhdGUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlbGYuaXNQbGF5aW5nKSk7XG4gICAgICBzZWxmLnNvdW5kUGF1c2UoKTtcbiAgICB9KTtcbiAgICB0aGlzLnNjcnViYmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSk9PntcbiAgICAgIGNvbnNvbGUubG9nKFwidXBkYXRpbmcgcmFuZ2UgdmFsdWVcIiwgZS50YXJnZXQudmFsdWUsIE1hdGgucm91bmQoZS50YXJnZXQudmFsdWUpKTtcbiAgICAgIHNlbGYuc291bmRTY3J1YihlLnRhcmdldC52YWx1ZSk7XG4gICAgICBzZWxmLmlzUGxheWluZyA9IHRlbXBQbGF5U3RhdGU7XG4gICAgICBpZiAoc2VsZi5pc1BsYXlpbmcpIHNlbGYuc291bmRTdGFydCgpO1xuICAgIH0pO1xuXG4gICAgLy8gU2V0dXAgc2FtcGxlIHNvdW5kXG4gICAgdGhpcy5zYW1wbGUuc291bmQgPSBuZXcgSG93bCh7XG4gICAgICBzcmM6IFt0aGlzLnNhbXBsZS5zcmNdXG4gICAgfSk7XG4gICAgdGhpcy5zb3VuZExvYWQoKTtcblxuICAgIC8vIFNldHVwIHNvdW5kIGxpc3RlbmVyc1xuICAgIHRoaXMuc2FtcGxlLnNvdW5kLm9uY2UoJ2xvYWQnLCAoKSA9PiB7c2VsZi5zb3VuZExvYWQoKX0pO1xuICAgIHRoaXMuc2FtcGxlLnNvdW5kLm9uKCdlbmQnLCAoKSA9PiB7c2VsZi5zb3VuZEVuZCgpfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSB0aW1lc3RhbXAgVUlcbiAgICogQHBhcmFtICB7bnVtYmVyfSBzZWVrVmFsIHZhbHVlIGJlaW5nIHNlZWtlZCB0byBtYXRjaCB0aGUgdGltZXN0YW1wIHRvXG4gICAqIEByZXR1cm4gbm9uZVxuICAgKi9cbiAgdXBkYXRlVGltZXN0YW1wKHNlZWtWYWwpIHtcbiAgICAvLyBUT0RPOiBmaXggdGltZXN0YW1wIHNvIGl0IGRvZXNuJ3QgbGV0IHlvdSBzZWxlY3QgTyB1c2luZyB0aGUgc2xpZGVyLCByb3VuZFxuICAgIC8vIHVwIHRvIDEgaWYgMSA+IHQgPiAwXG4gICAgaWYgKHNlZWtWYWwgPT0gdW5kZWZpbmVkKSBzZWVrVmFsID0gTWF0aC5yb3VuZCh0aGlzLnNhbXBsZS5zb3VuZC5zZWVrKCkpO1xuICAgIGxldCBjID0ge307IC8vIEN1cnJlbnQgdGltZVxuICAgIGMudGltZSA9IHRoaXMuc2FtcGxlLmluZm8udGltZSAtIE1hdGgucm91bmQodGhpcy5zYW1wbGUuc291bmQuc2VlaygpKTtcbiAgICBjLm1pbnV0ZSA9IE1hdGguZmxvb3IoYy50aW1lIC8gNjApO1xuICAgIGMuc2Vjb25kID0gYy50aW1lIC0gYy5taW51dGUgKiA2MDtcbiAgICBjLmZvcm1hdHRlZFRpbWUgPSBgJHtjLm1pbnV0ZX06JHsoJzAnICsgYy5zZWNvbmQpLnNsaWNlKC0yKX1gO1xuICAgIHRoaXMudGltZXN0YW1wLmlubmVySFRNTCA9IGMuZm9ybWF0dGVkVGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHNjcnViIGhhbmRsZSBVSVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHNlZWtWYWwgdmFsdWUgYmVpbmcgc2Vla2VkIHRvIG1hdGNoIHRoZSBzY3J1YmJlciB0b1xuICAgKiBAcmV0dXJuIG5vbmVcbiAgICovXG4gIHVwZGF0ZVNjcnViYmVyUG9zaXRpb24oc2Vla1ZhbCkge1xuICAgIGlmIChzZWVrVmFsID09IHVuZGVmaW5lZClcbiAgICAgIHRoaXMuc2NydWJiZXIudmFsdWUgPSB0aGlzLnNhbXBsZS5zb3VuZC5zZWVrKCk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zY3J1YmJlci52YWx1ZSA9IHNlZWtWYWw7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBzb3VuZCBpbmZvcm1hdGlvbiBhbmQgc2V0IHNjcnViYmVyIFVJIHZhcmlhYmxlc1xuICAgKiAoQ2FsbGJhY2sgZm9yIHNvdW5kLm9ubG9hZClcbiAgICogQHJldHVybiBub25lXG4gICAqL1xuICBzb3VuZExvYWQoKSB7XG4gICAgY29uc29sZS5sb2coJ1NvdW5kIGxvYWRlZC4nKTtcbiAgICB0aGlzLnNhbXBsZS5pbmZvLnRpbWUgPSBNYXRoLmZsb29yKHRoaXMuc2FtcGxlLnNvdW5kLmR1cmF0aW9uKCkpO1xuICAgIHRoaXMuc2FtcGxlLmluZm8ubWludXRlID0gTWF0aC5mbG9vcih0aGlzLnNhbXBsZS5pbmZvLnRpbWUgLyA2MCk7XG4gICAgdGhpcy5zYW1wbGUuaW5mby5zZWNvbmQgPSB0aGlzLnNhbXBsZS5pbmZvLnRpbWVcbiAgICAgIC0gdGhpcy5zYW1wbGUuaW5mby5taW51dGUgKiA2MDtcbiAgICB0aGlzLnNhbXBsZS5pbmZvLmZvcm1hdHRlZFRpbWUgPSBgJHt0aGlzLnNhbXBsZS5pbmZvLm1pbnV0ZX06JHsoJzAnXG4gICAgICArIHRoaXMuc2FtcGxlLmluZm8uc2Vjb25kKS5zbGljZSgtMil9YDtcbiAgICB0aGlzLnRpbWVzdGFtcC5pbm5lckhUTUwgPSB0aGlzLnNhbXBsZS5pbmZvLmZvcm1hdHRlZFRpbWU7XG4gICAgdGhpcy5zY3J1YmJlci5tYXggPSB0aGlzLnNhbXBsZS5pbmZvLnRpbWU7XG4gICAgdGhpcy5zY3J1YmJlci52YWx1ZSA9IDA7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3Igc2NydWJiaW5nIChzZWVraW5nKSB0aGUgc291bmQgc2FtcGxlXG4gICAqIEBwYXJhbSAge251bWJlcn0gc2Vla1ZhbCB2YWx1ZSB0byBzZWVrIHRoZSBzb3VuZCB0b1xuICAgKiBAcmV0dXJuIG5vbmVcbiAgICovXG4gIHNvdW5kU2NydWIoc2Vla1ZhbCkge1xuICAgIGNvbnNvbGUubG9nKCdTb3VuZCBzY3J1YmJlZC4nKTtcbiAgICB0aGlzLnNhbXBsZS5zb3VuZC5zZWVrKHNlZWtWYWwpO1xuICAgIHRoaXMudXBkYXRlVGltZXN0YW1wKHNlZWtWYWwpO1xuICAgIHRoaXMudXBkYXRlU2NydWJiZXJQb3NpdGlvbihzZWVrVmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVyIGZvciBzdGFydGluZyB0aGUgc291bmQgc2FtcGxlXG4gICAqIEByZXR1cm4gbm9uZVxuICAgKi9cbiAgc291bmRTdGFydCgpIHtcbiAgICAvLyBQcmV2ZW50IG92ZXJsYXBwaW5nIGluc3RhbmNlcyBvZiB0aGUgc291bmRcbiAgICBpZiAodGhpcy5zYW1wbGUuc291bmQucGxheWluZygpKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coJ1NvdW5kIHN0YXJ0LicpO1xuICAgIHRoaXMuc2V0VGltZXIoMCk7XG4gICAgdGhpcy5zYW1wbGUuc291bmQucGxheSgpO1xuICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVyIGZvciBwYXVzaW5nIHRoZSBzb3VuZCBzYW1wbGVcbiAgICogQHJldHVybiBub25lXG4gICAqL1xuICBzb3VuZFBhdXNlKCkge1xuICAgIC8vIGNvbnN0IHRlbXAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuaXNQbGF5aW5nKSk7XG4gICAgLy8gY29uc29sZS5sb2coJ3RlbXAnLCB0ZW1wKTtcbiAgICBjb25zb2xlLmxvZygnU291bmQgcGF1c2VkLicpO1xuICAgIHRoaXMuY2xlYXJUaW1lcigwKTtcbiAgICB0aGlzLnNhbXBsZS5zb3VuZC5wYXVzZSgpO1xuICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3Igc3RvcHBpbmcgdGhlIHNvdW5kIHNhbXBsZVxuICAgKiBAcmV0dXJuIG5vbmVcbiAgICovXG4gIHNvdW5kU3RvcCgpIHtcbiAgICBjb25zb2xlLmxvZygnU291bmQgc3RvcHBlZC4nKTtcbiAgICB0aGlzLmNsZWFyVGltZXIoMCk7XG4gICAgdGhpcy5zYW1wbGUuc291bmQuc3RvcCgpO1xuICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3Igd2hlbiB0aGUgc291bmQgc2FtcGxlIGVuZHNcbiAgICogKENhbGxiYWNrIGZvciBzb3VuZC5vbmVuZClcbiAgICogQHJldHVybiBub25lXG4gICAqL1xuICBzb3VuZEVuZCgpIHtcbiAgICBjb25zb2xlLmxvZygnU291bmQgZmluaXNoZWQuJyk7XG4gICAgdGhpcy5jbGVhclRpbWVyKDApO1xuICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZXNldFBsYXllcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNvdW5kIGJldHdlZW4gcGxheSBhbmQgcGF1c2VcbiAgICogQHJldHVybiBub25lXG4gICAqL1xuICBzb3VuZFRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5pc1BsYXlpbmcpIHtcbiAgICAgIHRoaXMuc291bmRQYXVzZSgpO1xuICAgICAgdGhpcy50b2dnbGVQbGF5QnV0dG9uKCdwbGF5Jyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zb3VuZFN0YXJ0KCk7XG4gICAgICB0aGlzLnRvZ2dsZVBsYXlCdXR0b24oJ3BhdXNlJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXIgZm9yIFVJIFBsYXkgYnV0dG9uIHRoYXQgdG9nZ2xlcyBiZXR3ZWVuIHBsYXkgYW5kIHBhdXNlIGljb25zXG4gICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgdG9nZ2xlUGxheUJ1dHRvbihzcGVjaWZpZWRJY29uKSB7XG4gICAgbGV0IGJ1dHRvbiA9IHRoaXMucGxheWVyLnF1ZXJ5U2VsZWN0b3IoJy5wbGF5ZXItaWNvbicpO1xuICAgIGlmIChzcGVjaWZpZWRJY29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN3aXRjaCAoc3BlY2lmaWVkSWNvbikge1xuICAgICAgICBjYXNlICdwbGF5JzpcbiAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgncGF1c2UnKTtcbiAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncGxheScpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwYXVzZSc6XG4gICAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ3BsYXknKTtcbiAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncGF1c2UnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaXNQbGF5aW5nKSB7XG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdwbGF5Jyk7XG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdwYXVzZScpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdwYXVzZScpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncGxheScpO1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cbiAgcmVzZXRQbGF5ZXIoKSB7XG4gICAgdGhpcy5zb3VuZFNjcnViKDApO1xuICAgIHRoaXMudG9nZ2xlUGxheUJ1dHRvbigncGxheScpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIGludGVydmFscyB0byBtYWludGFpbiB0aWNrcyBmb3IgVUlcbiAgICogQHBhcmFtICB7bnVtYmVyfSB0aW1lcklkIDAgZm9yIGFsbCB0aW1lcnMsIDEgZm9yIHRpbWVzdGFtcCwgMiBmb3Igc2NydWJiZXJcbiAgICogQHJldHVybiBub25lXG4gICAqL1xuICBjbGVhclRpbWVyKHRpbWVySWQpIHtcbiAgICBzd2l0Y2ggKHRpbWVySWQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyLnRpbWVzdGFtcCk7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lci5zY3J1YmJlcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBjbGVhckludGVydmFsKHRoaXMudGltZXIudGltZXN0YW1wKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lci5zY3J1YmJlcik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgaW50ZXJ2YWxzIHRvIG1haW50YWluIHRpY2tzIGZvciBVSVxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXJJZCAwIGZvciBhbGwgdGltZXJzLCAxIGZvciB0aW1lc3RhbXAsIDIgZm9yIHNjcnViYmVyXG4gICAqL1xuICBzZXRUaW1lcih0aW1lcklkKSB7XG4gICAgc3dpdGNoICh0aW1lcklkKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHRoaXMudGltZXIudGltZXN0YW1wID0gc2V0SW50ZXJ2YWwoKCk9Pnt0aGlzLnVwZGF0ZVRpbWVzdGFtcCgpfSwgNTAwKTtcbiAgICAgICAgdGhpcy50aW1lci5zY3J1YmJlciA9ICBzZXRJbnRlcnZhbCgoKT0+e3RoaXMudXBkYXRlU2NydWJiZXJQb3NpdGlvbigpfSwgMTUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgdGhpcy50aW1lci50aW1lc3RhbXAgPSBzZXRJbnRlcnZhbCgoKT0+e3RoaXMudXBkYXRlVGltZXN0YW1wKCl9LCA1MDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgdGhpcy50aW1lci5zY3J1YmJlciA9ICBzZXRJbnRlcnZhbCgoKT0+e3RoaXMudXBkYXRlU2NydWJiZXJQb3NpdGlvbigpfSwgMTUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiIsIi8qIVxuICogIGhvd2xlci5qcyB2Mi4xLjJcbiAqICBob3dsZXJqcy5jb21cbiAqXG4gKiAgKGMpIDIwMTMtMjAxOSwgSmFtZXMgU2ltcHNvbiBvZiBHb2xkRmlyZSBTdHVkaW9zXG4gKiAgZ29sZGZpcmVzdHVkaW9zLmNvbVxuICpcbiAqICBNSVQgTGljZW5zZVxuICovXG5cbihmdW5jdGlvbigpIHtcblxuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqIEdsb2JhbCBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgdGhlIGdsb2JhbCBjb250cm9sbGVyLiBBbGwgY29udGFpbmVkIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgYXBwbHlcbiAgICogdG8gYWxsIHNvdW5kcyB0aGF0IGFyZSBjdXJyZW50bHkgcGxheWluZyBvciB3aWxsIGJlIGluIHRoZSBmdXR1cmUuXG4gICAqL1xuICB2YXIgSG93bGVyR2xvYmFsID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gIH07XG4gIEhvd2xlckdsb2JhbC5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB0aGUgZ2xvYmFsIEhvd2xlciBvYmplY3QuXG4gICAgICogQHJldHVybiB7SG93bGVyfVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcblxuICAgICAgLy8gQ3JlYXRlIGEgZ2xvYmFsIElEIGNvdW50ZXIuXG4gICAgICBzZWxmLl9jb3VudGVyID0gMTAwMDtcblxuICAgICAgLy8gUG9vbCBvZiB1bmxvY2tlZCBIVE1MNSBBdWRpbyBvYmplY3RzLlxuICAgICAgc2VsZi5faHRtbDVBdWRpb1Bvb2wgPSBbXTtcbiAgICAgIHNlbGYuaHRtbDVQb29sU2l6ZSA9IDEwO1xuXG4gICAgICAvLyBJbnRlcm5hbCBwcm9wZXJ0aWVzLlxuICAgICAgc2VsZi5fY29kZWNzID0ge307XG4gICAgICBzZWxmLl9ob3dscyA9IFtdO1xuICAgICAgc2VsZi5fbXV0ZWQgPSBmYWxzZTtcbiAgICAgIHNlbGYuX3ZvbHVtZSA9IDE7XG4gICAgICBzZWxmLl9jYW5QbGF5RXZlbnQgPSAnY2FucGxheXRocm91Z2gnO1xuICAgICAgc2VsZi5fbmF2aWdhdG9yID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5uYXZpZ2F0b3IpID8gd2luZG93Lm5hdmlnYXRvciA6IG51bGw7XG5cbiAgICAgIC8vIFB1YmxpYyBwcm9wZXJ0aWVzLlxuICAgICAgc2VsZi5tYXN0ZXJHYWluID0gbnVsbDtcbiAgICAgIHNlbGYubm9BdWRpbyA9IGZhbHNlO1xuICAgICAgc2VsZi51c2luZ1dlYkF1ZGlvID0gdHJ1ZTtcbiAgICAgIHNlbGYuYXV0b1N1c3BlbmQgPSB0cnVlO1xuICAgICAgc2VsZi5jdHggPSBudWxsO1xuXG4gICAgICAvLyBTZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGUgYXV0byBhdWRpbyB1bmxvY2tlci5cbiAgICAgIHNlbGYuYXV0b1VubG9jayA9IHRydWU7XG5cbiAgICAgIC8vIFNldHVwIHRoZSB2YXJpb3VzIHN0YXRlIHZhbHVlcyBmb3IgZ2xvYmFsIHRyYWNraW5nLlxuICAgICAgc2VsZi5fc2V0dXAoKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdGhlIGdsb2JhbCB2b2x1bWUgZm9yIGFsbCBzb3VuZHMuXG4gICAgICogQHBhcmFtICB7RmxvYXR9IHZvbCBWb2x1bWUgZnJvbSAwLjAgdG8gMS4wLlxuICAgICAqIEByZXR1cm4ge0hvd2xlci9GbG9hdH0gICAgIFJldHVybnMgc2VsZiBvciBjdXJyZW50IHZvbHVtZS5cbiAgICAgKi9cbiAgICB2b2x1bWU6IGZ1bmN0aW9uKHZvbCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcbiAgICAgIHZvbCA9IHBhcnNlRmxvYXQodm9sKTtcblxuICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBBdWRpb0NvbnRleHQgY3JlYXRlZCB5ZXQsIHJ1biB0aGUgc2V0dXAuXG4gICAgICBpZiAoIXNlbGYuY3R4KSB7XG4gICAgICAgIHNldHVwQXVkaW9Db250ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygdm9sICE9PSAndW5kZWZpbmVkJyAmJiB2b2wgPj0gMCAmJiB2b2wgPD0gMSkge1xuICAgICAgICBzZWxmLl92b2x1bWUgPSB2b2w7XG5cbiAgICAgICAgLy8gRG9uJ3QgdXBkYXRlIGFueSBvZiB0aGUgbm9kZXMgaWYgd2UgYXJlIG11dGVkLlxuICAgICAgICBpZiAoc2VsZi5fbXV0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gdXNpbmcgV2ViIEF1ZGlvLCB3ZSBqdXN0IG5lZWQgdG8gYWRqdXN0IHRoZSBtYXN0ZXIgZ2Fpbi5cbiAgICAgICAgaWYgKHNlbGYudXNpbmdXZWJBdWRpbykge1xuICAgICAgICAgIHNlbGYubWFzdGVyR2Fpbi5nYWluLnNldFZhbHVlQXRUaW1lKHZvbCwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggYW5kIGNoYW5nZSB2b2x1bWUgZm9yIGFsbCBIVE1MNSBhdWRpbyBub2Rlcy5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX2hvd2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFzZWxmLl9ob3dsc1tpXS5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAgIC8vIEdldCBhbGwgb2YgdGhlIHNvdW5kcyBpbiB0aGlzIEhvd2wgZ3JvdXAuXG4gICAgICAgICAgICB2YXIgaWRzID0gc2VsZi5faG93bHNbaV0uX2dldFNvdW5kSWRzKCk7XG5cbiAgICAgICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgc291bmRzIGFuZCBjaGFuZ2UgdGhlIHZvbHVtZXMuXG4gICAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8aWRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgIHZhciBzb3VuZCA9IHNlbGYuX2hvd2xzW2ldLl9zb3VuZEJ5SWQoaWRzW2pdKTtcblxuICAgICAgICAgICAgICBpZiAoc291bmQgJiYgc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgICAgICBzb3VuZC5fbm9kZS52b2x1bWUgPSBzb3VuZC5fdm9sdW1lICogdm9sO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmLl92b2x1bWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBtdXRpbmcgYW5kIHVubXV0aW5nIGdsb2JhbGx5LlxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW59IG11dGVkIElzIG11dGVkIG9yIG5vdC5cbiAgICAgKi9cbiAgICBtdXRlOiBmdW5jdGlvbihtdXRlZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcblxuICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBBdWRpb0NvbnRleHQgY3JlYXRlZCB5ZXQsIHJ1biB0aGUgc2V0dXAuXG4gICAgICBpZiAoIXNlbGYuY3R4KSB7XG4gICAgICAgIHNldHVwQXVkaW9Db250ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX211dGVkID0gbXV0ZWQ7XG5cbiAgICAgIC8vIFdpdGggV2ViIEF1ZGlvLCB3ZSBqdXN0IG5lZWQgdG8gbXV0ZSB0aGUgbWFzdGVyIGdhaW4uXG4gICAgICBpZiAoc2VsZi51c2luZ1dlYkF1ZGlvKSB7XG4gICAgICAgIHNlbGYubWFzdGVyR2Fpbi5nYWluLnNldFZhbHVlQXRUaW1lKG11dGVkID8gMCA6IHNlbGYuX3ZvbHVtZSwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIExvb3AgdGhyb3VnaCBhbmQgbXV0ZSBhbGwgSFRNTDUgQXVkaW8gbm9kZXMuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5faG93bHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFzZWxmLl9ob3dsc1tpXS5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAvLyBHZXQgYWxsIG9mIHRoZSBzb3VuZHMgaW4gdGhpcyBIb3dsIGdyb3VwLlxuICAgICAgICAgIHZhciBpZHMgPSBzZWxmLl9ob3dsc1tpXS5fZ2V0U291bmRJZHMoKTtcblxuICAgICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgc291bmRzIGFuZCBtYXJrIHRoZSBhdWRpbyBub2RlIGFzIG11dGVkLlxuICAgICAgICAgIGZvciAodmFyIGo9MDsgajxpZHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBzb3VuZCA9IHNlbGYuX2hvd2xzW2ldLl9zb3VuZEJ5SWQoaWRzW2pdKTtcblxuICAgICAgICAgICAgaWYgKHNvdW5kICYmIHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9ub2RlLm11dGVkID0gKG11dGVkKSA/IHRydWUgOiBzb3VuZC5fbXV0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmxvYWQgYW5kIGRlc3Ryb3kgYWxsIGN1cnJlbnRseSBsb2FkZWQgSG93bCBvYmplY3RzLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICB1bmxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcblxuICAgICAgZm9yICh2YXIgaT1zZWxmLl9ob3dscy5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XG4gICAgICAgIHNlbGYuX2hvd2xzW2ldLnVubG9hZCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYSBuZXcgQXVkaW9Db250ZXh0IHRvIG1ha2Ugc3VyZSBpdCBpcyBmdWxseSByZXNldC5cbiAgICAgIGlmIChzZWxmLnVzaW5nV2ViQXVkaW8gJiYgc2VsZi5jdHggJiYgdHlwZW9mIHNlbGYuY3R4LmNsb3NlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzZWxmLmN0eC5jbG9zZSgpO1xuICAgICAgICBzZWxmLmN0eCA9IG51bGw7XG4gICAgICAgIHNldHVwQXVkaW9Db250ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgY29kZWMgc3VwcG9ydCBvZiBzcGVjaWZpYyBleHRlbnNpb24uXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBleHQgQXVkaW8gZmlsZSBleHRlbnRpb24uXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBjb2RlY3M6IGZ1bmN0aW9uKGV4dCkge1xuICAgICAgcmV0dXJuICh0aGlzIHx8IEhvd2xlcikuX2NvZGVjc1tleHQucmVwbGFjZSgvXngtLywgJycpXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0dXAgdmFyaW91cyBzdGF0ZSB2YWx1ZXMgZm9yIGdsb2JhbCB0cmFja2luZy5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgX3NldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyB8fCBIb3dsZXI7XG5cbiAgICAgIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSBzdXNwZW5kL3Jlc3VtZSBzdGF0ZSBvZiB0aGUgQXVkaW9Db250ZXh0LlxuICAgICAgc2VsZi5zdGF0ZSA9IHNlbGYuY3R4ID8gc2VsZi5jdHguc3RhdGUgfHwgJ3N1c3BlbmRlZCcgOiAnc3VzcGVuZGVkJztcblxuICAgICAgLy8gQXV0b21hdGljYWxseSBiZWdpbiB0aGUgMzAtc2Vjb25kIHN1c3BlbmQgcHJvY2Vzc1xuICAgICAgc2VsZi5fYXV0b1N1c3BlbmQoKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgYXVkaW8gaXMgYXZhaWxhYmxlLlxuICAgICAgaWYgKCFzZWxmLnVzaW5nV2ViQXVkaW8pIHtcbiAgICAgICAgLy8gTm8gYXVkaW8gaXMgYXZhaWxhYmxlIG9uIHRoaXMgc3lzdGVtIGlmIG5vQXVkaW8gaXMgc2V0IHRvIHRydWUuXG4gICAgICAgIGlmICh0eXBlb2YgQXVkaW8gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB0ZXN0ID0gbmV3IEF1ZGlvKCk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBjYW5wbGF5dGhyb3VnaCBldmVudCBpcyBhdmFpbGFibGUuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlc3Qub25jYW5wbGF5dGhyb3VnaCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgc2VsZi5fY2FuUGxheUV2ZW50ID0gJ2NhbnBsYXknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgc2VsZi5ub0F1ZGlvID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5ub0F1ZGlvID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUZXN0IHRvIG1ha2Ugc3VyZSBhdWRpbyBpc24ndCBkaXNhYmxlZCBpbiBJbnRlcm5ldCBFeHBsb3Jlci5cbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciB0ZXN0ID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgIGlmICh0ZXN0Lm11dGVkKSB7XG4gICAgICAgICAgc2VsZi5ub0F1ZGlvID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgLy8gQ2hlY2sgZm9yIHN1cHBvcnRlZCBjb2RlY3MuXG4gICAgICBpZiAoIXNlbGYubm9BdWRpbykge1xuICAgICAgICBzZWxmLl9zZXR1cENvZGVjcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgZm9yIGJyb3dzZXIgc3VwcG9ydCBmb3IgdmFyaW91cyBjb2RlY3MgYW5kIGNhY2hlIHRoZSByZXN1bHRzLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfc2V0dXBDb2RlY3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcbiAgICAgIHZhciBhdWRpb1Rlc3QgPSBudWxsO1xuXG4gICAgICAvLyBNdXN0IHdyYXAgaW4gYSB0cnkvY2F0Y2ggYmVjYXVzZSBJRTExIGluIHNlcnZlciBtb2RlIHRocm93cyBhbiBlcnJvci5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1ZGlvVGVzdCA9ICh0eXBlb2YgQXVkaW8gIT09ICd1bmRlZmluZWQnKSA/IG5ldyBBdWRpbygpIDogbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFhdWRpb1Rlc3QgfHwgdHlwZW9mIGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgdmFyIG1wZWdUZXN0ID0gYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9tcGVnOycpLnJlcGxhY2UoL15ubyQvLCAnJyk7XG5cbiAgICAgIC8vIE9wZXJhIHZlcnNpb24gPDMzIGhhcyBtaXhlZCBNUDMgc3VwcG9ydCwgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgYW5kIGJsb2NrIGl0LlxuICAgICAgdmFyIGNoZWNrT3BlcmEgPSBzZWxmLl9uYXZpZ2F0b3IgJiYgc2VsZi5fbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvT1BSXFwvKFswLTZdLikvZyk7XG4gICAgICB2YXIgaXNPbGRPcGVyYSA9IChjaGVja09wZXJhICYmIHBhcnNlSW50KGNoZWNrT3BlcmFbMF0uc3BsaXQoJy8nKVsxXSwgMTApIDwgMzMpO1xuXG4gICAgICBzZWxmLl9jb2RlY3MgPSB7XG4gICAgICAgIG1wMzogISEoIWlzT2xkT3BlcmEgJiYgKG1wZWdUZXN0IHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vbXAzOycpLnJlcGxhY2UoL15ubyQvLCAnJykpKSxcbiAgICAgICAgbXBlZzogISFtcGVnVGVzdCxcbiAgICAgICAgb3B1czogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL29nZzsgY29kZWNzPVwib3B1c1wiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgb2dnOiAhIWF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vb2dnOyBjb2RlY3M9XCJ2b3JiaXNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIG9nYTogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL29nZzsgY29kZWNzPVwidm9yYmlzXCInKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICB3YXY6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby93YXY7IGNvZGVjcz1cIjFcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIGFhYzogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL2FhYzsnKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICBjYWY6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby94LWNhZjsnKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICBtNGE6ICEhKGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8veC1tNGE7JykgfHwgYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9tNGE7JykgfHwgYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9hYWM7JykpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIG1wNDogISEoYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby94LW1wNDsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL21wNDsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL2FhYzsnKSkucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgd2ViYTogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3dlYm07IGNvZGVjcz1cInZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgd2VibTogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3dlYm07IGNvZGVjcz1cInZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgZG9sYnk6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9tcDQ7IGNvZGVjcz1cImVjLTNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIGZsYWM6ICEhKGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8veC1mbGFjOycpIHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vZmxhYzsnKSkucmVwbGFjZSgvXm5vJC8sICcnKVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNvbWUgYnJvd3NlcnMvZGV2aWNlcyB3aWxsIG9ubHkgYWxsb3cgYXVkaW8gdG8gYmUgcGxheWVkIGFmdGVyIGEgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAgKiBBdHRlbXB0IHRvIGF1dG9tYXRpY2FsbHkgdW5sb2NrIGF1ZGlvIG9uIHRoZSBmaXJzdCB1c2VyIGludGVyYWN0aW9uLlxuICAgICAqIENvbmNlcHQgZnJvbTogaHR0cDovL3BhdWxiYWthdXMuY29tL3R1dG9yaWFscy9odG1sNS93ZWItYXVkaW8tb24taW9zL1xuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfdW5sb2NrQXVkaW86IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcblxuICAgICAgLy8gT25seSBydW4gdGhpcyBpZiBXZWIgQXVkaW8gaXMgc3VwcG9ydGVkIGFuZCBpdCBoYXNuJ3QgYWxyZWFkeSBiZWVuIHVubG9ja2VkLlxuICAgICAgaWYgKHNlbGYuX2F1ZGlvVW5sb2NrZWQgfHwgIXNlbGYuY3R4KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fYXVkaW9VbmxvY2tlZCA9IGZhbHNlO1xuICAgICAgc2VsZi5hdXRvVW5sb2NrID0gZmFsc2U7XG5cbiAgICAgIC8vIFNvbWUgbW9iaWxlIGRldmljZXMvcGxhdGZvcm1zIGhhdmUgZGlzdG9ydGlvbiBpc3N1ZXMgd2hlbiBvcGVuaW5nL2Nsb3NpbmcgdGFicyBhbmQvb3Igd2ViIHZpZXdzLlxuICAgICAgLy8gQnVncyBpbiB0aGUgYnJvd3NlciAoZXNwZWNpYWxseSBNb2JpbGUgU2FmYXJpKSBjYW4gY2F1c2UgdGhlIHNhbXBsZVJhdGUgdG8gY2hhbmdlIGZyb20gNDQxMDAgdG8gNDgwMDAuXG4gICAgICAvLyBCeSBjYWxsaW5nIEhvd2xlci51bmxvYWQoKSwgd2UgY3JlYXRlIGEgbmV3IEF1ZGlvQ29udGV4dCB3aXRoIHRoZSBjb3JyZWN0IHNhbXBsZVJhdGUuXG4gICAgICBpZiAoIXNlbGYuX21vYmlsZVVubG9hZGVkICYmIHNlbGYuY3R4LnNhbXBsZVJhdGUgIT09IDQ0MTAwKSB7XG4gICAgICAgIHNlbGYuX21vYmlsZVVubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi51bmxvYWQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2NyYXRjaCBidWZmZXIgZm9yIGVuYWJsaW5nIGlPUyB0byBkaXNwb3NlIG9mIHdlYiBhdWRpbyBidWZmZXJzIGNvcnJlY3RseSwgYXMgcGVyOlxuICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNDExOTY4NFxuICAgICAgc2VsZi5fc2NyYXRjaEJ1ZmZlciA9IHNlbGYuY3R4LmNyZWF0ZUJ1ZmZlcigxLCAxLCAyMjA1MCk7XG5cbiAgICAgIC8vIENhbGwgdGhpcyBtZXRob2Qgb24gdG91Y2ggc3RhcnQgdG8gY3JlYXRlIGFuZCBwbGF5IGEgYnVmZmVyLFxuICAgICAgLy8gdGhlbiBjaGVjayBpZiB0aGUgYXVkaW8gYWN0dWFsbHkgcGxheWVkIHRvIGRldGVybWluZSBpZlxuICAgICAgLy8gYXVkaW8gaGFzIG5vdyBiZWVuIHVubG9ja2VkIG9uIGlPUywgQW5kcm9pZCwgZXRjLlxuICAgICAgdmFyIHVubG9jayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgcG9vbCBvZiB1bmxvY2tlZCBIVE1MNSBBdWRpbyBvYmplY3RzIHRoYXQgY2FuXG4gICAgICAgIC8vIGJlIHVzZWQgZm9yIHBsYXlpbmcgc291bmRzIHdpdGhvdXQgdXNlciBpbnRlcmFjdGlvbi4gSFRNTDVcbiAgICAgICAgLy8gQXVkaW8gb2JqZWN0cyBtdXN0IGJlIGluZGl2aWR1YWxseSB1bmxvY2tlZCwgYXMgb3Bwb3NlZFxuICAgICAgICAvLyB0byB0aGUgV2ViQXVkaW8gQVBJIHdoaWNoIG9ubHkgbmVlZHMgYSBzaW5nbGUgYWN0aXZhdGlvbi5cbiAgICAgICAgLy8gVGhpcyBtdXN0IG9jY3VyIGJlZm9yZSBXZWJBdWRpbyBzZXR1cCBvciB0aGUgc291cmNlLm9uZW5kZWRcbiAgICAgICAgLy8gZXZlbnQgd2lsbCBub3QgZmlyZS5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuaHRtbDVQb29sU2l6ZTsgaSsrKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBhdWRpb05vZGUgPSBuZXcgQXVkaW8oKTtcblxuICAgICAgICAgICAgLy8gTWFyayB0aGlzIEF1ZGlvIG9iamVjdCBhcyB1bmxvY2tlZCB0byBlbnN1cmUgaXQgY2FuIGdldCByZXR1cm5lZFxuICAgICAgICAgICAgLy8gdG8gdGhlIHVubG9ja2VkIHBvb2wgd2hlbiByZWxlYXNlZC5cbiAgICAgICAgICAgIGF1ZGlvTm9kZS5fdW5sb2NrZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIGF1ZGlvIG5vZGUgdG8gdGhlIHBvb2wuXG4gICAgICAgICAgICBzZWxmLl9yZWxlYXNlSHRtbDVBdWRpbyhhdWRpb05vZGUpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHNlbGYubm9BdWRpbyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFueSBhc3NpZ25lZCBhdWRpbyBub2RlcyBhbmQgdW5sb2NrIHRoZW0uXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9ob3dscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICghc2VsZi5faG93bHNbaV0uX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgICAvLyBHZXQgYWxsIG9mIHRoZSBzb3VuZHMgaW4gdGhpcyBIb3dsIGdyb3VwLlxuICAgICAgICAgICAgdmFyIGlkcyA9IHNlbGYuX2hvd2xzW2ldLl9nZXRTb3VuZElkcygpO1xuXG4gICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHNvdW5kcyBhbmQgdW5sb2NrIHRoZSBhdWRpbyBub2Rlcy5cbiAgICAgICAgICAgIGZvciAodmFyIGo9MDsgajxpZHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgdmFyIHNvdW5kID0gc2VsZi5faG93bHNbaV0uX3NvdW5kQnlJZChpZHNbal0pO1xuXG4gICAgICAgICAgICAgIGlmIChzb3VuZCAmJiBzb3VuZC5fbm9kZSAmJiAhc291bmQuX25vZGUuX3VubG9ja2VkKSB7XG4gICAgICAgICAgICAgICAgc291bmQuX25vZGUuX3VubG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5sb2FkKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaXggQW5kcm9pZCBjYW4gbm90IHBsYXkgaW4gc3VzcGVuZCBzdGF0ZS5cbiAgICAgICAgc2VsZi5fYXV0b1Jlc3VtZSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBlbXB0eSBidWZmZXIuXG4gICAgICAgIHZhciBzb3VyY2UgPSBzZWxmLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgc291cmNlLmJ1ZmZlciA9IHNlbGYuX3NjcmF0Y2hCdWZmZXI7XG4gICAgICAgIHNvdXJjZS5jb25uZWN0KHNlbGYuY3R4LmRlc3RpbmF0aW9uKTtcblxuICAgICAgICAvLyBQbGF5IHRoZSBlbXB0eSBidWZmZXIuXG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHNvdXJjZS5ub3RlT24oMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc291cmNlLnN0YXJ0KDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGluZyByZXN1bWUoKSBvbiBhIHN0YWNrIGluaXRpYXRlZCBieSB1c2VyIGdlc3R1cmUgaXMgd2hhdCBhY3R1YWxseSB1bmxvY2tzIHRoZSBhdWRpbyBvbiBBbmRyb2lkIENocm9tZSA+PSA1NS5cbiAgICAgICAgaWYgKHR5cGVvZiBzZWxmLmN0eC5yZXN1bWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBzZWxmLmN0eC5yZXN1bWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldHVwIGEgdGltZW91dCB0byBjaGVjayB0aGF0IHdlIGFyZSB1bmxvY2tlZCBvbiB0aGUgbmV4dCBldmVudCBsb29wLlxuICAgICAgICBzb3VyY2Uub25lbmRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNvdXJjZS5kaXNjb25uZWN0KDApO1xuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSB1bmxvY2tlZCBzdGF0ZSBhbmQgcHJldmVudCB0aGlzIGNoZWNrIGZyb20gaGFwcGVuaW5nIGFnYWluLlxuICAgICAgICAgIHNlbGYuX2F1ZGlvVW5sb2NrZWQgPSB0cnVlO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSB0b3VjaCBzdGFydCBsaXN0ZW5lci5cbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdW5sb2NrLCB0cnVlKTtcbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHVubG9jaywgdHJ1ZSk7XG4gICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB1bmxvY2ssIHRydWUpO1xuXG4gICAgICAgICAgLy8gTGV0IGFsbCBzb3VuZHMga25vdyB0aGF0IGF1ZGlvIGhhcyBiZWVuIHVubG9ja2VkLlxuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9ob3dscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5faG93bHNbaV0uX2VtaXQoJ3VubG9jaycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGEgdG91Y2ggc3RhcnQgbGlzdGVuZXIgdG8gYXR0ZW1wdCBhbiB1bmxvY2sgaW4uXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdW5sb2NrLCB0cnVlKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdW5sb2NrLCB0cnVlKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdW5sb2NrLCB0cnVlKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhbiB1bmxvY2tlZCBIVE1MNSBBdWRpbyBvYmplY3QgZnJvbSB0aGUgcG9vbC4gSWYgbm9uZSBhcmUgbGVmdCxcbiAgICAgKiByZXR1cm4gYSBuZXcgQXVkaW8gb2JqZWN0IGFuZCB0aHJvdyBhIHdhcm5pbmcuXG4gICAgICogQHJldHVybiB7QXVkaW99IEhUTUw1IEF1ZGlvIG9iamVjdC5cbiAgICAgKi9cbiAgICBfb2J0YWluSHRtbDVBdWRpbzogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMgfHwgSG93bGVyO1xuXG4gICAgICAvLyBSZXR1cm4gdGhlIG5leHQgb2JqZWN0IGZyb20gdGhlIHBvb2wgaWYgb25lIGV4aXN0cy5cbiAgICAgIGlmIChzZWxmLl9odG1sNUF1ZGlvUG9vbC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX2h0bWw1QXVkaW9Qb29sLnBvcCgpO1xuICAgICAgfVxuXG4gICAgICAvLy5DaGVjayBpZiB0aGUgYXVkaW8gaXMgbG9ja2VkIGFuZCB0aHJvdyBhIHdhcm5pbmcuXG4gICAgICB2YXIgdGVzdFBsYXkgPSBuZXcgQXVkaW8oKS5wbGF5KCk7XG4gICAgICBpZiAodGVzdFBsYXkgJiYgdHlwZW9mIFByb21pc2UgIT09ICd1bmRlZmluZWQnICYmICh0ZXN0UGxheSBpbnN0YW5jZW9mIFByb21pc2UgfHwgdHlwZW9mIHRlc3RQbGF5LnRoZW4gPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgIHRlc3RQbGF5LmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybignSFRNTDUgQXVkaW8gcG9vbCBleGhhdXN0ZWQsIHJldHVybmluZyBwb3RlbnRpYWxseSBsb2NrZWQgYXVkaW8gb2JqZWN0LicpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBBdWRpbygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYW4gYWN0aXZhdGVkIEhUTUw1IEF1ZGlvIG9iamVjdCB0byB0aGUgcG9vbC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgX3JlbGVhc2VIdG1sNUF1ZGlvOiBmdW5jdGlvbihhdWRpbykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcblxuICAgICAgLy8gRG9uJ3QgYWRkIGF1ZGlvIHRvIHRoZSBwb29sIGlmIHdlIGRvbid0IGtub3cgaWYgaXQgaGFzIGJlZW4gdW5sb2NrZWQuXG4gICAgICBpZiAoYXVkaW8uX3VubG9ja2VkKSB7XG4gICAgICAgIHNlbGYuX2h0bWw1QXVkaW9Qb29sLnB1c2goYXVkaW8pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXV0b21hdGljYWxseSBzdXNwZW5kIHRoZSBXZWIgQXVkaW8gQXVkaW9Db250ZXh0IGFmdGVyIG5vIHNvdW5kIGhhcyBwbGF5ZWQgZm9yIDMwIHNlY29uZHMuXG4gICAgICogVGhpcyBzYXZlcyBwcm9jZXNzaW5nL2VuZXJneSBhbmQgZml4ZXMgdmFyaW91cyBicm93c2VyLXNwZWNpZmljIGJ1Z3Mgd2l0aCBhdWRpbyBnZXR0aW5nIHN0dWNrLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfYXV0b1N1c3BlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoIXNlbGYuYXV0b1N1c3BlbmQgfHwgIXNlbGYuY3R4IHx8IHR5cGVvZiBzZWxmLmN0eC5zdXNwZW5kID09PSAndW5kZWZpbmVkJyB8fCAhSG93bGVyLnVzaW5nV2ViQXVkaW8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiBhbnkgc291bmRzIGFyZSBwbGF5aW5nLlxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX2hvd2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9ob3dsc1tpXS5fd2ViQXVkaW8pIHtcbiAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8c2VsZi5faG93bHNbaV0uX3NvdW5kcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKCFzZWxmLl9ob3dsc1tpXS5fc291bmRzW2pdLl9wYXVzZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLl9zdXNwZW5kVGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3N1c3BlbmRUaW1lcik7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIHNvdW5kIGhhcyBwbGF5ZWQgYWZ0ZXIgMzAgc2Vjb25kcywgc3VzcGVuZCB0aGUgY29udGV4dC5cbiAgICAgIHNlbGYuX3N1c3BlbmRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghc2VsZi5hdXRvU3VzcGVuZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuX3N1c3BlbmRUaW1lciA9IG51bGw7XG4gICAgICAgIHNlbGYuc3RhdGUgPSAnc3VzcGVuZGluZyc7XG4gICAgICAgIHNlbGYuY3R4LnN1c3BlbmQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc3RhdGUgPSAnc3VzcGVuZGVkJztcblxuICAgICAgICAgIGlmIChzZWxmLl9yZXN1bWVBZnRlclN1c3BlbmQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzZWxmLl9yZXN1bWVBZnRlclN1c3BlbmQ7XG4gICAgICAgICAgICBzZWxmLl9hdXRvUmVzdW1lKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMDAwKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF1dG9tYXRpY2FsbHkgcmVzdW1lIHRoZSBXZWIgQXVkaW8gQXVkaW9Db250ZXh0IHdoZW4gYSBuZXcgc291bmQgaXMgcGxheWVkLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfYXV0b1Jlc3VtZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmICghc2VsZi5jdHggfHwgdHlwZW9mIHNlbGYuY3R4LnJlc3VtZSA9PT0gJ3VuZGVmaW5lZCcgfHwgIUhvd2xlci51c2luZ1dlYkF1ZGlvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYuc3RhdGUgPT09ICdydW5uaW5nJyAmJiBzZWxmLl9zdXNwZW5kVGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3N1c3BlbmRUaW1lcik7XG4gICAgICAgIHNlbGYuX3N1c3BlbmRUaW1lciA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHNlbGYuc3RhdGUgPT09ICdzdXNwZW5kZWQnKSB7XG4gICAgICAgIHNlbGYuY3R4LnJlc3VtZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5zdGF0ZSA9ICdydW5uaW5nJztcblxuICAgICAgICAgIC8vIEVtaXQgdG8gYWxsIEhvd2xzIHRoYXQgdGhlIGF1ZGlvIGhhcyByZXN1bWVkLlxuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9ob3dscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5faG93bHNbaV0uX2VtaXQoJ3Jlc3VtZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuX3N1c3BlbmRUaW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLl9zdXNwZW5kVGltZXIpO1xuICAgICAgICAgIHNlbGYuX3N1c3BlbmRUaW1lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc2VsZi5zdGF0ZSA9PT0gJ3N1c3BlbmRpbmcnKSB7XG4gICAgICAgIHNlbGYuX3Jlc3VtZUFmdGVyU3VzcGVuZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cbiAgfTtcblxuICAvLyBTZXR1cCB0aGUgZ2xvYmFsIGF1ZGlvIGNvbnRyb2xsZXIuXG4gIHZhciBIb3dsZXIgPSBuZXcgSG93bGVyR2xvYmFsKCk7XG5cbiAgLyoqIEdyb3VwIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBhdWRpbyBncm91cCBjb250cm9sbGVyLlxuICAgKiBAcGFyYW0ge09iamVjdH0gbyBQYXNzZWQgaW4gcHJvcGVydGllcyBmb3IgdGhpcyBncm91cC5cbiAgICovXG4gIHZhciBIb3dsID0gZnVuY3Rpb24obykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIFRocm93IGFuIGVycm9yIGlmIG5vIHNvdXJjZSBpcyBwcm92aWRlZC5cbiAgICBpZiAoIW8uc3JjIHx8IG8uc3JjLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS5lcnJvcignQW4gYXJyYXkgb2Ygc291cmNlIGZpbGVzIG11c3QgYmUgcGFzc2VkIHdpdGggYW55IG5ldyBIb3dsLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuaW5pdChvKTtcbiAgfTtcbiAgSG93bC5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhIG5ldyBIb3dsIGdyb3VwIG9iamVjdC5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG8gUGFzc2VkIGluIHByb3BlcnRpZXMgZm9yIHRoaXMgZ3JvdXAuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYW4gQXVkaW9Db250ZXh0IGNyZWF0ZWQgeWV0LCBydW4gdGhlIHNldHVwLlxuICAgICAgaWYgKCFIb3dsZXIuY3R4KSB7XG4gICAgICAgIHNldHVwQXVkaW9Db250ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldHVwIHVzZXItZGVmaW5lZCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gICAgICBzZWxmLl9hdXRvcGxheSA9IG8uYXV0b3BsYXkgfHwgZmFsc2U7XG4gICAgICBzZWxmLl9mb3JtYXQgPSAodHlwZW9mIG8uZm9ybWF0ICE9PSAnc3RyaW5nJykgPyBvLmZvcm1hdCA6IFtvLmZvcm1hdF07XG4gICAgICBzZWxmLl9odG1sNSA9IG8uaHRtbDUgfHwgZmFsc2U7XG4gICAgICBzZWxmLl9tdXRlZCA9IG8ubXV0ZSB8fCBmYWxzZTtcbiAgICAgIHNlbGYuX2xvb3AgPSBvLmxvb3AgfHwgZmFsc2U7XG4gICAgICBzZWxmLl9wb29sID0gby5wb29sIHx8IDU7XG4gICAgICBzZWxmLl9wcmVsb2FkID0gKHR5cGVvZiBvLnByZWxvYWQgPT09ICdib29sZWFuJykgPyBvLnByZWxvYWQgOiB0cnVlO1xuICAgICAgc2VsZi5fcmF0ZSA9IG8ucmF0ZSB8fCAxO1xuICAgICAgc2VsZi5fc3ByaXRlID0gby5zcHJpdGUgfHwge307XG4gICAgICBzZWxmLl9zcmMgPSAodHlwZW9mIG8uc3JjICE9PSAnc3RyaW5nJykgPyBvLnNyYyA6IFtvLnNyY107XG4gICAgICBzZWxmLl92b2x1bWUgPSBvLnZvbHVtZSAhPT0gdW5kZWZpbmVkID8gby52b2x1bWUgOiAxO1xuICAgICAgc2VsZi5feGhyV2l0aENyZWRlbnRpYWxzID0gby54aHJXaXRoQ3JlZGVudGlhbHMgfHwgZmFsc2U7XG5cbiAgICAgIC8vIFNldHVwIGFsbCBvdGhlciBkZWZhdWx0IHByb3BlcnRpZXMuXG4gICAgICBzZWxmLl9kdXJhdGlvbiA9IDA7XG4gICAgICBzZWxmLl9zdGF0ZSA9ICd1bmxvYWRlZCc7XG4gICAgICBzZWxmLl9zb3VuZHMgPSBbXTtcbiAgICAgIHNlbGYuX2VuZFRpbWVycyA9IHt9O1xuICAgICAgc2VsZi5fcXVldWUgPSBbXTtcbiAgICAgIHNlbGYuX3BsYXlMb2NrID0gZmFsc2U7XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgIHNlbGYuX29uZW5kID0gby5vbmVuZCA/IFt7Zm46IG8ub25lbmR9XSA6IFtdO1xuICAgICAgc2VsZi5fb25mYWRlID0gby5vbmZhZGUgPyBbe2ZuOiBvLm9uZmFkZX1dIDogW107XG4gICAgICBzZWxmLl9vbmxvYWQgPSBvLm9ubG9hZCA/IFt7Zm46IG8ub25sb2FkfV0gOiBbXTtcbiAgICAgIHNlbGYuX29ubG9hZGVycm9yID0gby5vbmxvYWRlcnJvciA/IFt7Zm46IG8ub25sb2FkZXJyb3J9XSA6IFtdO1xuICAgICAgc2VsZi5fb25wbGF5ZXJyb3IgPSBvLm9ucGxheWVycm9yID8gW3tmbjogby5vbnBsYXllcnJvcn1dIDogW107XG4gICAgICBzZWxmLl9vbnBhdXNlID0gby5vbnBhdXNlID8gW3tmbjogby5vbnBhdXNlfV0gOiBbXTtcbiAgICAgIHNlbGYuX29ucGxheSA9IG8ub25wbGF5ID8gW3tmbjogby5vbnBsYXl9XSA6IFtdO1xuICAgICAgc2VsZi5fb25zdG9wID0gby5vbnN0b3AgPyBbe2ZuOiBvLm9uc3RvcH1dIDogW107XG4gICAgICBzZWxmLl9vbm11dGUgPSBvLm9ubXV0ZSA/IFt7Zm46IG8ub25tdXRlfV0gOiBbXTtcbiAgICAgIHNlbGYuX29udm9sdW1lID0gby5vbnZvbHVtZSA/IFt7Zm46IG8ub252b2x1bWV9XSA6IFtdO1xuICAgICAgc2VsZi5fb25yYXRlID0gby5vbnJhdGUgPyBbe2ZuOiBvLm9ucmF0ZX1dIDogW107XG4gICAgICBzZWxmLl9vbnNlZWsgPSBvLm9uc2VlayA/IFt7Zm46IG8ub25zZWVrfV0gOiBbXTtcbiAgICAgIHNlbGYuX29udW5sb2NrID0gby5vbnVubG9jayA/IFt7Zm46IG8ub251bmxvY2t9XSA6IFtdO1xuICAgICAgc2VsZi5fb25yZXN1bWUgPSBbXTtcblxuICAgICAgLy8gV2ViIEF1ZGlvIG9yIEhUTUw1IEF1ZGlvP1xuICAgICAgc2VsZi5fd2ViQXVkaW8gPSBIb3dsZXIudXNpbmdXZWJBdWRpbyAmJiAhc2VsZi5faHRtbDU7XG5cbiAgICAgIC8vIEF1dG9tYXRpY2FsbHkgdHJ5IHRvIGVuYWJsZSBhdWRpby5cbiAgICAgIGlmICh0eXBlb2YgSG93bGVyLmN0eCAhPT0gJ3VuZGVmaW5lZCcgJiYgSG93bGVyLmN0eCAmJiBIb3dsZXIuYXV0b1VubG9jaykge1xuICAgICAgICBIb3dsZXIuX3VubG9ja0F1ZGlvKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhpcyBIb3dsIGdyb3VwIGluIHRoZSBnbG9iYWwgY29udHJvbGxlci5cbiAgICAgIEhvd2xlci5faG93bHMucHVzaChzZWxmKTtcblxuICAgICAgLy8gSWYgdGhleSBzZWxlY3RlZCBhdXRvcGxheSwgYWRkIGEgcGxheSBldmVudCB0byB0aGUgbG9hZCBxdWV1ZS5cbiAgICAgIGlmIChzZWxmLl9hdXRvcGxheSkge1xuICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICBldmVudDogJ3BsYXknLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnBsYXkoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBMb2FkIHRoZSBzb3VyY2UgZmlsZSB1bmxlc3Mgb3RoZXJ3aXNlIHNwZWNpZmllZC5cbiAgICAgIGlmIChzZWxmLl9wcmVsb2FkKSB7XG4gICAgICAgIHNlbGYubG9hZCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgYXVkaW8gZmlsZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgdXJsID0gbnVsbDtcblxuICAgICAgLy8gSWYgbm8gYXVkaW8gaXMgYXZhaWxhYmxlLCBxdWl0IGltbWVkaWF0ZWx5LlxuICAgICAgaWYgKEhvd2xlci5ub0F1ZGlvKSB7XG4gICAgICAgIHNlbGYuX2VtaXQoJ2xvYWRlcnJvcicsIG51bGwsICdObyBhdWRpbyBzdXBwb3J0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBvdXIgc291cmNlIGlzIGluIGFuIGFycmF5LlxuICAgICAgaWYgKHR5cGVvZiBzZWxmLl9zcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNlbGYuX3NyYyA9IFtzZWxmLl9zcmNdO1xuICAgICAgfVxuXG4gICAgICAvLyBMb29wIHRocm91Z2ggdGhlIHNvdXJjZXMgYW5kIHBpY2sgdGhlIGZpcnN0IG9uZSB0aGF0IGlzIGNvbXBhdGlibGUuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc3JjLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBleHQsIHN0cjtcblxuICAgICAgICBpZiAoc2VsZi5fZm9ybWF0ICYmIHNlbGYuX2Zvcm1hdFtpXSkge1xuICAgICAgICAgIC8vIElmIGFuIGV4dGVuc2lvbiB3YXMgc3BlY2lmaWVkLCB1c2UgdGhhdCBpbnN0ZWFkLlxuICAgICAgICAgIGV4dCA9IHNlbGYuX2Zvcm1hdFtpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNvdXJjZSBpcyBhIHN0cmluZy5cbiAgICAgICAgICBzdHIgPSBzZWxmLl9zcmNbaV07XG4gICAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzZWxmLl9lbWl0KCdsb2FkZXJyb3InLCBudWxsLCAnTm9uLXN0cmluZyBmb3VuZCBpbiBzZWxlY3RlZCBhdWRpbyBzb3VyY2VzIC0gaWdub3JpbmcuJyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBFeHRyYWN0IHRoZSBmaWxlIGV4dGVuc2lvbiBmcm9tIHRoZSBVUkwgb3IgYmFzZTY0IGRhdGEgVVJJLlxuICAgICAgICAgIGV4dCA9IC9eZGF0YTphdWRpb1xcLyhbXjssXSspOy9pLmV4ZWMoc3RyKTtcbiAgICAgICAgICBpZiAoIWV4dCkge1xuICAgICAgICAgICAgZXh0ID0gL1xcLihbXi5dKykkLy5leGVjKHN0ci5zcGxpdCgnPycsIDEpWzBdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZXh0KSB7XG4gICAgICAgICAgICBleHQgPSBleHRbMV0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2cgYSB3YXJuaW5nIGlmIG5vIGV4dGVuc2lvbiB3YXMgZm91bmQuXG4gICAgICAgIGlmICghZXh0KSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdObyBmaWxlIGV4dGVuc2lvbiB3YXMgZm91bmQuIENvbnNpZGVyIHVzaW5nIHRoZSBcImZvcm1hdFwiIHByb3BlcnR5IG9yIHNwZWNpZnkgYW4gZXh0ZW5zaW9uLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBleHRlbnNpb24gaXMgYXZhaWxhYmxlLlxuICAgICAgICBpZiAoZXh0ICYmIEhvd2xlci5jb2RlY3MoZXh0KSkge1xuICAgICAgICAgIHVybCA9IHNlbGYuX3NyY1tpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXVybCkge1xuICAgICAgICBzZWxmLl9lbWl0KCdsb2FkZXJyb3InLCBudWxsLCAnTm8gY29kZWMgc3VwcG9ydCBmb3Igc2VsZWN0ZWQgYXVkaW8gc291cmNlcy4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9zcmMgPSB1cmw7XG4gICAgICBzZWxmLl9zdGF0ZSA9ICdsb2FkaW5nJztcblxuICAgICAgLy8gSWYgdGhlIGhvc3RpbmcgcGFnZSBpcyBIVFRQUyBhbmQgdGhlIHNvdXJjZSBpc24ndCxcbiAgICAgIC8vIGRyb3AgZG93biB0byBIVE1MNSBBdWRpbyB0byBhdm9pZCBNaXhlZCBDb250ZW50IGVycm9ycy5cbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonICYmIHVybC5zbGljZSgwLCA1KSA9PT0gJ2h0dHA6Jykge1xuICAgICAgICBzZWxmLl9odG1sNSA9IHRydWU7XG4gICAgICAgIHNlbGYuX3dlYkF1ZGlvID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBzb3VuZCBvYmplY3QgYW5kIGFkZCBpdCB0byB0aGUgcG9vbC5cbiAgICAgIG5ldyBTb3VuZChzZWxmKTtcblxuICAgICAgLy8gTG9hZCBhbmQgZGVjb2RlIHRoZSBhdWRpbyBkYXRhIGZvciBwbGF5YmFjay5cbiAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICBsb2FkQnVmZmVyKHNlbGYpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGxheSBhIHNvdW5kIG9yIHJlc3VtZSBwcmV2aW91cyBwbGF5YmFjay5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmcvTnVtYmVyfSBzcHJpdGUgICBTcHJpdGUgbmFtZSBmb3Igc3ByaXRlIHBsYXliYWNrIG9yIHNvdW5kIGlkIHRvIGNvbnRpbnVlIHByZXZpb3VzLlxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW59IGludGVybmFsIEludGVybmFsIFVzZTogdHJ1ZSBwcmV2ZW50cyBldmVudCBmaXJpbmcuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICBTb3VuZCBJRC5cbiAgICAgKi9cbiAgICBwbGF5OiBmdW5jdGlvbihzcHJpdGUsIGludGVybmFsKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgaWQgPSBudWxsO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgYSBzcHJpdGUsIHNvdW5kIGlkIG9yIG5vdGhpbmcgd2FzIHBhc3NlZFxuICAgICAgaWYgKHR5cGVvZiBzcHJpdGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlkID0gc3ByaXRlO1xuICAgICAgICBzcHJpdGUgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3ByaXRlID09PSAnc3RyaW5nJyAmJiBzZWxmLl9zdGF0ZSA9PT0gJ2xvYWRlZCcgJiYgIXNlbGYuX3Nwcml0ZVtzcHJpdGVdKSB7XG4gICAgICAgIC8vIElmIHRoZSBwYXNzZWQgc3ByaXRlIGRvZXNuJ3QgZXhpc3QsIGRvIG5vdGhpbmcuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3ByaXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyBVc2UgdGhlIGRlZmF1bHQgc291bmQgc3ByaXRlIChwbGF5cyB0aGUgZnVsbCBhdWRpbyBsZW5ndGgpLlxuICAgICAgICBzcHJpdGUgPSAnX19kZWZhdWx0JztcblxuICAgICAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHNpbmdsZSBwYXVzZWQgc291bmQgdGhhdCBpc24ndCBlbmRlZC4gXG4gICAgICAgIC8vIElmIHRoZXJlIGlzLCBwbGF5IHRoYXQgc291bmQuIElmIG5vdCwgY29udGludWUgYXMgdXN1YWwuICBcbiAgICAgICAgaWYgKCFzZWxmLl9wbGF5TG9jaykge1xuICAgICAgICAgIHZhciBudW0gPSAwO1xuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9zb3VuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9zb3VuZHNbaV0uX3BhdXNlZCAmJiAhc2VsZi5fc291bmRzW2ldLl9lbmRlZCkge1xuICAgICAgICAgICAgICBudW0rKztcbiAgICAgICAgICAgICAgaWQgPSBzZWxmLl9zb3VuZHNbaV0uX2lkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChudW0gPT09IDEpIHtcbiAgICAgICAgICAgIHNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlkID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gR2V0IHRoZSBzZWxlY3RlZCBub2RlLCBvciBnZXQgb25lIGZyb20gdGhlIHBvb2wuXG4gICAgICB2YXIgc291bmQgPSBpZCA/IHNlbGYuX3NvdW5kQnlJZChpZCkgOiBzZWxmLl9pbmFjdGl2ZVNvdW5kKCk7XG5cbiAgICAgIC8vIElmIHRoZSBzb3VuZCBkb2Vzbid0IGV4aXN0LCBkbyBub3RoaW5nLlxuICAgICAgaWYgKCFzb3VuZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gU2VsZWN0IHRoZSBzcHJpdGUgZGVmaW5pdGlvbi5cbiAgICAgIGlmIChpZCAmJiAhc3ByaXRlKSB7XG4gICAgICAgIHNwcml0ZSA9IHNvdW5kLl9zcHJpdGUgfHwgJ19fZGVmYXVsdCc7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCB3ZSBtdXN0IHdhaXQgdG8gZ2V0IHRoZSBhdWRpbydzIGR1cmF0aW9uLlxuICAgICAgLy8gV2UgYWxzbyBuZWVkIHRvIHdhaXQgdG8gbWFrZSBzdXJlIHdlIGRvbid0IHJ1biBpbnRvIHJhY2UgY29uZGl0aW9ucyB3aXRoXG4gICAgICAvLyB0aGUgb3JkZXIgb2YgZnVuY3Rpb24gY2FsbHMuXG4gICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICAgIC8vIFNldCB0aGUgc3ByaXRlIHZhbHVlIG9uIHRoaXMgc291bmQuXG4gICAgICAgIHNvdW5kLl9zcHJpdGUgPSBzcHJpdGU7XG5cbiAgICAgICAgLy8gTWFyayB0aGlzIHNvdW5kIGFzIG5vdCBlbmRlZCBpbiBjYXNlIGFub3RoZXIgc291bmQgaXMgcGxheWVkIGJlZm9yZSB0aGlzIG9uZSBsb2Fkcy5cbiAgICAgICAgc291bmQuX2VuZGVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBzb3VuZCB0byB0aGUgcXVldWUgdG8gYmUgcGxheWVkIG9uIGxvYWQuXG4gICAgICAgIHZhciBzb3VuZElkID0gc291bmQuX2lkO1xuICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICBldmVudDogJ3BsYXknLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnBsYXkoc291bmRJZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc291bmRJZDtcbiAgICAgIH1cblxuICAgICAgLy8gRG9uJ3QgcGxheSB0aGUgc291bmQgaWYgYW4gaWQgd2FzIHBhc3NlZCBhbmQgaXQgaXMgYWxyZWFkeSBwbGF5aW5nLlxuICAgICAgaWYgKGlkICYmICFzb3VuZC5fcGF1c2VkKSB7XG4gICAgICAgIC8vIFRyaWdnZXIgdGhlIHBsYXkgZXZlbnQsIGluIG9yZGVyIHRvIGtlZXAgaXRlcmF0aW5nIHRocm91Z2ggcXVldWUuXG4gICAgICAgIGlmICghaW50ZXJuYWwpIHtcbiAgICAgICAgICBzZWxmLl9sb2FkUXVldWUoJ3BsYXknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzb3VuZC5faWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgQXVkaW9Db250ZXh0IGlzbid0IHN1c3BlbmRlZCwgYW5kIHJlc3VtZSBpdCBpZiBpdCBpcy5cbiAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICBIb3dsZXIuX2F1dG9SZXN1bWUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRGV0ZXJtaW5lIGhvdyBsb25nIHRvIHBsYXkgZm9yIGFuZCB3aGVyZSB0byBzdGFydCBwbGF5aW5nLlxuICAgICAgdmFyIHNlZWsgPSBNYXRoLm1heCgwLCBzb3VuZC5fc2VlayA+IDAgPyBzb3VuZC5fc2VlayA6IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdIC8gMTAwMCk7XG4gICAgICB2YXIgZHVyYXRpb24gPSBNYXRoLm1heCgwLCAoKHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdICsgc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMV0pIC8gMTAwMCkgLSBzZWVrKTtcbiAgICAgIHZhciB0aW1lb3V0ID0gKGR1cmF0aW9uICogMTAwMCkgLyBNYXRoLmFicyhzb3VuZC5fcmF0ZSk7XG4gICAgICB2YXIgc3RhcnQgPSBzZWxmLl9zcHJpdGVbc3ByaXRlXVswXSAvIDEwMDA7XG4gICAgICB2YXIgc3RvcCA9IChzZWxmLl9zcHJpdGVbc3ByaXRlXVswXSArIHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzFdKSAvIDEwMDA7XG4gICAgICB2YXIgbG9vcCA9ICEhKHNvdW5kLl9sb29wIHx8IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzJdKTtcbiAgICAgIHNvdW5kLl9zcHJpdGUgPSBzcHJpdGU7XG5cbiAgICAgIC8vIE1hcmsgdGhlIHNvdW5kIGFzIGVuZGVkIGluc3RhbnRseSBzbyB0aGF0IHRoaXMgYXN5bmMgcGxheWJhY2tcbiAgICAgIC8vIGRvZXNuJ3QgZ2V0IGdyYWJiZWQgYnkgYW5vdGhlciBjYWxsIHRvIHBsYXkgd2hpbGUgdGhpcyBvbmUgd2FpdHMgdG8gc3RhcnQuXG4gICAgICBzb3VuZC5fZW5kZWQgPSBmYWxzZTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBzb3VuZC5cbiAgICAgIHZhciBzZXRQYXJhbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc291bmQuX3BhdXNlZCA9IGZhbHNlO1xuICAgICAgICBzb3VuZC5fc2VlayA9IHNlZWs7XG4gICAgICAgIHNvdW5kLl9zdGFydCA9IHN0YXJ0O1xuICAgICAgICBzb3VuZC5fc3RvcCA9IHN0b3A7XG4gICAgICAgIHNvdW5kLl9sb29wID0gbG9vcDtcbiAgICAgIH07XG5cbiAgICAgIC8vIEVuZCB0aGUgc291bmQgaW5zdGFudGx5IGlmIHNlZWsgaXMgYXQgdGhlIGVuZC5cbiAgICAgIGlmIChzZWVrID49IHN0b3ApIHtcbiAgICAgICAgc2VsZi5fZW5kZWQoc291bmQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIEJlZ2luIHRoZSBhY3R1YWwgcGxheWJhY2suXG4gICAgICB2YXIgbm9kZSA9IHNvdW5kLl9ub2RlO1xuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgIC8vIEZpcmUgdGhpcyB3aGVuIHRoZSBzb3VuZCBpcyByZWFkeSB0byBwbGF5IHRvIGJlZ2luIFdlYiBBdWRpbyBwbGF5YmFjay5cbiAgICAgICAgdmFyIHBsYXlXZWJBdWRpbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuX3BsYXlMb2NrID0gZmFsc2U7XG4gICAgICAgICAgc2V0UGFyYW1zKCk7XG4gICAgICAgICAgc2VsZi5fcmVmcmVzaEJ1ZmZlcihzb3VuZCk7XG5cbiAgICAgICAgICAvLyBTZXR1cCB0aGUgcGxheWJhY2sgcGFyYW1zLlxuICAgICAgICAgIHZhciB2b2wgPSAoc291bmQuX211dGVkIHx8IHNlbGYuX211dGVkKSA/IDAgOiBzb3VuZC5fdm9sdW1lO1xuICAgICAgICAgIG5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh2b2wsIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgICAgIHNvdW5kLl9wbGF5U3RhcnQgPSBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lO1xuXG4gICAgICAgICAgLy8gUGxheSB0aGUgc291bmQgdXNpbmcgdGhlIHN1cHBvcnRlZCBtZXRob2QuXG4gICAgICAgICAgaWYgKHR5cGVvZiBub2RlLmJ1ZmZlclNvdXJjZS5zdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHNvdW5kLl9sb29wID8gbm9kZS5idWZmZXJTb3VyY2Uubm90ZUdyYWluT24oMCwgc2VlaywgODY0MDApIDogbm9kZS5idWZmZXJTb3VyY2Uubm90ZUdyYWluT24oMCwgc2VlaywgZHVyYXRpb24pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb3VuZC5fbG9vcCA/IG5vZGUuYnVmZmVyU291cmNlLnN0YXJ0KDAsIHNlZWssIDg2NDAwKSA6IG5vZGUuYnVmZmVyU291cmNlLnN0YXJ0KDAsIHNlZWssIGR1cmF0aW9uKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTdGFydCBhIG5ldyB0aW1lciBpZiBub25lIGlzIHByZXNlbnQuXG4gICAgICAgICAgaWYgKHRpbWVvdXQgIT09IEluZmluaXR5KSB7XG4gICAgICAgICAgICBzZWxmLl9lbmRUaW1lcnNbc291bmQuX2lkXSA9IHNldFRpbWVvdXQoc2VsZi5fZW5kZWQuYmluZChzZWxmLCBzb3VuZCksIHRpbWVvdXQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghaW50ZXJuYWwpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3BsYXknLCBzb3VuZC5faWQpO1xuICAgICAgICAgICAgICBzZWxmLl9sb2FkUXVldWUoKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoSG93bGVyLnN0YXRlID09PSAncnVubmluZycpIHtcbiAgICAgICAgICBwbGF5V2ViQXVkaW8oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLl9wbGF5TG9jayA9IHRydWU7XG5cbiAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgYXVkaW8gY29udGV4dCB0byByZXN1bWUgYmVmb3JlIHBsYXlpbmcuXG4gICAgICAgICAgc2VsZi5vbmNlKCdyZXN1bWUnLCBwbGF5V2ViQXVkaW8pO1xuXG4gICAgICAgICAgLy8gQ2FuY2VsIHRoZSBlbmQgdGltZXIuXG4gICAgICAgICAgc2VsZi5fY2xlYXJUaW1lcihzb3VuZC5faWQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGaXJlIHRoaXMgd2hlbiB0aGUgc291bmQgaXMgcmVhZHkgdG8gcGxheSB0byBiZWdpbiBIVE1MNSBBdWRpbyBwbGF5YmFjay5cbiAgICAgICAgdmFyIHBsYXlIdG1sNSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG5vZGUuY3VycmVudFRpbWUgPSBzZWVrO1xuICAgICAgICAgIG5vZGUubXV0ZWQgPSBzb3VuZC5fbXV0ZWQgfHwgc2VsZi5fbXV0ZWQgfHwgSG93bGVyLl9tdXRlZCB8fCBub2RlLm11dGVkO1xuICAgICAgICAgIG5vZGUudm9sdW1lID0gc291bmQuX3ZvbHVtZSAqIEhvd2xlci52b2x1bWUoKTtcbiAgICAgICAgICBub2RlLnBsYXliYWNrUmF0ZSA9IHNvdW5kLl9yYXRlO1xuXG4gICAgICAgICAgLy8gU29tZSBicm93c2VycyB3aWxsIHRocm93IGFuIGVycm9yIGlmIHRoaXMgaXMgY2FsbGVkIHdpdGhvdXQgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHBsYXkgPSBub2RlLnBsYXkoKTtcblxuICAgICAgICAgICAgLy8gU3VwcG9ydCBvbGRlciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgcHJvbWlzZXMsIGFuZCB0aHVzIGRvbid0IGhhdmUgdGhpcyBpc3N1ZS5cbiAgICAgICAgICAgIGlmIChwbGF5ICYmIHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJyAmJiAocGxheSBpbnN0YW5jZW9mIFByb21pc2UgfHwgdHlwZW9mIHBsYXkudGhlbiA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgICAgLy8gSW1wbGVtZW50cyBhIGxvY2sgdG8gcHJldmVudCBET01FeGNlcHRpb246IFRoZSBwbGF5KCkgcmVxdWVzdCB3YXMgaW50ZXJydXB0ZWQgYnkgYSBjYWxsIHRvIHBhdXNlKCkuXG4gICAgICAgICAgICAgIHNlbGYuX3BsYXlMb2NrID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAvLyBTZXQgcGFyYW0gdmFsdWVzIGltbWVkaWF0ZWx5LlxuICAgICAgICAgICAgICBzZXRQYXJhbXMoKTtcblxuICAgICAgICAgICAgICAvLyBSZWxlYXNlcyB0aGUgbG9jayBhbmQgZXhlY3V0ZXMgcXVldWVkIGFjdGlvbnMuXG4gICAgICAgICAgICAgIHBsYXlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3BsYXlMb2NrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICBub2RlLl91bmxvY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBpZiAoIWludGVybmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3BsYXknLCBzb3VuZC5faWQpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9sb2FkUXVldWUoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3BsYXlMb2NrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICBzZWxmLl9lbWl0KCdwbGF5ZXJyb3InLCBzb3VuZC5faWQsICdQbGF5YmFjayB3YXMgdW5hYmxlIHRvIHN0YXJ0LiBUaGlzIGlzIG1vc3QgY29tbW9ubHkgYW4gaXNzdWUgJyArXG4gICAgICAgICAgICAgICAgICAgICdvbiBtb2JpbGUgZGV2aWNlcyBhbmQgQ2hyb21lIHdoZXJlIHBsYXliYWNrIHdhcyBub3Qgd2l0aGluIGEgdXNlciBpbnRlcmFjdGlvbi4nKTtcblxuICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgdGhlIGVuZGVkIGFuZCBwYXVzZWQgdmFsdWVzLlxuICAgICAgICAgICAgICAgICAgc291bmQuX2VuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHNvdW5kLl9wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaW50ZXJuYWwpIHtcbiAgICAgICAgICAgICAgc2VsZi5fcGxheUxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgc2V0UGFyYW1zKCk7XG4gICAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3BsYXknLCBzb3VuZC5faWQpO1xuICAgICAgICAgICAgICBzZWxmLl9sb2FkUXVldWUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2V0dGluZyByYXRlIGJlZm9yZSBwbGF5aW5nIHdvbid0IHdvcmsgaW4gSUUsIHNvIHdlIHNldCBpdCBhZ2FpbiBoZXJlLlxuICAgICAgICAgICAgbm9kZS5wbGF5YmFja1JhdGUgPSBzb3VuZC5fcmF0ZTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgc3RpbGwgcGF1c2VkLCB0aGVuIHdlIGNhbiBhc3N1bWUgdGhlcmUgd2FzIGEgcGxheWJhY2sgaXNzdWUuXG4gICAgICAgICAgICBpZiAobm9kZS5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgc2VsZi5fZW1pdCgncGxheWVycm9yJywgc291bmQuX2lkLCAnUGxheWJhY2sgd2FzIHVuYWJsZSB0byBzdGFydC4gVGhpcyBpcyBtb3N0IGNvbW1vbmx5IGFuIGlzc3VlICcgK1xuICAgICAgICAgICAgICAgICdvbiBtb2JpbGUgZGV2aWNlcyBhbmQgQ2hyb21lIHdoZXJlIHBsYXliYWNrIHdhcyBub3Qgd2l0aGluIGEgdXNlciBpbnRlcmFjdGlvbi4nKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXR1cCB0aGUgZW5kIHRpbWVyIG9uIHNwcml0ZXMgb3IgbGlzdGVuIGZvciB0aGUgZW5kZWQgZXZlbnQuXG4gICAgICAgICAgICBpZiAoc3ByaXRlICE9PSAnX19kZWZhdWx0JyB8fCBzb3VuZC5fbG9vcCkge1xuICAgICAgICAgICAgICBzZWxmLl9lbmRUaW1lcnNbc291bmQuX2lkXSA9IHNldFRpbWVvdXQoc2VsZi5fZW5kZWQuYmluZChzZWxmLCBzb3VuZCksIHRpbWVvdXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VsZi5fZW5kVGltZXJzW3NvdW5kLl9pZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBGaXJlIGVuZGVkIG9uIHRoaXMgYXVkaW8gbm9kZS5cbiAgICAgICAgICAgICAgICBzZWxmLl9lbmRlZChzb3VuZCk7XG5cbiAgICAgICAgICAgICAgICAvLyBDbGVhciB0aGlzIGxpc3RlbmVyLlxuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBzZWxmLl9lbmRUaW1lcnNbc291bmQuX2lkXSwgZmFsc2UpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgc2VsZi5fZW5kVGltZXJzW3NvdW5kLl9pZF0sIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3BsYXllcnJvcicsIHNvdW5kLl9pZCwgZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBzdHJlYW1pbmcgYXVkaW8sIG1ha2Ugc3VyZSB0aGUgc3JjIGlzIHNldCBhbmQgbG9hZCBhZ2Fpbi5cbiAgICAgICAgaWYgKG5vZGUuc3JjID09PSAnZGF0YTphdWRpby93YXY7YmFzZTY0LFVrbEdSaWdBQUFCWFFWWkZabTEwSUJJQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQUFBQmtZWFJoQWdBQUFBRUEnKSB7XG4gICAgICAgICAgbm9kZS5zcmMgPSBzZWxmLl9zcmM7XG4gICAgICAgICAgbm9kZS5sb2FkKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQbGF5IGltbWVkaWF0ZWx5IGlmIHJlYWR5LCBvciB3YWl0IGZvciB0aGUgJ2NhbnBsYXl0aHJvdWdoJ2UgdmVudC5cbiAgICAgICAgdmFyIGxvYWRlZE5vUmVhZHlTdGF0ZSA9ICh3aW5kb3cgJiYgd2luZG93LmVqZWN0YSkgfHwgKCFub2RlLnJlYWR5U3RhdGUgJiYgSG93bGVyLl9uYXZpZ2F0b3IuaXNDb2Nvb25KUyk7XG4gICAgICAgIGlmIChub2RlLnJlYWR5U3RhdGUgPj0gMyB8fCBsb2FkZWROb1JlYWR5U3RhdGUpIHtcbiAgICAgICAgICBwbGF5SHRtbDUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLl9wbGF5TG9jayA9IHRydWU7XG5cbiAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIEJlZ2luIHBsYXliYWNrLlxuICAgICAgICAgICAgcGxheUh0bWw1KCk7XG5cbiAgICAgICAgICAgIC8vIENsZWFyIHRoaXMgbGlzdGVuZXIuXG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoSG93bGVyLl9jYW5QbGF5RXZlbnQsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoSG93bGVyLl9jYW5QbGF5RXZlbnQsIGxpc3RlbmVyLCBmYWxzZSk7XG5cbiAgICAgICAgICAvLyBDYW5jZWwgdGhlIGVuZCB0aW1lci5cbiAgICAgICAgICBzZWxmLl9jbGVhclRpbWVyKHNvdW5kLl9pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNvdW5kLl9pZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGF1c2UgcGxheWJhY2sgYW5kIHNhdmUgY3VycmVudCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIFRoZSBzb3VuZCBJRCAoZW1wdHkgdG8gcGF1c2UgYWxsIGluIGdyb3VwKS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIHBhdXNlOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCBvciBhIHBsYXkoKSBwcm9taXNlIGlzIHBlbmRpbmcsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBwYXVzZSB3aGVuIGNhcGFibGUuXG4gICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnIHx8IHNlbGYuX3BsYXlMb2NrKSB7XG4gICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGV2ZW50OiAncGF1c2UnLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnBhdXNlKGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBubyBpZCBpcyBwYXNzZWQsIGdldCBhbGwgSUQncyB0byBiZSBwYXVzZWQuXG4gICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8aWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIENsZWFyIHRoZSBlbmQgdGltZXIuXG4gICAgICAgIHNlbGYuX2NsZWFyVGltZXIoaWRzW2ldKTtcblxuICAgICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgICBpZiAoc291bmQgJiYgIXNvdW5kLl9wYXVzZWQpIHtcbiAgICAgICAgICAvLyBSZXNldCB0aGUgc2VlayBwb3NpdGlvbi5cbiAgICAgICAgICBzb3VuZC5fc2VlayA9IHNlbGYuc2VlayhpZHNbaV0pO1xuICAgICAgICAgIHNvdW5kLl9yYXRlU2VlayA9IDA7XG4gICAgICAgICAgc291bmQuX3BhdXNlZCA9IHRydWU7XG5cbiAgICAgICAgICAvLyBTdG9wIGN1cnJlbnRseSBydW5uaW5nIGZhZGVzLlxuICAgICAgICAgIHNlbGYuX3N0b3BGYWRlKGlkc1tpXSk7XG5cbiAgICAgICAgICBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNvdW5kIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgICAgICAgIGlmICghc291bmQuX25vZGUuYnVmZmVyU291cmNlKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5zdG9wID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5ub3RlT2ZmKDApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5zdG9wKDApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGJ1ZmZlciBzb3VyY2UuXG4gICAgICAgICAgICAgIHNlbGYuX2NsZWFuQnVmZmVyKHNvdW5kLl9ub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzTmFOKHNvdW5kLl9ub2RlLmR1cmF0aW9uKSB8fCBzb3VuZC5fbm9kZS5kdXJhdGlvbiA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUucGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaXJlIHRoZSBwYXVzZSBldmVudCwgdW5sZXNzIGB0cnVlYCBpcyBwYXNzZWQgYXMgdGhlIDJuZCBhcmd1bWVudC5cbiAgICAgICAgaWYgKCFhcmd1bWVudHNbMV0pIHtcbiAgICAgICAgICBzZWxmLl9lbWl0KCdwYXVzZScsIHNvdW5kID8gc291bmQuX2lkIDogbnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3AgcGxheWJhY2sgYW5kIHJlc2V0IHRvIHN0YXJ0LlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgVGhlIHNvdW5kIElEIChlbXB0eSB0byBzdG9wIGFsbCBpbiBncm91cCkuXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gaW50ZXJuYWwgSW50ZXJuYWwgVXNlOiB0cnVlIHByZXZlbnRzIGV2ZW50IGZpcmluZy5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIHN0b3A6IGZ1bmN0aW9uKGlkLCBpbnRlcm5hbCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIHN0b3Agd2hlbiBjYXBhYmxlLlxuICAgICAgaWYgKHNlbGYuX3N0YXRlICE9PSAnbG9hZGVkJyB8fCBzZWxmLl9wbGF5TG9jaykge1xuICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICBldmVudDogJ3N0b3AnLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnN0b3AoaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIGlkIGlzIHBhc3NlZCwgZ2V0IGFsbCBJRCdzIHRvIGJlIHN0b3BwZWQuXG4gICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8aWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIENsZWFyIHRoZSBlbmQgdGltZXIuXG4gICAgICAgIHNlbGYuX2NsZWFyVGltZXIoaWRzW2ldKTtcblxuICAgICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgICAvLyBSZXNldCB0aGUgc2VlayBwb3NpdGlvbi5cbiAgICAgICAgICBzb3VuZC5fc2VlayA9IHNvdW5kLl9zdGFydCB8fCAwO1xuICAgICAgICAgIHNvdW5kLl9yYXRlU2VlayA9IDA7XG4gICAgICAgICAgc291bmQuX3BhdXNlZCA9IHRydWU7XG4gICAgICAgICAgc291bmQuX2VuZGVkID0gdHJ1ZTtcblxuICAgICAgICAgIC8vIFN0b3AgY3VycmVudGx5IHJ1bm5pbmcgZmFkZXMuXG4gICAgICAgICAgc2VsZi5fc3RvcEZhZGUoaWRzW2ldKTtcblxuICAgICAgICAgIGlmIChzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc291bmQncyBBdWRpb0J1ZmZlclNvdXJjZU5vZGUgaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICAgICAgaWYgKHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291bmQuX25vZGUuYnVmZmVyU291cmNlLnN0b3AgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2Uubm90ZU9mZigwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLnN0b3AoMCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGJ1ZmZlciBzb3VyY2UuXG4gICAgICAgICAgICAgICAgc2VsZi5fY2xlYW5CdWZmZXIoc291bmQuX25vZGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc05hTihzb3VuZC5fbm9kZS5kdXJhdGlvbikgfHwgc291bmQuX25vZGUuZHVyYXRpb24gPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9ub2RlLmN1cnJlbnRUaW1lID0gc291bmQuX3N0YXJ0IHx8IDA7XG4gICAgICAgICAgICAgIHNvdW5kLl9ub2RlLnBhdXNlKCk7XG5cbiAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIGxpdmUgc3RyZWFtLCBzdG9wIGRvd25sb2FkIG9uY2UgdGhlIGF1ZGlvIGlzIHN0b3BwZWQuXG4gICAgICAgICAgICAgIGlmIChzb3VuZC5fbm9kZS5kdXJhdGlvbiA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9jbGVhclNvdW5kKHNvdW5kLl9ub2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghaW50ZXJuYWwpIHtcbiAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3N0b3AnLCBzb3VuZC5faWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTXV0ZS91bm11dGUgYSBzaW5nbGUgc291bmQgb3IgYWxsIHNvdW5kcyBpbiB0aGlzIEhvd2wgZ3JvdXAuXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gbXV0ZWQgU2V0IHRvIHRydWUgdG8gbXV0ZSBhbmQgZmFsc2UgdG8gdW5tdXRlLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgICAgVGhlIHNvdW5kIElEIHRvIHVwZGF0ZSAob21pdCB0byBtdXRlL3VubXV0ZSBhbGwpLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgbXV0ZTogZnVuY3Rpb24obXV0ZWQsIGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gbXV0ZSB3aGVuIGNhcGFibGUuXG4gICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnfHwgc2VsZi5fcGxheUxvY2spIHtcbiAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZXZlbnQ6ICdtdXRlJyxcbiAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5tdXRlKG11dGVkLCBpZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYXBwbHlpbmcgbXV0ZS91bm11dGUgdG8gYWxsIHNvdW5kcywgdXBkYXRlIHRoZSBncm91cCdzIHZhbHVlLlxuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtdXRlZCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgc2VsZi5fbXV0ZWQgPSBtdXRlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5fbXV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbm8gaWQgaXMgcGFzc2VkLCBnZXQgYWxsIElEJ3MgdG8gYmUgbXV0ZWQuXG4gICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8aWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICAgIHNvdW5kLl9tdXRlZCA9IG11dGVkO1xuXG4gICAgICAgICAgLy8gQ2FuY2VsIGFjdGl2ZSBmYWRlIGFuZCBzZXQgdGhlIHZvbHVtZSB0byB0aGUgZW5kIHZhbHVlLlxuICAgICAgICAgIGlmIChzb3VuZC5faW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHNlbGYuX3N0b3BGYWRlKHNvdW5kLl9pZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmIHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICBzb3VuZC5fbm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKG11dGVkID8gMCA6IHNvdW5kLl92b2x1bWUsIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIHNvdW5kLl9ub2RlLm11dGVkID0gSG93bGVyLl9tdXRlZCA/IHRydWUgOiBtdXRlZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9lbWl0KCdtdXRlJywgc291bmQuX2lkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgdm9sdW1lIG9mIHRoaXMgc291bmQgb3Igb2YgdGhlIEhvd2wgZ3JvdXAuIFRoaXMgbWV0aG9kIGNhbiBvcHRpb25hbGx5IHRha2UgMCwgMSBvciAyIGFyZ3VtZW50cy5cbiAgICAgKiAgIHZvbHVtZSgpIC0+IFJldHVybnMgdGhlIGdyb3VwJ3Mgdm9sdW1lIHZhbHVlLlxuICAgICAqICAgdm9sdW1lKGlkKSAtPiBSZXR1cm5zIHRoZSBzb3VuZCBpZCdzIGN1cnJlbnQgdm9sdW1lLlxuICAgICAqICAgdm9sdW1lKHZvbCkgLT4gU2V0cyB0aGUgdm9sdW1lIG9mIGFsbCBzb3VuZHMgaW4gdGhpcyBIb3dsIGdyb3VwLlxuICAgICAqICAgdm9sdW1lKHZvbCwgaWQpIC0+IFNldHMgdGhlIHZvbHVtZSBvZiBwYXNzZWQgc291bmQgaWQuXG4gICAgICogQHJldHVybiB7SG93bC9OdW1iZXJ9IFJldHVybnMgc2VsZiBvciBjdXJyZW50IHZvbHVtZS5cbiAgICAgKi9cbiAgICB2b2x1bWU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgdm9sLCBpZDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSB2YWx1ZXMgYmFzZWQgb24gYXJndW1lbnRzLlxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIFJldHVybiB0aGUgdmFsdWUgb2YgdGhlIGdyb3Vwcycgdm9sdW1lLlxuICAgICAgICByZXR1cm4gc2VsZi5fdm9sdW1lO1xuICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gMSB8fCBhcmdzLmxlbmd0aCA9PT0gMiAmJiB0eXBlb2YgYXJnc1sxXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gRmlyc3QgY2hlY2sgaWYgdGhpcyBpcyBhbiBJRCwgYW5kIGlmIG5vdCwgYXNzdW1lIGl0IGlzIGEgbmV3IHZvbHVtZS5cbiAgICAgICAgdmFyIGlkcyA9IHNlbGYuX2dldFNvdW5kSWRzKCk7XG4gICAgICAgIHZhciBpbmRleCA9IGlkcy5pbmRleE9mKGFyZ3NbMF0pO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIGlkID0gcGFyc2VJbnQoYXJnc1swXSwgMTApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZvbCA9IHBhcnNlRmxvYXQoYXJnc1swXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPj0gMikge1xuICAgICAgICB2b2wgPSBwYXJzZUZsb2F0KGFyZ3NbMF0pO1xuICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMV0sIDEwKTtcbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHRoZSB2b2x1bWUgb3IgcmV0dXJuIHRoZSBjdXJyZW50IHZvbHVtZS5cbiAgICAgIHZhciBzb3VuZDtcbiAgICAgIGlmICh0eXBlb2Ygdm9sICE9PSAndW5kZWZpbmVkJyAmJiB2b2wgPj0gMCAmJiB2b2wgPD0gMSkge1xuICAgICAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIGNoYW5nZSB2b2x1bWUgd2hlbiBjYXBhYmxlLlxuICAgICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnfHwgc2VsZi5fcGxheUxvY2spIHtcbiAgICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICAgIGV2ZW50OiAndm9sdW1lJyxcbiAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHNlbGYudm9sdW1lLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIGdyb3VwIHZvbHVtZS5cbiAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzZWxmLl92b2x1bWUgPSB2b2w7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgb25lIG9yIGFsbCB2b2x1bWVzLlxuICAgICAgICBpZCA9IHNlbGYuX2dldFNvdW5kSWRzKGlkKTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGlkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgICAgICBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZFtpXSk7XG5cbiAgICAgICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgICAgIHNvdW5kLl92b2x1bWUgPSB2b2w7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgY3VycmVudGx5IHJ1bm5pbmcgZmFkZXMuXG4gICAgICAgICAgICBpZiAoIWFyZ3NbMl0pIHtcbiAgICAgICAgICAgICAgc2VsZi5fc3RvcEZhZGUoaWRbaV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8gJiYgc291bmQuX25vZGUgJiYgIXNvdW5kLl9tdXRlZCkge1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKHZvbCwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdW5kLl9ub2RlICYmICFzb3VuZC5fbXV0ZWQpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUudm9sdW1lID0gdm9sICogSG93bGVyLnZvbHVtZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLl9lbWl0KCd2b2x1bWUnLCBzb3VuZC5faWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc291bmQgPSBpZCA/IHNlbGYuX3NvdW5kQnlJZChpZCkgOiBzZWxmLl9zb3VuZHNbMF07XG4gICAgICAgIHJldHVybiBzb3VuZCA/IHNvdW5kLl92b2x1bWUgOiAwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmFkZSBhIGN1cnJlbnRseSBwbGF5aW5nIHNvdW5kIGJldHdlZW4gdHdvIHZvbHVtZXMgKGlmIG5vIGlkIGlzIHBhc3NzZWQsIGFsbCBzb3VuZHMgd2lsbCBmYWRlKS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZyb20gVGhlIHZhbHVlIHRvIGZhZGUgZnJvbSAoMC4wIHRvIDEuMCkuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB0byAgIFRoZSB2b2x1bWUgdG8gZmFkZSB0byAoMC4wIHRvIDEuMCkuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBsZW4gIFRpbWUgaW4gbWlsbGlzZWNvbmRzIHRvIGZhZGUuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCAgIFRoZSBzb3VuZCBpZCAob21pdCB0byBmYWRlIGFsbCBzb3VuZHMpLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgZmFkZTogZnVuY3Rpb24oZnJvbSwgdG8sIGxlbiwgaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBmYWRlIHdoZW4gY2FwYWJsZS5cbiAgICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcgfHwgc2VsZi5fcGxheUxvY2spIHtcbiAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZXZlbnQ6ICdmYWRlJyxcbiAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5mYWRlKGZyb20sIHRvLCBsZW4sIGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHRvL2Zyb20vbGVuIHZhbHVlcyBhcmUgbnVtYmVycy5cbiAgICAgIGZyb20gPSBwYXJzZUZsb2F0KGZyb20pO1xuICAgICAgdG8gPSBwYXJzZUZsb2F0KHRvKTtcbiAgICAgIGxlbiA9IHBhcnNlRmxvYXQobGVuKTtcblxuICAgICAgLy8gU2V0IHRoZSB2b2x1bWUgdG8gdGhlIHN0YXJ0IHBvc2l0aW9uLlxuICAgICAgc2VsZi52b2x1bWUoZnJvbSwgaWQpO1xuXG4gICAgICAvLyBGYWRlIHRoZSB2b2x1bWUgb2Ygb25lIG9yIGFsbCBzb3VuZHMuXG4gICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuICAgICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgICAvLyBDcmVhdGUgYSBsaW5lYXIgZmFkZSBvciBmYWxsIGJhY2sgdG8gdGltZW91dHMgd2l0aCBIVE1MNSBBdWRpby5cbiAgICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgICAgLy8gU3RvcCB0aGUgcHJldmlvdXMgZmFkZSBpZiBubyBzcHJpdGUgaXMgYmVpbmcgdXNlZCAob3RoZXJ3aXNlLCB2b2x1bWUgaGFuZGxlcyB0aGlzKS5cbiAgICAgICAgICBpZiAoIWlkKSB7XG4gICAgICAgICAgICBzZWxmLl9zdG9wRmFkZShpZHNbaV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHdlIGFyZSB1c2luZyBXZWIgQXVkaW8sIGxldCB0aGUgbmF0aXZlIG1ldGhvZHMgZG8gdGhlIGFjdHVhbCBmYWRlLlxuICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbyAmJiAhc291bmQuX211dGVkKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFRpbWUgPSBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgdmFyIGVuZCA9IGN1cnJlbnRUaW1lICsgKGxlbiAvIDEwMDApO1xuICAgICAgICAgICAgc291bmQuX3ZvbHVtZSA9IGZyb207XG4gICAgICAgICAgICBzb3VuZC5fbm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKGZyb20sIGN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIHNvdW5kLl9ub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodG8sIGVuZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fc3RhcnRGYWRlSW50ZXJ2YWwoc291bmQsIGZyb20sIHRvLCBsZW4sIGlkc1tpXSwgdHlwZW9mIGlkID09PSAndW5kZWZpbmVkJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyB0aGUgaW50ZXJuYWwgaW50ZXJ2YWwgdG8gZmFkZSBhIHNvdW5kLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gc291bmQgUmVmZXJlbmNlIHRvIHNvdW5kIHRvIGZhZGUuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBmcm9tIFRoZSB2YWx1ZSB0byBmYWRlIGZyb20gKDAuMCB0byAxLjApLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gdG8gICBUaGUgdm9sdW1lIHRvIGZhZGUgdG8gKDAuMCB0byAxLjApLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gbGVuICBUaW1lIGluIG1pbGxpc2Vjb25kcyB0byBmYWRlLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgICBUaGUgc291bmQgaWQgdG8gZmFkZS5cbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBpc0dyb3VwICAgSWYgdHJ1ZSwgc2V0IHRoZSB2b2x1bWUgb24gdGhlIGdyb3VwLlxuICAgICAqL1xuICAgIF9zdGFydEZhZGVJbnRlcnZhbDogZnVuY3Rpb24oc291bmQsIGZyb20sIHRvLCBsZW4sIGlkLCBpc0dyb3VwKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgdm9sID0gZnJvbTtcbiAgICAgIHZhciBkaWZmID0gdG8gLSBmcm9tO1xuICAgICAgdmFyIHN0ZXBzID0gTWF0aC5hYnMoZGlmZiAvIDAuMDEpO1xuICAgICAgdmFyIHN0ZXBMZW4gPSBNYXRoLm1heCg0LCAoc3RlcHMgPiAwKSA/IGxlbiAvIHN0ZXBzIDogbGVuKTtcbiAgICAgIHZhciBsYXN0VGljayA9IERhdGUubm93KCk7XG5cbiAgICAgIC8vIFN0b3JlIHRoZSB2YWx1ZSBiZWluZyBmYWRlZCB0by5cbiAgICAgIHNvdW5kLl9mYWRlVG8gPSB0bztcblxuICAgICAgLy8gVXBkYXRlIHRoZSB2b2x1bWUgdmFsdWUgb24gZWFjaCBpbnRlcnZhbCB0aWNrLlxuICAgICAgc291bmQuX2ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdm9sdW1lIGJhc2VkIG9uIHRoZSB0aW1lIHNpbmNlIHRoZSBsYXN0IHRpY2suXG4gICAgICAgIHZhciB0aWNrID0gKERhdGUubm93KCkgLSBsYXN0VGljaykgLyBsZW47XG4gICAgICAgIGxhc3RUaWNrID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdm9sICs9IGRpZmYgKiB0aWNrO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgdm9sdW1lIGlzIGluIHRoZSByaWdodCBib3VuZHMuXG4gICAgICAgIHZvbCA9IE1hdGgubWF4KDAsIHZvbCk7XG4gICAgICAgIHZvbCA9IE1hdGgubWluKDEsIHZvbCk7XG5cbiAgICAgICAgLy8gUm91bmQgdG8gd2l0aGluIDIgZGVjaW1hbCBwb2ludHMuXG4gICAgICAgIHZvbCA9IE1hdGgucm91bmQodm9sICogMTAwKSAvIDEwMDtcblxuICAgICAgICAvLyBDaGFuZ2UgdGhlIHZvbHVtZS5cbiAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgc291bmQuX3ZvbHVtZSA9IHZvbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLnZvbHVtZSh2b2wsIHNvdW5kLl9pZCwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIGdyb3VwJ3Mgdm9sdW1lLlxuICAgICAgICBpZiAoaXNHcm91cCkge1xuICAgICAgICAgIHNlbGYuX3ZvbHVtZSA9IHZvbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gdGhlIGZhZGUgaXMgY29tcGxldGUsIHN0b3AgaXQgYW5kIGZpcmUgZXZlbnQuXG4gICAgICAgIGlmICgodG8gPCBmcm9tICYmIHZvbCA8PSB0bykgfHwgKHRvID4gZnJvbSAmJiB2b2wgPj0gdG8pKSB7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChzb3VuZC5faW50ZXJ2YWwpO1xuICAgICAgICAgIHNvdW5kLl9pbnRlcnZhbCA9IG51bGw7XG4gICAgICAgICAgc291bmQuX2ZhZGVUbyA9IG51bGw7XG4gICAgICAgICAgc2VsZi52b2x1bWUodG8sIHNvdW5kLl9pZCk7XG4gICAgICAgICAgc2VsZi5fZW1pdCgnZmFkZScsIHNvdW5kLl9pZCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHN0ZXBMZW4pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBzdG9wcyB0aGUgY3VycmVudGx5IHBsYXlpbmcgZmFkZSB3aGVuXG4gICAgICogYSBuZXcgZmFkZSBzdGFydHMsIHZvbHVtZSBpcyBjaGFuZ2VkIG9yIHRoZSBzb3VuZCBpcyBzdG9wcGVkLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgVGhlIHNvdW5kIGlkLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgX3N0b3BGYWRlOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkKTtcblxuICAgICAgaWYgKHNvdW5kICYmIHNvdW5kLl9pbnRlcnZhbCkge1xuICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICBzb3VuZC5fbm9kZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoc291bmQuX2ludGVydmFsKTtcbiAgICAgICAgc291bmQuX2ludGVydmFsID0gbnVsbDtcbiAgICAgICAgc2VsZi52b2x1bWUoc291bmQuX2ZhZGVUbywgaWQpO1xuICAgICAgICBzb3VuZC5fZmFkZVRvID0gbnVsbDtcbiAgICAgICAgc2VsZi5fZW1pdCgnZmFkZScsIGlkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdGhlIGxvb3AgcGFyYW1ldGVyIG9uIGEgc291bmQuIFRoaXMgbWV0aG9kIGNhbiBvcHRpb25hbGx5IHRha2UgMCwgMSBvciAyIGFyZ3VtZW50cy5cbiAgICAgKiAgIGxvb3AoKSAtPiBSZXR1cm5zIHRoZSBncm91cCdzIGxvb3AgdmFsdWUuXG4gICAgICogICBsb29wKGlkKSAtPiBSZXR1cm5zIHRoZSBzb3VuZCBpZCdzIGxvb3AgdmFsdWUuXG4gICAgICogICBsb29wKGxvb3ApIC0+IFNldHMgdGhlIGxvb3AgdmFsdWUgZm9yIGFsbCBzb3VuZHMgaW4gdGhpcyBIb3dsIGdyb3VwLlxuICAgICAqICAgbG9vcChsb29wLCBpZCkgLT4gU2V0cyB0aGUgbG9vcCB2YWx1ZSBvZiBwYXNzZWQgc291bmQgaWQuXG4gICAgICogQHJldHVybiB7SG93bC9Cb29sZWFufSBSZXR1cm5zIHNlbGYgb3IgY3VycmVudCBsb29wIHZhbHVlLlxuICAgICAqL1xuICAgIGxvb3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgbG9vcCwgaWQsIHNvdW5kO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIHZhbHVlcyBmb3IgbG9vcCBhbmQgaWQuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBncm91J3MgbG9vcCB2YWx1ZS5cbiAgICAgICAgcmV0dXJuIHNlbGYuX2xvb3A7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgbG9vcCA9IGFyZ3NbMF07XG4gICAgICAgICAgc2VsZi5fbG9vcCA9IGxvb3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmV0dXJuIHRoaXMgc291bmQncyBsb29wIHZhbHVlLlxuICAgICAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKHBhcnNlSW50KGFyZ3NbMF0sIDEwKSk7XG4gICAgICAgICAgcmV0dXJuIHNvdW5kID8gc291bmQuX2xvb3AgOiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBsb29wID0gYXJnc1swXTtcbiAgICAgICAgaWQgPSBwYXJzZUludChhcmdzWzFdLCAxMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIGlkIGlzIHBhc3NlZCwgZ2V0IGFsbCBJRCdzIHRvIGJlIGxvb3BlZC5cbiAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8aWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkc1tpXSk7XG5cbiAgICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgICAgc291bmQuX2xvb3AgPSBsb29wO1xuICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbyAmJiBzb3VuZC5fbm9kZSAmJiBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UpIHtcbiAgICAgICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5sb29wID0gbG9vcDtcbiAgICAgICAgICAgIGlmIChsb29wKSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5sb29wU3RhcnQgPSBzb3VuZC5fc3RhcnQgfHwgMDtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLmxvb3BFbmQgPSBzb3VuZC5fc3RvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdGhlIHBsYXliYWNrIHJhdGUgb2YgYSBzb3VuZC4gVGhpcyBtZXRob2QgY2FuIG9wdGlvbmFsbHkgdGFrZSAwLCAxIG9yIDIgYXJndW1lbnRzLlxuICAgICAqICAgcmF0ZSgpIC0+IFJldHVybnMgdGhlIGZpcnN0IHNvdW5kIG5vZGUncyBjdXJyZW50IHBsYXliYWNrIHJhdGUuXG4gICAgICogICByYXRlKGlkKSAtPiBSZXR1cm5zIHRoZSBzb3VuZCBpZCdzIGN1cnJlbnQgcGxheWJhY2sgcmF0ZS5cbiAgICAgKiAgIHJhdGUocmF0ZSkgLT4gU2V0cyB0aGUgcGxheWJhY2sgcmF0ZSBvZiBhbGwgc291bmRzIGluIHRoaXMgSG93bCBncm91cC5cbiAgICAgKiAgIHJhdGUocmF0ZSwgaWQpIC0+IFNldHMgdGhlIHBsYXliYWNrIHJhdGUgb2YgcGFzc2VkIHNvdW5kIGlkLlxuICAgICAqIEByZXR1cm4ge0hvd2wvTnVtYmVyfSBSZXR1cm5zIHNlbGYgb3IgdGhlIGN1cnJlbnQgcGxheWJhY2sgcmF0ZS5cbiAgICAgKi9cbiAgICByYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdmFyIHJhdGUsIGlkO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIHZhbHVlcyBiYXNlZCBvbiBhcmd1bWVudHMuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gV2Ugd2lsbCBzaW1wbHkgcmV0dXJuIHRoZSBjdXJyZW50IHJhdGUgb2YgdGhlIGZpcnN0IG5vZGUuXG4gICAgICAgIGlkID0gc2VsZi5fc291bmRzWzBdLl9pZDtcbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRmlyc3QgY2hlY2sgaWYgdGhpcyBpcyBhbiBJRCwgYW5kIGlmIG5vdCwgYXNzdW1lIGl0IGlzIGEgbmV3IHJhdGUgdmFsdWUuXG4gICAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcygpO1xuICAgICAgICB2YXIgaW5kZXggPSBpZHMuaW5kZXhPZihhcmdzWzBdKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMF0sIDEwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYXRlID0gcGFyc2VGbG9hdChhcmdzWzBdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICByYXRlID0gcGFyc2VGbG9hdChhcmdzWzBdKTtcbiAgICAgICAgaWQgPSBwYXJzZUludChhcmdzWzFdLCAxMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWJhY2sgcmF0ZSBvciByZXR1cm4gdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAgICB2YXIgc291bmQ7XG4gICAgICBpZiAodHlwZW9mIHJhdGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gY2hhbmdlIHBsYXliYWNrIHJhdGUgd2hlbiBjYXBhYmxlLlxuICAgICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnIHx8IHNlbGYuX3BsYXlMb2NrKSB7XG4gICAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgICBldmVudDogJ3JhdGUnLFxuICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc2VsZi5yYXRlLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIGdyb3VwIHJhdGUuXG4gICAgICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgc2VsZi5fcmF0ZSA9IHJhdGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgb25lIG9yIGFsbCB2b2x1bWVzLlxuICAgICAgICBpZCA9IHNlbGYuX2dldFNvdW5kSWRzKGlkKTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGlkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgICAgICBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZFtpXSk7XG5cbiAgICAgICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgdHJhY2sgb2Ygb3VyIHBvc2l0aW9uIHdoZW4gdGhlIHJhdGUgY2hhbmdlZCBhbmQgdXBkYXRlIHRoZSBwbGF5YmFja1xuICAgICAgICAgICAgLy8gc3RhcnQgcG9zaXRpb24gc28gd2UgY2FuIHByb3Blcmx5IGFkanVzdCB0aGUgc2VlayBwb3NpdGlvbiBmb3IgdGltZSBlbGFwc2VkLlxuICAgICAgICAgICAgaWYgKHNlbGYucGxheWluZyhpZFtpXSkpIHtcbiAgICAgICAgICAgICAgc291bmQuX3JhdGVTZWVrID0gc2VsZi5zZWVrKGlkW2ldKTtcbiAgICAgICAgICAgICAgc291bmQuX3BsYXlTdGFydCA9IHNlbGYuX3dlYkF1ZGlvID8gSG93bGVyLmN0eC5jdXJyZW50VGltZSA6IHNvdW5kLl9wbGF5U3RhcnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VuZC5fcmF0ZSA9IHJhdGU7XG5cbiAgICAgICAgICAgIC8vIENoYW5nZSB0aGUgcGxheWJhY2sgcmF0ZS5cbiAgICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbyAmJiBzb3VuZC5fbm9kZSAmJiBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShyYXRlLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUucGxheWJhY2tSYXRlID0gcmF0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVzZXQgdGhlIHRpbWVycy5cbiAgICAgICAgICAgIHZhciBzZWVrID0gc2VsZi5zZWVrKGlkW2ldKTtcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9ICgoc2VsZi5fc3ByaXRlW3NvdW5kLl9zcHJpdGVdWzBdICsgc2VsZi5fc3ByaXRlW3NvdW5kLl9zcHJpdGVdWzFdKSAvIDEwMDApIC0gc2VlaztcbiAgICAgICAgICAgIHZhciB0aW1lb3V0ID0gKGR1cmF0aW9uICogMTAwMCkgLyBNYXRoLmFicyhzb3VuZC5fcmF0ZSk7XG5cbiAgICAgICAgICAgIC8vIFN0YXJ0IGEgbmV3IGVuZCB0aW1lciBpZiBzb3VuZCBpcyBhbHJlYWR5IHBsYXlpbmcuXG4gICAgICAgICAgICBpZiAoc2VsZi5fZW5kVGltZXJzW2lkW2ldXSB8fCAhc291bmQuX3BhdXNlZCkge1xuICAgICAgICAgICAgICBzZWxmLl9jbGVhclRpbWVyKGlkW2ldKTtcbiAgICAgICAgICAgICAgc2VsZi5fZW5kVGltZXJzW2lkW2ldXSA9IHNldFRpbWVvdXQoc2VsZi5fZW5kZWQuYmluZChzZWxmLCBzb3VuZCksIHRpbWVvdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLl9lbWl0KCdyYXRlJywgc291bmQuX2lkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkKTtcbiAgICAgICAgcmV0dXJuIHNvdW5kID8gc291bmQuX3JhdGUgOiBzZWxmLl9yYXRlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgc2VlayBwb3NpdGlvbiBvZiBhIHNvdW5kLiBUaGlzIG1ldGhvZCBjYW4gb3B0aW9uYWxseSB0YWtlIDAsIDEgb3IgMiBhcmd1bWVudHMuXG4gICAgICogICBzZWVrKCkgLT4gUmV0dXJucyB0aGUgZmlyc3Qgc291bmQgbm9kZSdzIGN1cnJlbnQgc2VlayBwb3NpdGlvbi5cbiAgICAgKiAgIHNlZWsoaWQpIC0+IFJldHVybnMgdGhlIHNvdW5kIGlkJ3MgY3VycmVudCBzZWVrIHBvc2l0aW9uLlxuICAgICAqICAgc2VlayhzZWVrKSAtPiBTZXRzIHRoZSBzZWVrIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBzb3VuZCBub2RlLlxuICAgICAqICAgc2VlayhzZWVrLCBpZCkgLT4gU2V0cyB0aGUgc2VlayBwb3NpdGlvbiBvZiBwYXNzZWQgc291bmQgaWQuXG4gICAgICogQHJldHVybiB7SG93bC9OdW1iZXJ9IFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCBzZWVrIHBvc2l0aW9uLlxuICAgICAqL1xuICAgIHNlZWs6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgc2VlaywgaWQ7XG5cbiAgICAgIC8vIERldGVybWluZSB0aGUgdmFsdWVzIGJhc2VkIG9uIGFyZ3VtZW50cy5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBXZSB3aWxsIHNpbXBseSByZXR1cm4gdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG5vZGUuXG4gICAgICAgIGlkID0gc2VsZi5fc291bmRzWzBdLl9pZDtcbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRmlyc3QgY2hlY2sgaWYgdGhpcyBpcyBhbiBJRCwgYW5kIGlmIG5vdCwgYXNzdW1lIGl0IGlzIGEgbmV3IHNlZWsgcG9zaXRpb24uXG4gICAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcygpO1xuICAgICAgICB2YXIgaW5kZXggPSBpZHMuaW5kZXhPZihhcmdzWzBdKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMF0sIDEwKTtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxmLl9zb3VuZHMubGVuZ3RoKSB7XG4gICAgICAgICAgaWQgPSBzZWxmLl9zb3VuZHNbMF0uX2lkO1xuICAgICAgICAgIHNlZWsgPSBwYXJzZUZsb2F0KGFyZ3NbMF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHNlZWsgPSBwYXJzZUZsb2F0KGFyZ3NbMF0pO1xuICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMV0sIDEwKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gSUQsIGJhaWwgb3V0LlxuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gc2VlayB3aGVuIGNhcGFibGUuXG4gICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnIHx8IHNlbGYuX3BsYXlMb2NrKSB7XG4gICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGV2ZW50OiAnc2VlaycsXG4gICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuc2Vlay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkKTtcblxuICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2VlayA9PT0gJ251bWJlcicgJiYgc2VlayA+PSAwKSB7XG4gICAgICAgICAgLy8gUGF1c2UgdGhlIHNvdW5kIGFuZCB1cGRhdGUgcG9zaXRpb24gZm9yIHJlc3RhcnRpbmcgcGxheWJhY2suXG4gICAgICAgICAgdmFyIHBsYXlpbmcgPSBzZWxmLnBsYXlpbmcoaWQpO1xuICAgICAgICAgIGlmIChwbGF5aW5nKSB7XG4gICAgICAgICAgICBzZWxmLnBhdXNlKGlkLCB0cnVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBNb3ZlIHRoZSBwb3NpdGlvbiBvZiB0aGUgdHJhY2sgYW5kIGNhbmNlbCB0aW1lci5cbiAgICAgICAgICBzb3VuZC5fc2VlayA9IHNlZWs7XG4gICAgICAgICAgc291bmQuX2VuZGVkID0gZmFsc2U7XG4gICAgICAgICAgc2VsZi5fY2xlYXJUaW1lcihpZCk7XG5cbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHNlZWsgcG9zaXRpb24gZm9yIEhUTUw1IEF1ZGlvLlxuICAgICAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8gJiYgc291bmQuX25vZGUgJiYgIWlzTmFOKHNvdW5kLl9ub2RlLmR1cmF0aW9uKSkge1xuICAgICAgICAgICAgc291bmQuX25vZGUuY3VycmVudFRpbWUgPSBzZWVrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNlZWsgYW5kIGVtaXQgd2hlbiByZWFkeS5cbiAgICAgICAgICB2YXIgc2Vla0FuZEVtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3NlZWsnLCBpZCk7XG5cbiAgICAgICAgICAgIC8vIFJlc3RhcnQgdGhlIHBsYXliYWNrIGlmIHRoZSBzb3VuZCB3YXMgcGxheWluZy5cbiAgICAgICAgICAgIGlmIChwbGF5aW5nKSB7XG4gICAgICAgICAgICAgIHNlbGYucGxheShpZCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSBwbGF5IGxvY2sgdG8gYmUgdW5zZXQgYmVmb3JlIGVtaXR0aW5nIChIVE1MNSBBdWRpbykuXG4gICAgICAgICAgaWYgKHBsYXlpbmcgJiYgIXNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgICB2YXIgZW1pdFNlZWsgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKCFzZWxmLl9wbGF5TG9jaykge1xuICAgICAgICAgICAgICAgIHNlZWtBbmRFbWl0KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChlbWl0U2VlaywgMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGVtaXRTZWVrLCAwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2Vla0FuZEVtaXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgICB2YXIgcmVhbFRpbWUgPSBzZWxmLnBsYXlpbmcoaWQpID8gSG93bGVyLmN0eC5jdXJyZW50VGltZSAtIHNvdW5kLl9wbGF5U3RhcnQgOiAwO1xuICAgICAgICAgICAgdmFyIHJhdGVTZWVrID0gc291bmQuX3JhdGVTZWVrID8gc291bmQuX3JhdGVTZWVrIC0gc291bmQuX3NlZWsgOiAwO1xuICAgICAgICAgICAgcmV0dXJuIHNvdW5kLl9zZWVrICsgKHJhdGVTZWVrICsgcmVhbFRpbWUgKiBNYXRoLmFicyhzb3VuZC5fcmF0ZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc291bmQuX25vZGUuY3VycmVudFRpbWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHNwZWNpZmljIHNvdW5kIGlzIGN1cnJlbnRseSBwbGF5aW5nIG9yIG5vdCAoaWYgaWQgaXMgcHJvdmlkZWQpLCBvciBjaGVjayBpZiBhdCBsZWFzdCBvbmUgb2YgdGhlIHNvdW5kcyBpbiB0aGUgZ3JvdXAgaXMgcGxheWluZyBvciBub3QuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSAgaWQgVGhlIHNvdW5kIGlkIHRvIGNoZWNrLiBJZiBub25lIGlzIHBhc3NlZCwgdGhlIHdob2xlIHNvdW5kIGdyb3VwIGlzIGNoZWNrZWQuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBpZiBwbGF5aW5nIGFuZCBmYWxzZSBpZiBub3QuXG4gICAgICovXG4gICAgcGxheWluZzogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gQ2hlY2sgdGhlIHBhc3NlZCBzb3VuZCBJRCAoaWYgYW55KS5cbiAgICAgIGlmICh0eXBlb2YgaWQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZCk7XG4gICAgICAgIHJldHVybiBzb3VuZCA/ICFzb3VuZC5fcGF1c2VkIDogZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyd2lzZSwgbG9vcCB0aHJvdWdoIGFsbCBzb3VuZHMgYW5kIGNoZWNrIGlmIGFueSBhcmUgcGxheWluZy5cbiAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9zb3VuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFzZWxmLl9zb3VuZHNbaV0uX3BhdXNlZCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkdXJhdGlvbiBvZiB0aGlzIHNvdW5kLiBQYXNzaW5nIGEgc291bmQgaWQgd2lsbCByZXR1cm4gdGhlIHNwcml0ZSBkdXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIFRoZSBzb3VuZCBpZCB0byBjaGVjay4gSWYgbm9uZSBpcyBwYXNzZWQsIHJldHVybiBmdWxsIHNvdXJjZSBkdXJhdGlvbi5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IEF1ZGlvIGR1cmF0aW9uIGluIHNlY29uZHMuXG4gICAgICovXG4gICAgZHVyYXRpb246IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZHVyYXRpb24gPSBzZWxmLl9kdXJhdGlvbjtcblxuICAgICAgLy8gSWYgd2UgcGFzcyBhbiBJRCwgZ2V0IHRoZSBzb3VuZCBhbmQgcmV0dXJuIHRoZSBzcHJpdGUgbGVuZ3RoLlxuICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkKTtcbiAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICBkdXJhdGlvbiA9IHNlbGYuX3Nwcml0ZVtzb3VuZC5fc3ByaXRlXVsxXSAvIDEwMDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkdXJhdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBsb2FkZWQgc3RhdGUgb2YgdGhpcyBIb3dsLlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gJ3VubG9hZGVkJywgJ2xvYWRpbmcnLCAnbG9hZGVkJ1xuICAgICAqL1xuICAgIHN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5sb2FkIGFuZCBkZXN0cm95IHRoZSBjdXJyZW50IEhvd2wgb2JqZWN0LlxuICAgICAqIFRoaXMgd2lsbCBpbW1lZGlhdGVseSBzdG9wIGFsbCBzb3VuZCBpbnN0YW5jZXMgYXR0YWNoZWQgdG8gdGhpcyBncm91cC5cbiAgICAgKi9cbiAgICB1bmxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBTdG9wIHBsYXlpbmcgYW55IGFjdGl2ZSBzb3VuZHMuXG4gICAgICB2YXIgc291bmRzID0gc2VsZi5fc291bmRzO1xuICAgICAgZm9yICh2YXIgaT0wOyBpPHNvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBTdG9wIHRoZSBzb3VuZCBpZiBpdCBpcyBjdXJyZW50bHkgcGxheWluZy5cbiAgICAgICAgaWYgKCFzb3VuZHNbaV0uX3BhdXNlZCkge1xuICAgICAgICAgIHNlbGYuc3RvcChzb3VuZHNbaV0uX2lkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgc291cmNlIG9yIGRpc2Nvbm5lY3QuXG4gICAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAvLyBTZXQgdGhlIHNvdXJjZSB0byAwLXNlY29uZCBzaWxlbmNlIHRvIHN0b3AgYW55IGRvd25sb2FkaW5nIChleGNlcHQgaW4gSUUpLlxuICAgICAgICAgIHNlbGYuX2NsZWFyU291bmQoc291bmRzW2ldLl9ub2RlKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSBhbnkgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAgICAgIHNvdW5kc1tpXS5fbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHNvdW5kc1tpXS5fZXJyb3JGbiwgZmFsc2UpO1xuICAgICAgICAgIHNvdW5kc1tpXS5fbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKEhvd2xlci5fY2FuUGxheUV2ZW50LCBzb3VuZHNbaV0uX2xvYWRGbiwgZmFsc2UpO1xuXG4gICAgICAgICAgLy8gUmVsZWFzZSB0aGUgQXVkaW8gb2JqZWN0IGJhY2sgdG8gdGhlIHBvb2wuXG4gICAgICAgICAgSG93bGVyLl9yZWxlYXNlSHRtbDVBdWRpbyhzb3VuZHNbaV0uX25vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW1wdHkgb3V0IGFsbCBvZiB0aGUgbm9kZXMuXG4gICAgICAgIGRlbGV0ZSBzb3VuZHNbaV0uX25vZGU7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIGFsbCB0aW1lcnMgYXJlIGNsZWFyZWQgb3V0LlxuICAgICAgICBzZWxmLl9jbGVhclRpbWVyKHNvdW5kc1tpXS5faWQpO1xuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgdGhlIHJlZmVyZW5jZXMgaW4gdGhlIGdsb2JhbCBIb3dsZXIgb2JqZWN0LlxuICAgICAgdmFyIGluZGV4ID0gSG93bGVyLl9ob3dscy5pbmRleE9mKHNlbGYpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgSG93bGVyLl9ob3dscy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBEZWxldGUgdGhpcyBzb3VuZCBmcm9tIHRoZSBjYWNoZSAoaWYgbm8gb3RoZXIgSG93bCBpcyB1c2luZyBpdCkuXG4gICAgICB2YXIgcmVtQ2FjaGUgPSB0cnVlO1xuICAgICAgZm9yIChpPTA7IGk8SG93bGVyLl9ob3dscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoSG93bGVyLl9ob3dsc1tpXS5fc3JjID09PSBzZWxmLl9zcmMgfHwgc2VsZi5fc3JjLmluZGV4T2YoSG93bGVyLl9ob3dsc1tpXS5fc3JjKSA+PSAwKSB7XG4gICAgICAgICAgcmVtQ2FjaGUgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2FjaGUgJiYgcmVtQ2FjaGUpIHtcbiAgICAgICAgZGVsZXRlIGNhY2hlW3NlbGYuX3NyY107XG4gICAgICB9XG5cbiAgICAgIC8vIENsZWFyIGdsb2JhbCBlcnJvcnMuXG4gICAgICBIb3dsZXIubm9BdWRpbyA9IGZhbHNlO1xuXG4gICAgICAvLyBDbGVhciBvdXQgYHNlbGZgLlxuICAgICAgc2VsZi5fc3RhdGUgPSAndW5sb2FkZWQnO1xuICAgICAgc2VsZi5fc291bmRzID0gW107XG4gICAgICBzZWxmID0gbnVsbDtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExpc3RlbiB0byBhIGN1c3RvbSBldmVudC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgZXZlbnQgRXZlbnQgbmFtZS5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gICAgTGlzdGVuZXIgdG8gY2FsbC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgaWQgICAgKG9wdGlvbmFsKSBPbmx5IGxpc3RlbiB0byBldmVudHMgZm9yIHRoaXMgc291bmQuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSAgIG9uY2UgIChJTlRFUk5BTCkgTWFya3MgZXZlbnQgdG8gZmlyZSBvbmx5IG9uY2UuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24oZXZlbnQsIGZuLCBpZCwgb25jZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGV2ZW50cyA9IHNlbGZbJ19vbicgKyBldmVudF07XG5cbiAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZXZlbnRzLnB1c2gob25jZSA/IHtpZDogaWQsIGZuOiBmbiwgb25jZTogb25jZX0gOiB7aWQ6IGlkLCBmbjogZm59KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIGN1c3RvbSBldmVudC4gQ2FsbCB3aXRob3V0IHBhcmFtZXRlcnMgdG8gcmVtb3ZlIGFsbCBldmVudHMuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGV2ZW50IEV2ZW50IG5hbWUuXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgIExpc3RlbmVyIHRvIHJlbW92ZS4gTGVhdmUgZW1wdHkgdG8gcmVtb3ZlIGFsbC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgaWQgICAgKG9wdGlvbmFsKSBPbmx5IHJlbW92ZSBldmVudHMgZm9yIHRoaXMgc291bmQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50LCBmbiwgaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSBzZWxmWydfb24nICsgZXZlbnRdO1xuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAvLyBBbGxvdyBwYXNzaW5nIGp1c3QgYW4gZXZlbnQgYW5kIElELlxuICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWQgPSBmbjtcbiAgICAgICAgZm4gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoZm4gfHwgaWQpIHtcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGV2ZW50IHN0b3JlIGFuZCByZW1vdmUgdGhlIHBhc3NlZCBmdW5jdGlvbi5cbiAgICAgICAgZm9yIChpPTA7IGk8ZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGlzSWQgPSAoaWQgPT09IGV2ZW50c1tpXS5pZCk7XG4gICAgICAgICAgaWYgKGZuID09PSBldmVudHNbaV0uZm4gJiYgaXNJZCB8fCAhZm4gJiYgaXNJZCkge1xuICAgICAgICAgICAgZXZlbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChldmVudCkge1xuICAgICAgICAvLyBDbGVhciBvdXQgYWxsIGV2ZW50cyBvZiB0aGlzIHR5cGUuXG4gICAgICAgIHNlbGZbJ19vbicgKyBldmVudF0gPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENsZWFyIG91dCBhbGwgZXZlbnRzIG9mIGV2ZXJ5IHR5cGUuXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoc2VsZik7XG4gICAgICAgIGZvciAoaT0wOyBpPGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoKGtleXNbaV0uaW5kZXhPZignX29uJykgPT09IDApICYmIEFycmF5LmlzQXJyYXkoc2VsZltrZXlzW2ldXSkpIHtcbiAgICAgICAgICAgIHNlbGZba2V5c1tpXV0gPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExpc3RlbiB0byBhIGN1c3RvbSBldmVudCBhbmQgcmVtb3ZlIGl0IG9uY2UgZmlyZWQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGV2ZW50IEV2ZW50IG5hbWUuXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgIExpc3RlbmVyIHRvIGNhbGwuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSAgIGlkICAgIChvcHRpb25hbCkgT25seSBsaXN0ZW4gdG8gZXZlbnRzIGZvciB0aGlzIHNvdW5kLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgb25jZTogZnVuY3Rpb24oZXZlbnQsIGZuLCBpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBTZXR1cCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBzZWxmLm9uKGV2ZW50LCBmbiwgaWQsIDEpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW1pdCBhbGwgZXZlbnRzIG9mIGEgc3BlY2lmaWMgdHlwZSBhbmQgcGFzcyB0aGUgc291bmQgaWQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBldmVudCBFdmVudCBuYW1lLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgICAgU291bmQgSUQuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBtc2cgICBNZXNzYWdlIHRvIGdvIHdpdGggZXZlbnQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBfZW1pdDogZnVuY3Rpb24oZXZlbnQsIGlkLCBtc2cpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSBzZWxmWydfb24nICsgZXZlbnRdO1xuXG4gICAgICAvLyBMb29wIHRocm91Z2ggZXZlbnQgc3RvcmUgYW5kIGZpcmUgYWxsIGZ1bmN0aW9ucy5cbiAgICAgIGZvciAodmFyIGk9ZXZlbnRzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcbiAgICAgICAgLy8gT25seSBmaXJlIHRoZSBsaXN0ZW5lciBpZiB0aGUgY29ycmVjdCBJRCBpcyB1c2VkLlxuICAgICAgICBpZiAoIWV2ZW50c1tpXS5pZCB8fCBldmVudHNbaV0uaWQgPT09IGlkIHx8IGV2ZW50ID09PSAnbG9hZCcpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGlkLCBtc2cpO1xuICAgICAgICAgIH0uYmluZChzZWxmLCBldmVudHNbaV0uZm4pLCAwKTtcblxuICAgICAgICAgIC8vIElmIHRoaXMgZXZlbnQgd2FzIHNldHVwIHdpdGggYG9uY2VgLCByZW1vdmUgaXQuXG4gICAgICAgICAgaWYgKGV2ZW50c1tpXS5vbmNlKSB7XG4gICAgICAgICAgICBzZWxmLm9mZihldmVudCwgZXZlbnRzW2ldLmZuLCBldmVudHNbaV0uaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBQYXNzIHRoZSBldmVudCB0eXBlIGludG8gbG9hZCBxdWV1ZSBzbyB0aGF0IGl0IGNhbiBjb250aW51ZSBzdGVwcGluZy5cbiAgICAgIHNlbGYuX2xvYWRRdWV1ZShldmVudCk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBRdWV1ZSBvZiBhY3Rpb25zIGluaXRpYXRlZCBiZWZvcmUgdGhlIHNvdW5kIGhhcyBsb2FkZWQuXG4gICAgICogVGhlc2Ugd2lsbCBiZSBjYWxsZWQgaW4gc2VxdWVuY2UsIHdpdGggdGhlIG5leHQgb25seSBmaXJpbmdcbiAgICAgKiBhZnRlciB0aGUgcHJldmlvdXMgaGFzIGZpbmlzaGVkIGV4ZWN1dGluZyAoZXZlbiBpZiBhc3luYyBsaWtlIHBsYXkpLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgX2xvYWRRdWV1ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHNlbGYuX3F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHRhc2sgPSBzZWxmLl9xdWV1ZVswXTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhpcyB0YXNrIGlmIGEgbWF0Y2hpbmcgZXZlbnQgd2FzIHBhc3NlZC5cbiAgICAgICAgaWYgKHRhc2suZXZlbnQgPT09IGV2ZW50KSB7XG4gICAgICAgICAgc2VsZi5fcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICBzZWxmLl9sb2FkUXVldWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJ1biB0aGUgdGFzayBpZiBubyBldmVudCB0eXBlIGlzIHBhc3NlZC5cbiAgICAgICAgaWYgKCFldmVudCkge1xuICAgICAgICAgIHRhc2suYWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmVkIHdoZW4gcGxheWJhY2sgZW5kcyBhdCB0aGUgZW5kIG9mIHRoZSBkdXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gIHtTb3VuZH0gc291bmQgVGhlIHNvdW5kIG9iamVjdCB0byB3b3JrIHdpdGguXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBfZW5kZWQ6IGZ1bmN0aW9uKHNvdW5kKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgc3ByaXRlID0gc291bmQuX3Nwcml0ZTtcblxuICAgICAgLy8gSWYgd2UgYXJlIHVzaW5nIElFIGFuZCB0aGVyZSB3YXMgbmV0d29yayBsYXRlbmN5IHdlIG1heSBiZSBjbGlwcGluZ1xuICAgICAgLy8gYXVkaW8gYmVmb3JlIGl0IGNvbXBsZXRlcyBwbGF5aW5nLiBMZXRzIGNoZWNrIHRoZSBub2RlIHRvIG1ha2Ugc3VyZSBpdFxuICAgICAgLy8gYmVsaWV2ZXMgaXQgaGFzIGNvbXBsZXRlZCwgYmVmb3JlIGVuZGluZyB0aGUgcGxheWJhY2suXG4gICAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvICYmIHNvdW5kLl9ub2RlICYmICFzb3VuZC5fbm9kZS5wYXVzZWQgJiYgIXNvdW5kLl9ub2RlLmVuZGVkICYmIHNvdW5kLl9ub2RlLmN1cnJlbnRUaW1lIDwgc291bmQuX3N0b3ApIHtcbiAgICAgICAgc2V0VGltZW91dChzZWxmLl9lbmRlZC5iaW5kKHNlbGYsIHNvdW5kKSwgMTAwKTtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIFNob3VsZCB0aGlzIHNvdW5kIGxvb3A/XG4gICAgICB2YXIgbG9vcCA9ICEhKHNvdW5kLl9sb29wIHx8IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzJdKTtcblxuICAgICAgLy8gRmlyZSB0aGUgZW5kZWQgZXZlbnQuXG4gICAgICBzZWxmLl9lbWl0KCdlbmQnLCBzb3VuZC5faWQpO1xuXG4gICAgICAvLyBSZXN0YXJ0IHRoZSBwbGF5YmFjayBmb3IgSFRNTDUgQXVkaW8gbG9vcC5cbiAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8gJiYgbG9vcCkge1xuICAgICAgICBzZWxmLnN0b3Aoc291bmQuX2lkLCB0cnVlKS5wbGF5KHNvdW5kLl9pZCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlc3RhcnQgdGhpcyB0aW1lciBpZiBvbiBhIFdlYiBBdWRpbyBsb29wLlxuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmIGxvb3ApIHtcbiAgICAgICAgc2VsZi5fZW1pdCgncGxheScsIHNvdW5kLl9pZCk7XG4gICAgICAgIHNvdW5kLl9zZWVrID0gc291bmQuX3N0YXJ0IHx8IDA7XG4gICAgICAgIHNvdW5kLl9yYXRlU2VlayA9IDA7XG4gICAgICAgIHNvdW5kLl9wbGF5U3RhcnQgPSBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lO1xuXG4gICAgICAgIHZhciB0aW1lb3V0ID0gKChzb3VuZC5fc3RvcCAtIHNvdW5kLl9zdGFydCkgKiAxMDAwKSAvIE1hdGguYWJzKHNvdW5kLl9yYXRlKTtcbiAgICAgICAgc2VsZi5fZW5kVGltZXJzW3NvdW5kLl9pZF0gPSBzZXRUaW1lb3V0KHNlbGYuX2VuZGVkLmJpbmQoc2VsZiwgc291bmQpLCB0aW1lb3V0KTtcbiAgICAgIH1cblxuICAgICAgLy8gTWFyayB0aGUgbm9kZSBhcyBwYXVzZWQuXG4gICAgICBpZiAoc2VsZi5fd2ViQXVkaW8gJiYgIWxvb3ApIHtcbiAgICAgICAgc291bmQuX3BhdXNlZCA9IHRydWU7XG4gICAgICAgIHNvdW5kLl9lbmRlZCA9IHRydWU7XG4gICAgICAgIHNvdW5kLl9zZWVrID0gc291bmQuX3N0YXJ0IHx8IDA7XG4gICAgICAgIHNvdW5kLl9yYXRlU2VlayA9IDA7XG4gICAgICAgIHNlbGYuX2NsZWFyVGltZXIoc291bmQuX2lkKTtcblxuICAgICAgICAvLyBDbGVhbiB1cCB0aGUgYnVmZmVyIHNvdXJjZS5cbiAgICAgICAgc2VsZi5fY2xlYW5CdWZmZXIoc291bmQuX25vZGUpO1xuXG4gICAgICAgIC8vIEF0dGVtcHQgdG8gYXV0by1zdXNwZW5kIEF1ZGlvQ29udGV4dCBpZiBubyBzb3VuZHMgYXJlIHN0aWxsIHBsYXlpbmcuXG4gICAgICAgIEhvd2xlci5fYXV0b1N1c3BlbmQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2hlbiB1c2luZyBhIHNwcml0ZSwgZW5kIHRoZSB0cmFjay5cbiAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8gJiYgIWxvb3ApIHtcbiAgICAgICAgc2VsZi5zdG9wKHNvdW5kLl9pZCwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciB0aGUgZW5kIHRpbWVyIGZvciBhIHNvdW5kIHBsYXliYWNrLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgVGhlIHNvdW5kIElELlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgX2NsZWFyVGltZXI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChzZWxmLl9lbmRUaW1lcnNbaWRdKSB7XG4gICAgICAgIC8vIENsZWFyIHRoZSB0aW1lb3V0IG9yIHJlbW92ZSB0aGUgZW5kZWQgbGlzdGVuZXIuXG4gICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fZW5kVGltZXJzW2lkXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLl9lbmRUaW1lcnNbaWRdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWQpO1xuICAgICAgICAgIGlmIChzb3VuZCAmJiBzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgc291bmQuX25vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBzZWxmLl9lbmRUaW1lcnNbaWRdLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGVsZXRlIHNlbGYuX2VuZFRpbWVyc1tpZF07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHNvdW5kIGlkZW50aWZpZWQgYnkgdGhpcyBJRCwgb3IgcmV0dXJuIG51bGwuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCBTb3VuZCBJRFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gICAgU291bmQgb2JqZWN0IG9yIG51bGwuXG4gICAgICovXG4gICAgX3NvdW5kQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBzb3VuZHMgYW5kIGZpbmQgdGhlIG9uZSB3aXRoIHRoaXMgSUQuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpZCA9PT0gc2VsZi5fc291bmRzW2ldLl9pZCkge1xuICAgICAgICAgIHJldHVybiBzZWxmLl9zb3VuZHNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhbiBpbmFjdGl2ZSBzb3VuZCBmcm9tIHRoZSBwb29sIG9yIGNyZWF0ZSBhIG5ldyBvbmUuXG4gICAgICogQHJldHVybiB7U291bmR9IFNvdW5kIHBsYXliYWNrIG9iamVjdC5cbiAgICAgKi9cbiAgICBfaW5hY3RpdmVTb3VuZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHNlbGYuX2RyYWluKCk7XG5cbiAgICAgIC8vIEZpbmQgdGhlIGZpcnN0IGluYWN0aXZlIG5vZGUgdG8gcmVjeWNsZS5cbiAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9zb3VuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX3NvdW5kc1tpXS5fZW5kZWQpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5fc291bmRzW2ldLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbm8gaW5hY3RpdmUgbm9kZSB3YXMgZm91bmQsIGNyZWF0ZSBhIG5ldyBvbmUuXG4gICAgICByZXR1cm4gbmV3IFNvdW5kKHNlbGYpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEcmFpbiBleGNlc3MgaW5hY3RpdmUgc291bmRzIGZyb20gdGhlIHBvb2wuXG4gICAgICovXG4gICAgX2RyYWluOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBsaW1pdCA9IHNlbGYuX3Bvb2w7XG4gICAgICB2YXIgY250ID0gMDtcbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIGxlc3Mgc291bmRzIHRoYW4gdGhlIG1heCBwb29sIHNpemUsIHdlIGFyZSBkb25lLlxuICAgICAgaWYgKHNlbGYuX3NvdW5kcy5sZW5ndGggPCBsaW1pdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENvdW50IHRoZSBudW1iZXIgb2YgaW5hY3RpdmUgc291bmRzLlxuICAgICAgZm9yIChpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9zb3VuZHNbaV0uX2VuZGVkKSB7XG4gICAgICAgICAgY250Kys7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIGV4Y2VzcyBpbmFjdGl2ZSBzb3VuZHMsIGdvaW5nIGluIHJldmVyc2Ugb3JkZXIuXG4gICAgICBmb3IgKGk9c2VsZi5fc291bmRzLmxlbmd0aCAtIDE7IGk+PTA7IGktLSkge1xuICAgICAgICBpZiAoY250IDw9IGxpbWl0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYuX3NvdW5kc1tpXS5fZW5kZWQpIHtcbiAgICAgICAgICAvLyBEaXNjb25uZWN0IHRoZSBhdWRpbyBzb3VyY2Ugd2hlbiB1c2luZyBXZWIgQXVkaW8uXG4gICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmIHNlbGYuX3NvdW5kc1tpXS5fbm9kZSkge1xuICAgICAgICAgICAgc2VsZi5fc291bmRzW2ldLl9ub2RlLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVtb3ZlIHNvdW5kcyB1bnRpbCB3ZSBoYXZlIHRoZSBwb29sIHNpemUuXG4gICAgICAgICAgc2VsZi5fc291bmRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBjbnQtLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIElEJ3MgZnJvbSB0aGUgc291bmRzIHBvb2wuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCBPbmx5IHJldHVybiBvbmUgSUQgaWYgb25lIGlzIHBhc3NlZC5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gICAgQXJyYXkgb2YgSURzLlxuICAgICAqL1xuICAgIF9nZXRTb3VuZElkczogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIGlkcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWRzLnB1c2goc2VsZi5fc291bmRzW2ldLl9pZCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaWRzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtpZF07XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgdGhlIHNvdW5kIGJhY2sgaW50byB0aGUgYnVmZmVyIHNvdXJjZS5cbiAgICAgKiBAcGFyYW0gIHtTb3VuZH0gc291bmQgVGhlIHNvdW5kIG9iamVjdCB0byB3b3JrIHdpdGguXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBfcmVmcmVzaEJ1ZmZlcjogZnVuY3Rpb24oc291bmQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gU2V0dXAgdGhlIGJ1ZmZlciBzb3VyY2UgZm9yIHBsYXliYWNrLlxuICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlID0gSG93bGVyLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5idWZmZXIgPSBjYWNoZVtzZWxmLl9zcmNdO1xuXG4gICAgICAvLyBDb25uZWN0IHRvIHRoZSBjb3JyZWN0IG5vZGUuXG4gICAgICBpZiAoc291bmQuX3Bhbm5lcikge1xuICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UuY29ubmVjdChzb3VuZC5fcGFubmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5jb25uZWN0KHNvdW5kLl9ub2RlKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2V0dXAgbG9vcGluZyBhbmQgcGxheWJhY2sgcmF0ZS5cbiAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5sb29wID0gc291bmQuX2xvb3A7XG4gICAgICBpZiAoc291bmQuX2xvb3ApIHtcbiAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IHNvdW5kLl9zdGFydCB8fCAwO1xuICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UubG9vcEVuZCA9IHNvdW5kLl9zdG9wIHx8IDA7XG4gICAgICB9XG4gICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKHNvdW5kLl9yYXRlLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByZXZlbnQgbWVtb3J5IGxlYWtzIGJ5IGNsZWFuaW5nIHVwIHRoZSBidWZmZXIgc291cmNlIGFmdGVyIHBsYXliYWNrLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gbm9kZSBTb3VuZCdzIGF1ZGlvIG5vZGUgY29udGFpbmluZyB0aGUgYnVmZmVyIHNvdXJjZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIF9jbGVhbkJ1ZmZlcjogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGlzSU9TID0gSG93bGVyLl9uYXZpZ2F0b3IgJiYgSG93bGVyLl9uYXZpZ2F0b3IudmVuZG9yLmluZGV4T2YoJ0FwcGxlJykgPj0gMDtcblxuICAgICAgaWYgKEhvd2xlci5fc2NyYXRjaEJ1ZmZlciAmJiBub2RlLmJ1ZmZlclNvdXJjZSkge1xuICAgICAgICBub2RlLmJ1ZmZlclNvdXJjZS5vbmVuZGVkID0gbnVsbDtcbiAgICAgICAgbm9kZS5idWZmZXJTb3VyY2UuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgaWYgKGlzSU9TKSB7XG4gICAgICAgICAgdHJ5IHsgbm9kZS5idWZmZXJTb3VyY2UuYnVmZmVyID0gSG93bGVyLl9zY3JhdGNoQnVmZmVyOyB9IGNhdGNoKGUpIHt9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vZGUuYnVmZmVyU291cmNlID0gbnVsbDtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgc291cmNlIHRvIGEgMC1zZWNvbmQgc2lsZW5jZSB0byBzdG9wIGFueSBkb3dubG9hZGluZyAoZXhjZXB0IGluIElFKS5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG5vZGUgQXVkaW8gbm9kZSB0byBjbGVhci5cbiAgICAgKi9cbiAgICBfY2xlYXJTb3VuZDogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIGNoZWNrSUUgPSAvTVNJRSB8VHJpZGVudFxcLy8udGVzdChIb3dsZXIuX25hdmlnYXRvciAmJiBIb3dsZXIuX25hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgaWYgKCFjaGVja0lFKSB7XG4gICAgICAgIG5vZGUuc3JjID0gJ2RhdGE6YXVkaW8vd2F2O2Jhc2U2NCxVa2xHUmlnQUFBQlhRVlpGWm0xMElCSUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFBQUJrWVhSaEFnQUFBQUVBJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqIFNpbmdsZSBTb3VuZCBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBTZXR1cCB0aGUgc291bmQgb2JqZWN0LCB3aGljaCBlYWNoIG5vZGUgYXR0YWNoZWQgdG8gYSBIb3dsIGdyb3VwIGlzIGNvbnRhaW5lZCBpbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IGhvd2wgVGhlIEhvd2wgcGFyZW50IGdyb3VwLlxuICAgKi9cbiAgdmFyIFNvdW5kID0gZnVuY3Rpb24oaG93bCkge1xuICAgIHRoaXMuX3BhcmVudCA9IGhvd2w7XG4gICAgdGhpcy5pbml0KCk7XG4gIH07XG4gIFNvdW5kLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGEgbmV3IFNvdW5kIG9iamVjdC5cbiAgICAgKiBAcmV0dXJuIHtTb3VuZH1cbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFNldHVwIHRoZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gICAgICBzZWxmLl9tdXRlZCA9IHBhcmVudC5fbXV0ZWQ7XG4gICAgICBzZWxmLl9sb29wID0gcGFyZW50Ll9sb29wO1xuICAgICAgc2VsZi5fdm9sdW1lID0gcGFyZW50Ll92b2x1bWU7XG4gICAgICBzZWxmLl9yYXRlID0gcGFyZW50Ll9yYXRlO1xuICAgICAgc2VsZi5fc2VlayA9IDA7XG4gICAgICBzZWxmLl9wYXVzZWQgPSB0cnVlO1xuICAgICAgc2VsZi5fZW5kZWQgPSB0cnVlO1xuICAgICAgc2VsZi5fc3ByaXRlID0gJ19fZGVmYXVsdCc7XG5cbiAgICAgIC8vIEdlbmVyYXRlIGEgdW5pcXVlIElEIGZvciB0aGlzIHNvdW5kLlxuICAgICAgc2VsZi5faWQgPSArK0hvd2xlci5fY291bnRlcjtcblxuICAgICAgLy8gQWRkIGl0c2VsZiB0byB0aGUgcGFyZW50J3MgcG9vbC5cbiAgICAgIHBhcmVudC5fc291bmRzLnB1c2goc2VsZik7XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgbmV3IG5vZGUuXG4gICAgICBzZWxmLmNyZWF0ZSgpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuZCBzZXR1cCBhIG5ldyBzb3VuZCBvYmplY3QsIHdoZXRoZXIgSFRNTDUgQXVkaW8gb3IgV2ViIEF1ZGlvLlxuICAgICAqIEByZXR1cm4ge1NvdW5kfVxuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgcGFyZW50ID0gc2VsZi5fcGFyZW50O1xuICAgICAgdmFyIHZvbHVtZSA9IChIb3dsZXIuX211dGVkIHx8IHNlbGYuX211dGVkIHx8IHNlbGYuX3BhcmVudC5fbXV0ZWQpID8gMCA6IHNlbGYuX3ZvbHVtZTtcblxuICAgICAgaWYgKHBhcmVudC5fd2ViQXVkaW8pIHtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnYWluIG5vZGUgZm9yIGNvbnRyb2xsaW5nIHZvbHVtZSAodGhlIHNvdXJjZSB3aWxsIGNvbm5lY3QgdG8gdGhpcykuXG4gICAgICAgIHNlbGYuX25vZGUgPSAodHlwZW9mIEhvd2xlci5jdHguY3JlYXRlR2FpbiA9PT0gJ3VuZGVmaW5lZCcpID8gSG93bGVyLmN0eC5jcmVhdGVHYWluTm9kZSgpIDogSG93bGVyLmN0eC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHNlbGYuX25vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh2b2x1bWUsIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgICBzZWxmLl9ub2RlLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIHNlbGYuX25vZGUuY29ubmVjdChIb3dsZXIubWFzdGVyR2Fpbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBHZXQgYW4gdW5sb2NrZWQgQXVkaW8gb2JqZWN0IGZyb20gdGhlIHBvb2wuXG4gICAgICAgIHNlbGYuX25vZGUgPSBIb3dsZXIuX29idGFpbkh0bWw1QXVkaW8oKTtcblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGVycm9ycyAoaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy1hdXRob3Itdmlldy9zcGVjLmh0bWwjbWVkaWFlcnJvcikuXG4gICAgICAgIHNlbGYuX2Vycm9yRm4gPSBzZWxmLl9lcnJvckxpc3RlbmVyLmJpbmQoc2VsZik7XG4gICAgICAgIHNlbGYuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBzZWxmLl9lcnJvckZuLCBmYWxzZSk7XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciAnY2FucGxheXRocm91Z2gnIGV2ZW50IHRvIGxldCB1cyBrbm93IHRoZSBzb3VuZCBpcyByZWFkeS5cbiAgICAgICAgc2VsZi5fbG9hZEZuID0gc2VsZi5fbG9hZExpc3RlbmVyLmJpbmQoc2VsZik7XG4gICAgICAgIHNlbGYuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcihIb3dsZXIuX2NhblBsYXlFdmVudCwgc2VsZi5fbG9hZEZuLCBmYWxzZSk7XG5cbiAgICAgICAgLy8gU2V0dXAgdGhlIG5ldyBhdWRpbyBub2RlLlxuICAgICAgICBzZWxmLl9ub2RlLnNyYyA9IHBhcmVudC5fc3JjO1xuICAgICAgICBzZWxmLl9ub2RlLnByZWxvYWQgPSAnYXV0byc7XG4gICAgICAgIHNlbGYuX25vZGUudm9sdW1lID0gdm9sdW1lICogSG93bGVyLnZvbHVtZSgpO1xuXG4gICAgICAgIC8vIEJlZ2luIGxvYWRpbmcgdGhlIHNvdXJjZS5cbiAgICAgICAgc2VsZi5fbm9kZS5sb2FkKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCB0aGUgcGFyYW1ldGVycyBvZiB0aGlzIHNvdW5kIHRvIHRoZSBvcmlnaW5hbCBzdGF0ZSAoZm9yIHJlY3ljbGUpLlxuICAgICAqIEByZXR1cm4ge1NvdW5kfVxuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFJlc2V0IGFsbCBvZiB0aGUgcGFyYW1ldGVycyBvZiB0aGlzIHNvdW5kLlxuICAgICAgc2VsZi5fbXV0ZWQgPSBwYXJlbnQuX211dGVkO1xuICAgICAgc2VsZi5fbG9vcCA9IHBhcmVudC5fbG9vcDtcbiAgICAgIHNlbGYuX3ZvbHVtZSA9IHBhcmVudC5fdm9sdW1lO1xuICAgICAgc2VsZi5fcmF0ZSA9IHBhcmVudC5fcmF0ZTtcbiAgICAgIHNlbGYuX3NlZWsgPSAwO1xuICAgICAgc2VsZi5fcmF0ZVNlZWsgPSAwO1xuICAgICAgc2VsZi5fcGF1c2VkID0gdHJ1ZTtcbiAgICAgIHNlbGYuX2VuZGVkID0gdHJ1ZTtcbiAgICAgIHNlbGYuX3Nwcml0ZSA9ICdfX2RlZmF1bHQnO1xuXG4gICAgICAvLyBHZW5lcmF0ZSBhIG5ldyBJRCBzbyB0aGF0IGl0IGlzbid0IGNvbmZ1c2VkIHdpdGggdGhlIHByZXZpb3VzIHNvdW5kLlxuICAgICAgc2VsZi5faWQgPSArK0hvd2xlci5fY291bnRlcjtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhUTUw1IEF1ZGlvIGVycm9yIGxpc3RlbmVyIGNhbGxiYWNrLlxuICAgICAqL1xuICAgIF9lcnJvckxpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gRmlyZSBhbiBlcnJvciBldmVudCBhbmQgcGFzcyBiYWNrIHRoZSBjb2RlLlxuICAgICAgc2VsZi5fcGFyZW50Ll9lbWl0KCdsb2FkZXJyb3InLCBzZWxmLl9pZCwgc2VsZi5fbm9kZS5lcnJvciA/IHNlbGYuX25vZGUuZXJyb3IuY29kZSA6IDApO1xuXG4gICAgICAvLyBDbGVhciB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBzZWxmLl9ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgc2VsZi5fZXJyb3JGbiwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIVE1MNSBBdWRpbyBjYW5wbGF5dGhyb3VnaCBsaXN0ZW5lciBjYWxsYmFjay5cbiAgICAgKi9cbiAgICBfbG9hZExpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFJvdW5kIHVwIHRoZSBkdXJhdGlvbiB0byBhY2NvdW50IGZvciB0aGUgbG93ZXIgcHJlY2lzaW9uIGluIEhUTUw1IEF1ZGlvLlxuICAgICAgcGFyZW50Ll9kdXJhdGlvbiA9IE1hdGguY2VpbChzZWxmLl9ub2RlLmR1cmF0aW9uICogMTApIC8gMTA7XG5cbiAgICAgIC8vIFNldHVwIGEgc3ByaXRlIGlmIG5vbmUgaXMgZGVmaW5lZC5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhwYXJlbnQuX3Nwcml0ZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHBhcmVudC5fc3ByaXRlID0ge19fZGVmYXVsdDogWzAsIHBhcmVudC5fZHVyYXRpb24gKiAxMDAwXX07XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJlbnQuX3N0YXRlICE9PSAnbG9hZGVkJykge1xuICAgICAgICBwYXJlbnQuX3N0YXRlID0gJ2xvYWRlZCc7XG4gICAgICAgIHBhcmVudC5fZW1pdCgnbG9hZCcpO1xuICAgICAgICBwYXJlbnQuX2xvYWRRdWV1ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBDbGVhciB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBzZWxmLl9ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoSG93bGVyLl9jYW5QbGF5RXZlbnQsIHNlbGYuX2xvYWRGbiwgZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICAvKiogSGVscGVyIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgdmFyIGNhY2hlID0ge307XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciBhIHNvdW5kIGZyb20gVVJMLCBEYXRhIFVSSSBvciBjYWNoZSBhbmQgZGVjb2RlIHRvIGF1ZGlvIHNvdXJjZSAoV2ViIEF1ZGlvIEFQSSkuXG4gICAqIEBwYXJhbSAge0hvd2x9IHNlbGZcbiAgICovXG4gIHZhciBsb2FkQnVmZmVyID0gZnVuY3Rpb24oc2VsZikge1xuICAgIHZhciB1cmwgPSBzZWxmLl9zcmM7XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgYnVmZmVyIGhhcyBhbHJlYWR5IGJlZW4gY2FjaGVkIGFuZCB1c2UgaXQgaW5zdGVhZC5cbiAgICBpZiAoY2FjaGVbdXJsXSkge1xuICAgICAgLy8gU2V0IHRoZSBkdXJhdGlvbiBmcm9tIHRoZSBjYWNoZS5cbiAgICAgIHNlbGYuX2R1cmF0aW9uID0gY2FjaGVbdXJsXS5kdXJhdGlvbjtcblxuICAgICAgLy8gTG9hZCB0aGUgc291bmQgaW50byB0aGlzIEhvd2wuXG4gICAgICBsb2FkU291bmQoc2VsZik7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoL15kYXRhOlteO10rO2Jhc2U2NCwvLnRlc3QodXJsKSkge1xuICAgICAgLy8gRGVjb2RlIHRoZSBiYXNlNjQgZGF0YSBVUkkgd2l0aG91dCBYSFIsIHNpbmNlIHNvbWUgYnJvd3NlcnMgZG9uJ3Qgc3VwcG9ydCBpdC5cbiAgICAgIHZhciBkYXRhID0gYXRvYih1cmwuc3BsaXQoJywnKVsxXSk7XG4gICAgICB2YXIgZGF0YVZpZXcgPSBuZXcgVWludDhBcnJheShkYXRhLmxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8ZGF0YS5sZW5ndGg7ICsraSkge1xuICAgICAgICBkYXRhVmlld1tpXSA9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgIH1cblxuICAgICAgZGVjb2RlQXVkaW9EYXRhKGRhdGFWaWV3LmJ1ZmZlciwgc2VsZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExvYWQgdGhlIGJ1ZmZlciBmcm9tIHRoZSBVUkwuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBzZWxmLl94aHJXaXRoQ3JlZGVudGlhbHM7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGdldCBhIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgYmFjay5cbiAgICAgICAgdmFyIGNvZGUgPSAoeGhyLnN0YXR1cyArICcnKVswXTtcbiAgICAgICAgaWYgKGNvZGUgIT09ICcwJyAmJiBjb2RlICE9PSAnMicgJiYgY29kZSAhPT0gJzMnKSB7XG4gICAgICAgICAgc2VsZi5fZW1pdCgnbG9hZGVycm9yJywgbnVsbCwgJ0ZhaWxlZCBsb2FkaW5nIGF1ZGlvIGZpbGUgd2l0aCBzdGF0dXM6ICcgKyB4aHIuc3RhdHVzICsgJy4nKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkZWNvZGVBdWRpb0RhdGEoeGhyLnJlc3BvbnNlLCBzZWxmKTtcbiAgICAgIH07XG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbiBlcnJvciwgc3dpdGNoIHRvIEhUTUw1IEF1ZGlvLlxuICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICBzZWxmLl9odG1sNSA9IHRydWU7XG4gICAgICAgICAgc2VsZi5fd2ViQXVkaW8gPSBmYWxzZTtcbiAgICAgICAgICBzZWxmLl9zb3VuZHMgPSBbXTtcbiAgICAgICAgICBkZWxldGUgY2FjaGVbdXJsXTtcbiAgICAgICAgICBzZWxmLmxvYWQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNhZmVYaHJTZW5kKHhocik7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIHRoZSBYSFIgcmVxdWVzdCB3cmFwcGVkIGluIGEgdHJ5L2NhdGNoLlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHhociBYSFIgdG8gc2VuZC5cbiAgICovXG4gIHZhciBzYWZlWGhyU2VuZCA9IGZ1bmN0aW9uKHhocikge1xuICAgIHRyeSB7XG4gICAgICB4aHIuc2VuZCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHhoci5vbmVycm9yKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEZWNvZGUgYXVkaW8gZGF0YSBmcm9tIGFuIGFycmF5IGJ1ZmZlci5cbiAgICogQHBhcmFtICB7QXJyYXlCdWZmZXJ9IGFycmF5YnVmZmVyIFRoZSBhdWRpbyBkYXRhLlxuICAgKiBAcGFyYW0gIHtIb3dsfSAgICAgICAgc2VsZlxuICAgKi9cbiAgdmFyIGRlY29kZUF1ZGlvRGF0YSA9IGZ1bmN0aW9uKGFycmF5YnVmZmVyLCBzZWxmKSB7XG4gICAgLy8gRmlyZSBhIGxvYWQgZXJyb3IgaWYgc29tZXRoaW5nIGJyb2tlLlxuICAgIHZhciBlcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5fZW1pdCgnbG9hZGVycm9yJywgbnVsbCwgJ0RlY29kaW5nIGF1ZGlvIGRhdGEgZmFpbGVkLicpO1xuICAgIH07XG5cbiAgICAvLyBMb2FkIHRoZSBzb3VuZCBvbiBzdWNjZXNzLlxuICAgIHZhciBzdWNjZXNzID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICBpZiAoYnVmZmVyICYmIHNlbGYuX3NvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNhY2hlW3NlbGYuX3NyY10gPSBidWZmZXI7XG4gICAgICAgIGxvYWRTb3VuZChzZWxmLCBidWZmZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJyb3IoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRGVjb2RlIHRoZSBidWZmZXIgaW50byBhbiBhdWRpbyBzb3VyY2UuXG4gICAgaWYgKHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJyAmJiBIb3dsZXIuY3R4LmRlY29kZUF1ZGlvRGF0YS5sZW5ndGggPT09IDEpIHtcbiAgICAgIEhvd2xlci5jdHguZGVjb2RlQXVkaW9EYXRhKGFycmF5YnVmZmVyKS50aGVuKHN1Y2Nlc3MpLmNhdGNoKGVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgSG93bGVyLmN0eC5kZWNvZGVBdWRpb0RhdGEoYXJyYXlidWZmZXIsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU291bmQgaXMgbm93IGxvYWRlZCwgc28gZmluaXNoIHNldHRpbmcgZXZlcnl0aGluZyB1cCBhbmQgZmlyZSB0aGUgbG9hZGVkIGV2ZW50LlxuICAgKiBAcGFyYW0gIHtIb3dsfSBzZWxmXG4gICAqIEBwYXJhbSAge09iamVjdH0gYnVmZmVyIFRoZSBkZWNvZGVkIGJ1ZmZlciBzb3VuZCBzb3VyY2UuXG4gICAqL1xuICB2YXIgbG9hZFNvdW5kID0gZnVuY3Rpb24oc2VsZiwgYnVmZmVyKSB7XG4gICAgLy8gU2V0IHRoZSBkdXJhdGlvbi5cbiAgICBpZiAoYnVmZmVyICYmICFzZWxmLl9kdXJhdGlvbikge1xuICAgICAgc2VsZi5fZHVyYXRpb24gPSBidWZmZXIuZHVyYXRpb247XG4gICAgfVxuXG4gICAgLy8gU2V0dXAgYSBzcHJpdGUgaWYgbm9uZSBpcyBkZWZpbmVkLlxuICAgIGlmIChPYmplY3Qua2V5cyhzZWxmLl9zcHJpdGUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgc2VsZi5fc3ByaXRlID0ge19fZGVmYXVsdDogWzAsIHNlbGYuX2R1cmF0aW9uICogMTAwMF19O1xuICAgIH1cblxuICAgIC8vIEZpcmUgdGhlIGxvYWRlZCBldmVudC5cbiAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICBzZWxmLl9zdGF0ZSA9ICdsb2FkZWQnO1xuICAgICAgc2VsZi5fZW1pdCgnbG9hZCcpO1xuICAgICAgc2VsZi5fbG9hZFF1ZXVlKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZXR1cCB0aGUgYXVkaW8gY29udGV4dCB3aGVuIGF2YWlsYWJsZSwgb3Igc3dpdGNoIHRvIEhUTUw1IEF1ZGlvIG1vZGUuXG4gICAqL1xuICB2YXIgc2V0dXBBdWRpb0NvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBJZiB3ZSBoYXZlIGFscmVhZHkgZGV0ZWN0ZWQgdGhhdCBXZWIgQXVkaW8gaXNuJ3Qgc3VwcG9ydGVkLCBkb24ndCBydW4gdGhpcyBzdGVwIGFnYWluLlxuICAgIGlmICghSG93bGVyLnVzaW5nV2ViQXVkaW8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB3ZSBhcmUgdXNpbmcgV2ViIEF1ZGlvIGFuZCBzZXR1cCB0aGUgQXVkaW9Db250ZXh0IGlmIHdlIGFyZS5cbiAgICB0cnkge1xuICAgICAgaWYgKHR5cGVvZiBBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIEhvd2xlci5jdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3ZWJraXRBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIEhvd2xlci5jdHggPSBuZXcgd2Via2l0QXVkaW9Db250ZXh0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBIb3dsZXIudXNpbmdXZWJBdWRpbyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgSG93bGVyLnVzaW5nV2ViQXVkaW8gPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgYXVkaW8gY29udGV4dCBjcmVhdGlvbiBzdGlsbCBmYWlsZWQsIHNldCB1c2luZyB3ZWIgYXVkaW8gdG8gZmFsc2UuXG4gICAgaWYgKCFIb3dsZXIuY3R4KSB7XG4gICAgICBIb3dsZXIudXNpbmdXZWJBdWRpbyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGEgd2VidmlldyBpcyBiZWluZyB1c2VkIG9uIGlPUzggb3IgZWFybGllciAocmF0aGVyIHRoYW4gdGhlIGJyb3dzZXIpLlxuICAgIC8vIElmIGl0IGlzLCBkaXNhYmxlIFdlYiBBdWRpbyBhcyBpdCBjYXVzZXMgY3Jhc2hpbmcuXG4gICAgdmFyIGlPUyA9ICgvaVAoaG9uZXxvZHxhZCkvLnRlc3QoSG93bGVyLl9uYXZpZ2F0b3IgJiYgSG93bGVyLl9uYXZpZ2F0b3IucGxhdGZvcm0pKTtcbiAgICB2YXIgYXBwVmVyc2lvbiA9IEhvd2xlci5fbmF2aWdhdG9yICYmIEhvd2xlci5fbmF2aWdhdG9yLmFwcFZlcnNpb24ubWF0Y2goL09TIChcXGQrKV8oXFxkKylfPyhcXGQrKT8vKTtcbiAgICB2YXIgdmVyc2lvbiA9IGFwcFZlcnNpb24gPyBwYXJzZUludChhcHBWZXJzaW9uWzFdLCAxMCkgOiBudWxsO1xuICAgIGlmIChpT1MgJiYgdmVyc2lvbiAmJiB2ZXJzaW9uIDwgOSkge1xuICAgICAgdmFyIHNhZmFyaSA9IC9zYWZhcmkvLnRlc3QoSG93bGVyLl9uYXZpZ2F0b3IgJiYgSG93bGVyLl9uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKEhvd2xlci5fbmF2aWdhdG9yICYmIEhvd2xlci5fbmF2aWdhdG9yLnN0YW5kYWxvbmUgJiYgIXNhZmFyaSB8fCBIb3dsZXIuX25hdmlnYXRvciAmJiAhSG93bGVyLl9uYXZpZ2F0b3Iuc3RhbmRhbG9uZSAmJiAhc2FmYXJpKSB7XG4gICAgICAgIEhvd2xlci51c2luZ1dlYkF1ZGlvID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuZCBleHBvc2UgdGhlIG1hc3RlciBHYWluTm9kZSB3aGVuIHVzaW5nIFdlYiBBdWRpbyAodXNlZnVsIGZvciBwbHVnaW5zIG9yIGFkdmFuY2VkIHVzYWdlKS5cbiAgICBpZiAoSG93bGVyLnVzaW5nV2ViQXVkaW8pIHtcbiAgICAgIEhvd2xlci5tYXN0ZXJHYWluID0gKHR5cGVvZiBIb3dsZXIuY3R4LmNyZWF0ZUdhaW4gPT09ICd1bmRlZmluZWQnKSA/IEhvd2xlci5jdHguY3JlYXRlR2Fpbk5vZGUoKSA6IEhvd2xlci5jdHguY3JlYXRlR2FpbigpO1xuICAgICAgSG93bGVyLm1hc3RlckdhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZShIb3dsZXIuX211dGVkID8gMCA6IDEsIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgSG93bGVyLm1hc3RlckdhaW4uY29ubmVjdChIb3dsZXIuY3R4LmRlc3RpbmF0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBSZS1ydW4gdGhlIHNldHVwIG9uIEhvd2xlci5cbiAgICBIb3dsZXIuX3NldHVwKCk7XG4gIH07XG5cbiAgLy8gQWRkIHN1cHBvcnQgZm9yIEFNRCAoQXN5bmNocm9ub3VzIE1vZHVsZSBEZWZpbml0aW9uKSBsaWJyYXJpZXMgc3VjaCBhcyByZXF1aXJlLmpzLlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIEhvd2xlcjogSG93bGVyLFxuICAgICAgICBIb3dsOiBIb3dsXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQWRkIHN1cHBvcnQgZm9yIENvbW1vbkpTIGxpYnJhcmllcyBzdWNoIGFzIGJyb3dzZXJpZnkuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLkhvd2xlciA9IEhvd2xlcjtcbiAgICBleHBvcnRzLkhvd2wgPSBIb3dsO1xuICB9XG5cbiAgLy8gRGVmaW5lIGdsb2JhbGx5IGluIGNhc2UgQU1EIGlzIG5vdCBhdmFpbGFibGUgb3IgdW51c2VkLlxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB3aW5kb3cuSG93bGVyR2xvYmFsID0gSG93bGVyR2xvYmFsO1xuICAgIHdpbmRvdy5Ib3dsZXIgPSBIb3dsZXI7XG4gICAgd2luZG93Lkhvd2wgPSBIb3dsO1xuICAgIHdpbmRvdy5Tb3VuZCA9IFNvdW5kO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7IC8vIEFkZCB0byBnbG9iYWwgaW4gTm9kZS5qcyAoZm9yIHRlc3RpbmcsIGV0YykuXG4gICAgZ2xvYmFsLkhvd2xlckdsb2JhbCA9IEhvd2xlckdsb2JhbDtcbiAgICBnbG9iYWwuSG93bGVyID0gSG93bGVyO1xuICAgIGdsb2JhbC5Ib3dsID0gSG93bDtcbiAgICBnbG9iYWwuU291bmQgPSBTb3VuZDtcbiAgfVxufSkoKTtcblxuXG4vKiFcbiAqICBTcGF0aWFsIFBsdWdpbiAtIEFkZHMgc3VwcG9ydCBmb3Igc3RlcmVvIGFuZCAzRCBhdWRpbyB3aGVyZSBXZWIgQXVkaW8gaXMgc3VwcG9ydGVkLlxuICogIFxuICogIGhvd2xlci5qcyB2Mi4xLjJcbiAqICBob3dsZXJqcy5jb21cbiAqXG4gKiAgKGMpIDIwMTMtMjAxOSwgSmFtZXMgU2ltcHNvbiBvZiBHb2xkRmlyZSBTdHVkaW9zXG4gKiAgZ29sZGZpcmVzdHVkaW9zLmNvbVxuICpcbiAqICBNSVQgTGljZW5zZVxuICovXG5cbihmdW5jdGlvbigpIHtcblxuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gU2V0dXAgZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBIb3dsZXJHbG9iYWwucHJvdG90eXBlLl9wb3MgPSBbMCwgMCwgMF07XG4gIEhvd2xlckdsb2JhbC5wcm90b3R5cGUuX29yaWVudGF0aW9uID0gWzAsIDAsIC0xLCAwLCAxLCAwXTtcblxuICAvKiogR2xvYmFsIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gdXBkYXRlIHRoZSBzdGVyZW8gcGFubmluZyBwb3NpdGlvbiBvZiBhbGwgY3VycmVudCBIb3dscy5cbiAgICogRnV0dXJlIEhvd2xzIHdpbGwgbm90IHVzZSB0aGlzIHZhbHVlIHVubGVzcyBleHBsaWNpdGx5IHNldC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBwYW4gQSB2YWx1ZSBvZiAtMS4wIGlzIGFsbCB0aGUgd2F5IGxlZnQgYW5kIDEuMCBpcyBhbGwgdGhlIHdheSByaWdodC5cbiAgICogQHJldHVybiB7SG93bGVyL051bWJlcn0gICAgIFNlbGYgb3IgY3VycmVudCBzdGVyZW8gcGFubmluZyB2YWx1ZS5cbiAgICovXG4gIEhvd2xlckdsb2JhbC5wcm90b3R5cGUuc3RlcmVvID0gZnVuY3Rpb24ocGFuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gU3RvcCByaWdodCBoZXJlIGlmIG5vdCB1c2luZyBXZWIgQXVkaW8uXG4gICAgaWYgKCFzZWxmLmN0eCB8fCAhc2VsZi5jdHgubGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgSG93bHMgYW5kIHVwZGF0ZSB0aGVpciBzdGVyZW8gcGFubmluZy5cbiAgICBmb3IgKHZhciBpPXNlbGYuX2hvd2xzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcbiAgICAgIHNlbGYuX2hvd2xzW2ldLnN0ZXJlbyhwYW4pO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbGlzdGVuZXIgaW4gM0QgY2FydGVzaWFuIHNwYWNlLiBTb3VuZHMgdXNpbmdcbiAgICogM0QgcG9zaXRpb24gd2lsbCBiZSByZWxhdGl2ZSB0byB0aGUgbGlzdGVuZXIncyBwb3NpdGlvbi5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB4IFRoZSB4LXBvc2l0aW9uIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB5IFRoZSB5LXBvc2l0aW9uIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB6IFRoZSB6LXBvc2l0aW9uIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHJldHVybiB7SG93bGVyL0FycmF5fSAgIFNlbGYgb3IgY3VycmVudCBsaXN0ZW5lciBwb3NpdGlvbi5cbiAgICovXG4gIEhvd2xlckdsb2JhbC5wcm90b3R5cGUucG9zID0gZnVuY3Rpb24oeCwgeSwgeikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIFN0b3AgcmlnaHQgaGVyZSBpZiBub3QgdXNpbmcgV2ViIEF1ZGlvLlxuICAgIGlmICghc2VsZi5jdHggfHwgIXNlbGYuY3R4Lmxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGRlZmF1bHRzIGZvciBvcHRpb25hbCAneScgJiAneicuXG4gICAgeSA9ICh0eXBlb2YgeSAhPT0gJ251bWJlcicpID8gc2VsZi5fcG9zWzFdIDogeTtcbiAgICB6ID0gKHR5cGVvZiB6ICE9PSAnbnVtYmVyJykgPyBzZWxmLl9wb3NbMl0gOiB6O1xuXG4gICAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgICAgc2VsZi5fcG9zID0gW3gsIHksIHpdO1xuXG4gICAgICBpZiAodHlwZW9mIHNlbGYuY3R4Lmxpc3RlbmVyLnBvc2l0aW9uWCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc2VsZi5jdHgubGlzdGVuZXIucG9zaXRpb25YLnNldFRhcmdldEF0VGltZShzZWxmLl9wb3NbMF0sIEhvd2xlci5jdHguY3VycmVudFRpbWUsIDAuMSk7XG4gICAgICAgIHNlbGYuY3R4Lmxpc3RlbmVyLnBvc2l0aW9uWS5zZXRUYXJnZXRBdFRpbWUoc2VsZi5fcG9zWzFdLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lLCAwLjEpO1xuICAgICAgICBzZWxmLmN0eC5saXN0ZW5lci5wb3NpdGlvblouc2V0VGFyZ2V0QXRUaW1lKHNlbGYuX3Bvc1syXSwgSG93bGVyLmN0eC5jdXJyZW50VGltZSwgMC4xKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuY3R4Lmxpc3RlbmVyLnNldFBvc2l0aW9uKHNlbGYuX3Bvc1swXSwgc2VsZi5fcG9zWzFdLCBzZWxmLl9wb3NbMl0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc2VsZi5fcG9zO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSBkaXJlY3Rpb24gdGhlIGxpc3RlbmVyIGlzIHBvaW50aW5nIGluIHRoZSAzRCBjYXJ0ZXNpYW4gc3BhY2UuXG4gICAqIEEgZnJvbnQgYW5kIHVwIHZlY3RvciBtdXN0IGJlIHByb3ZpZGVkLiBUaGUgZnJvbnQgaXMgdGhlIGRpcmVjdGlvbiB0aGVcbiAgICogZmFjZSBvZiB0aGUgbGlzdGVuZXIgaXMgcG9pbnRpbmcsIGFuZCB1cCBpcyB0aGUgZGlyZWN0aW9uIHRoZSB0b3Agb2YgdGhlXG4gICAqIGxpc3RlbmVyIGlzIHBvaW50aW5nLiBUaHVzLCB0aGVzZSB2YWx1ZXMgYXJlIGV4cGVjdGVkIHRvIGJlIGF0IHJpZ2h0IGFuZ2xlc1xuICAgKiBmcm9tIGVhY2ggb3RoZXIuXG4gICAqIEBwYXJhbSAge051bWJlcn0geCAgIFRoZSB4LW9yaWVudGF0aW9uIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB5ICAgVGhlIHktb3JpZW50YXRpb24gb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHogICBUaGUgei1vcmllbnRhdGlvbiBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEBwYXJhbSAge051bWJlcn0geFVwIFRoZSB4LW9yaWVudGF0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHlVcCBUaGUgeS1vcmllbnRhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB6VXAgVGhlIHotb3JpZW50YXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEByZXR1cm4ge0hvd2xlci9BcnJheX0gICAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCBvcmllbnRhdGlvbiB2ZWN0b3JzLlxuICAgKi9cbiAgSG93bGVyR2xvYmFsLnByb3RvdHlwZS5vcmllbnRhdGlvbiA9IGZ1bmN0aW9uKHgsIHksIHosIHhVcCwgeVVwLCB6VXApIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuY3R4IHx8ICFzZWxmLmN0eC5saXN0ZW5lcikge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0cyBmb3Igb3B0aW9uYWwgJ3knICYgJ3onLlxuICAgIHZhciBvciA9IHNlbGYuX29yaWVudGF0aW9uO1xuICAgIHkgPSAodHlwZW9mIHkgIT09ICdudW1iZXInKSA/IG9yWzFdIDogeTtcbiAgICB6ID0gKHR5cGVvZiB6ICE9PSAnbnVtYmVyJykgPyBvclsyXSA6IHo7XG4gICAgeFVwID0gKHR5cGVvZiB4VXAgIT09ICdudW1iZXInKSA/IG9yWzNdIDogeFVwO1xuICAgIHlVcCA9ICh0eXBlb2YgeVVwICE9PSAnbnVtYmVyJykgPyBvcls0XSA6IHlVcDtcbiAgICB6VXAgPSAodHlwZW9mIHpVcCAhPT0gJ251bWJlcicpID8gb3JbNV0gOiB6VXA7XG5cbiAgICBpZiAodHlwZW9mIHggPT09ICdudW1iZXInKSB7XG4gICAgICBzZWxmLl9vcmllbnRhdGlvbiA9IFt4LCB5LCB6LCB4VXAsIHlVcCwgelVwXTtcblxuICAgICAgaWYgKHR5cGVvZiBzZWxmLmN0eC5saXN0ZW5lci5mb3J3YXJkWCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc2VsZi5jdHgubGlzdGVuZXIuZm9yd2FyZFguc2V0VGFyZ2V0QXRUaW1lKHgsIEhvd2xlci5jdHguY3VycmVudFRpbWUsIDAuMSk7XG4gICAgICAgIHNlbGYuY3R4Lmxpc3RlbmVyLmZvcndhcmRZLnNldFRhcmdldEF0VGltZSh5LCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lLCAwLjEpO1xuICAgICAgICBzZWxmLmN0eC5saXN0ZW5lci5mb3J3YXJkWi5zZXRUYXJnZXRBdFRpbWUoeiwgSG93bGVyLmN0eC5jdXJyZW50VGltZSwgMC4xKTtcbiAgICAgICAgc2VsZi5jdHgubGlzdGVuZXIudXBYLnNldFRhcmdldEF0VGltZSh4LCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lLCAwLjEpO1xuICAgICAgICBzZWxmLmN0eC5saXN0ZW5lci51cFkuc2V0VGFyZ2V0QXRUaW1lKHksIEhvd2xlci5jdHguY3VycmVudFRpbWUsIDAuMSk7XG4gICAgICAgIHNlbGYuY3R4Lmxpc3RlbmVyLnVwWi5zZXRUYXJnZXRBdFRpbWUoeiwgSG93bGVyLmN0eC5jdXJyZW50VGltZSwgMC4xKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuY3R4Lmxpc3RlbmVyLnNldE9yaWVudGF0aW9uKHgsIHksIHosIHhVcCwgeVVwLCB6VXApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLyoqIEdyb3VwIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIEFkZCBuZXcgcHJvcGVydGllcyB0byB0aGUgY29yZSBpbml0LlxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gX3N1cGVyIENvcmUgaW5pdCBtZXRob2QuXG4gICAqIEByZXR1cm4ge0hvd2x9XG4gICAqL1xuICBIb3dsLnByb3RvdHlwZS5pbml0ID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbihvKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFNldHVwIHVzZXItZGVmaW5lZCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gICAgICBzZWxmLl9vcmllbnRhdGlvbiA9IG8ub3JpZW50YXRpb24gfHwgWzEsIDAsIDBdO1xuICAgICAgc2VsZi5fc3RlcmVvID0gby5zdGVyZW8gfHwgbnVsbDtcbiAgICAgIHNlbGYuX3BvcyA9IG8ucG9zIHx8IG51bGw7XG4gICAgICBzZWxmLl9wYW5uZXJBdHRyID0ge1xuICAgICAgICBjb25lSW5uZXJBbmdsZTogdHlwZW9mIG8uY29uZUlubmVyQW5nbGUgIT09ICd1bmRlZmluZWQnID8gby5jb25lSW5uZXJBbmdsZSA6IDM2MCxcbiAgICAgICAgY29uZU91dGVyQW5nbGU6IHR5cGVvZiBvLmNvbmVPdXRlckFuZ2xlICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZU91dGVyQW5nbGUgOiAzNjAsXG4gICAgICAgIGNvbmVPdXRlckdhaW46IHR5cGVvZiBvLmNvbmVPdXRlckdhaW4gIT09ICd1bmRlZmluZWQnID8gby5jb25lT3V0ZXJHYWluIDogMCxcbiAgICAgICAgZGlzdGFuY2VNb2RlbDogdHlwZW9mIG8uZGlzdGFuY2VNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLmRpc3RhbmNlTW9kZWwgOiAnaW52ZXJzZScsXG4gICAgICAgIG1heERpc3RhbmNlOiB0eXBlb2Ygby5tYXhEaXN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLm1heERpc3RhbmNlIDogMTAwMDAsXG4gICAgICAgIHBhbm5pbmdNb2RlbDogdHlwZW9mIG8ucGFubmluZ01vZGVsICE9PSAndW5kZWZpbmVkJyA/IG8ucGFubmluZ01vZGVsIDogJ0hSVEYnLFxuICAgICAgICByZWZEaXN0YW5jZTogdHlwZW9mIG8ucmVmRGlzdGFuY2UgIT09ICd1bmRlZmluZWQnID8gby5yZWZEaXN0YW5jZSA6IDEsXG4gICAgICAgIHJvbGxvZmZGYWN0b3I6IHR5cGVvZiBvLnJvbGxvZmZGYWN0b3IgIT09ICd1bmRlZmluZWQnID8gby5yb2xsb2ZmRmFjdG9yIDogMVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAgc2VsZi5fb25zdGVyZW8gPSBvLm9uc3RlcmVvID8gW3tmbjogby5vbnN0ZXJlb31dIDogW107XG4gICAgICBzZWxmLl9vbnBvcyA9IG8ub25wb3MgPyBbe2ZuOiBvLm9ucG9zfV0gOiBbXTtcbiAgICAgIHNlbGYuX29ub3JpZW50YXRpb24gPSBvLm9ub3JpZW50YXRpb24gPyBbe2ZuOiBvLm9ub3JpZW50YXRpb259XSA6IFtdO1xuXG4gICAgICAvLyBDb21wbGV0ZSBpbml0aWxpemF0aW9uIHdpdGggaG93bGVyLmpzIGNvcmUncyBpbml0IGZ1bmN0aW9uLlxuICAgICAgcmV0dXJuIF9zdXBlci5jYWxsKHRoaXMsIG8pO1xuICAgIH07XG4gIH0pKEhvd2wucHJvdG90eXBlLmluaXQpO1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSBzdGVyZW8gcGFubmluZyBvZiB0aGUgYXVkaW8gc291cmNlIGZvciB0aGlzIHNvdW5kIG9yIGFsbCBpbiB0aGUgZ3JvdXAuXG4gICAqIEBwYXJhbSAge051bWJlcn0gcGFuICBBIHZhbHVlIG9mIC0xLjAgaXMgYWxsIHRoZSB3YXkgbGVmdCBhbmQgMS4wIGlzIGFsbCB0aGUgd2F5IHJpZ2h0LlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIChvcHRpb25hbCkgVGhlIHNvdW5kIElELiBJZiBub25lIGlzIHBhc3NlZCwgYWxsIGluIGdyb3VwIHdpbGwgYmUgdXBkYXRlZC5cbiAgICogQHJldHVybiB7SG93bC9OdW1iZXJ9ICAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCBzdGVyZW8gcGFubmluZyB2YWx1ZS5cbiAgICovXG4gIEhvd2wucHJvdG90eXBlLnN0ZXJlbyA9IGZ1bmN0aW9uKHBhbiwgaWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIGNoYW5nZSBzdGVyZW8gcGFuIHdoZW4gY2FwYWJsZS5cbiAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgZXZlbnQ6ICdzdGVyZW8nLFxuICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc3RlcmVvKHBhbiwgaWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIFBhbm5lclN0ZXJlb05vZGUgc3VwcG9ydCBhbmQgZmFsbGJhY2sgdG8gUGFubmVyTm9kZSBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIHZhciBwYW5uZXJUeXBlID0gKHR5cGVvZiBIb3dsZXIuY3R4LmNyZWF0ZVN0ZXJlb1Bhbm5lciA9PT0gJ3VuZGVmaW5lZCcpID8gJ3NwYXRpYWwnIDogJ3N0ZXJlbyc7XG5cbiAgICAvLyBTZXR1cCB0aGUgZ3JvdXAncyBzdGVyZW8gcGFubmluZyBpZiBubyBJRCBpcyBwYXNzZWQuXG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFJldHVybiB0aGUgZ3JvdXAncyBzdGVyZW8gcGFubmluZyBpZiBubyBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQuXG4gICAgICBpZiAodHlwZW9mIHBhbiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgc2VsZi5fc3RlcmVvID0gcGFuO1xuICAgICAgICBzZWxmLl9wb3MgPSBbcGFuLCAwLCAwXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9zdGVyZW87XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIHRoZSBzdHJlbyBwYW5uaW5nIG9mIG9uZSBvciBhbGwgc291bmRzIGluIGdyb3VwLlxuICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYW4gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgc291bmQuX3N0ZXJlbyA9IHBhbjtcbiAgICAgICAgICBzb3VuZC5fcG9zID0gW3BhbiwgMCwgMF07XG5cbiAgICAgICAgICBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGFyZSBmYWxsaW5nIGJhY2ssIG1ha2Ugc3VyZSB0aGUgcGFubmluZ01vZGVsIGlzIGVxdWFscG93ZXIuXG4gICAgICAgICAgICBzb3VuZC5fcGFubmVyQXR0ci5wYW5uaW5nTW9kZWwgPSAnZXF1YWxwb3dlcic7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcGFubmVyIHNldHVwIGFuZCBjcmVhdGUgYSBuZXcgb25lIGlmIG5vdC5cbiAgICAgICAgICAgIGlmICghc291bmQuX3Bhbm5lciB8fCAhc291bmQuX3Bhbm5lci5wYW4pIHtcbiAgICAgICAgICAgICAgc2V0dXBQYW5uZXIoc291bmQsIHBhbm5lclR5cGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocGFubmVyVHlwZSA9PT0gJ3NwYXRpYWwnKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291bmQuX3Bhbm5lci5wb3NpdGlvblggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgc291bmQuX3Bhbm5lci5wb3NpdGlvblguc2V0VmFsdWVBdFRpbWUocGFuLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgICAgICBzb3VuZC5fcGFubmVyLnBvc2l0aW9uWS5zZXRWYWx1ZUF0VGltZSgwLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgICAgICBzb3VuZC5fcGFubmVyLnBvc2l0aW9uWi5zZXRWYWx1ZUF0VGltZSgwLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzb3VuZC5fcGFubmVyLnNldFBvc2l0aW9uKHBhbiwgMCwgMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIucGFuLnNldFZhbHVlQXRUaW1lKHBhbiwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fZW1pdCgnc3RlcmVvJywgc291bmQuX2lkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gc291bmQuX3N0ZXJlbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSAzRCBzcGF0aWFsIHBvc2l0aW9uIG9mIHRoZSBhdWRpbyBzb3VyY2UgZm9yIHRoaXMgc291bmQgb3IgZ3JvdXAgcmVsYXRpdmUgdG8gdGhlIGdsb2JhbCBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB4ICBUaGUgeC1wb3NpdGlvbiBvZiB0aGUgYXVkaW8gc291cmNlLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHkgIFRoZSB5LXBvc2l0aW9uIG9mIHRoZSBhdWRpbyBzb3VyY2UuXG4gICAqIEBwYXJhbSAge051bWJlcn0geiAgVGhlIHotcG9zaXRpb24gb2YgdGhlIGF1ZGlvIHNvdXJjZS5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBpZCAob3B0aW9uYWwpIFRoZSBzb3VuZCBJRC4gSWYgbm9uZSBpcyBwYXNzZWQsIGFsbCBpbiBncm91cCB3aWxsIGJlIHVwZGF0ZWQuXG4gICAqIEByZXR1cm4ge0hvd2wvQXJyYXl9ICAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCAzRCBzcGF0aWFsIHBvc2l0aW9uOiBbeCwgeSwgel0uXG4gICAqL1xuICBIb3dsLnByb3RvdHlwZS5wb3MgPSBmdW5jdGlvbih4LCB5LCB6LCBpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIFN0b3AgcmlnaHQgaGVyZSBpZiBub3QgdXNpbmcgV2ViIEF1ZGlvLlxuICAgIGlmICghc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gY2hhbmdlIHBvc2l0aW9uIHdoZW4gY2FwYWJsZS5cbiAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgZXZlbnQ6ICdwb3MnLFxuICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYucG9zKHgsIHksIHosIGlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdHMgZm9yIG9wdGlvbmFsICd5JyAmICd6Jy5cbiAgICB5ID0gKHR5cGVvZiB5ICE9PSAnbnVtYmVyJykgPyAwIDogeTtcbiAgICB6ID0gKHR5cGVvZiB6ICE9PSAnbnVtYmVyJykgPyAtMC41IDogejtcblxuICAgIC8vIFNldHVwIHRoZSBncm91cCdzIHNwYXRpYWwgcG9zaXRpb24gaWYgbm8gSUQgaXMgcGFzc2VkLlxuICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBSZXR1cm4gdGhlIGdyb3VwJ3Mgc3BhdGlhbCBwb3NpdGlvbiBpZiBubyBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQuXG4gICAgICBpZiAodHlwZW9mIHggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHNlbGYuX3BvcyA9IFt4LCB5LCB6XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9wb3M7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIHRoZSBzcGF0aWFsIHBvc2l0aW9uIG9mIG9uZSBvciBhbGwgc291bmRzIGluIGdyb3VwLlxuICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHNvdW5kLl9wb3MgPSBbeCwgeSwgel07XG5cbiAgICAgICAgICBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcGFubmVyIHNldHVwIGFuZCBjcmVhdGUgYSBuZXcgb25lIGlmIG5vdC5cbiAgICAgICAgICAgIGlmICghc291bmQuX3Bhbm5lciB8fCBzb3VuZC5fcGFubmVyLnBhbikge1xuICAgICAgICAgICAgICBzZXR1cFBhbm5lcihzb3VuZCwgJ3NwYXRpYWwnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VuZC5fcGFubmVyLnBvc2l0aW9uWCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgc291bmQuX3Bhbm5lci5wb3NpdGlvblguc2V0VmFsdWVBdFRpbWUoeCwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIucG9zaXRpb25ZLnNldFZhbHVlQXRUaW1lKHksIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgICAgICAgICBzb3VuZC5fcGFubmVyLnBvc2l0aW9uWi5zZXRWYWx1ZUF0VGltZSh6LCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIuc2V0UG9zaXRpb24oeCwgeSwgeik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fZW1pdCgncG9zJywgc291bmQuX2lkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gc291bmQuX3BvcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSBkaXJlY3Rpb24gdGhlIGF1ZGlvIHNvdXJjZSBpcyBwb2ludGluZyBpbiB0aGUgM0QgY2FydGVzaWFuIGNvb3JkaW5hdGVcbiAgICogc3BhY2UuIERlcGVuZGluZyBvbiBob3cgZGlyZWN0aW9uIHRoZSBzb3VuZCBpcywgYmFzZWQgb24gdGhlIGBjb25lYCBhdHRyaWJ1dGVzLFxuICAgKiBhIHNvdW5kIHBvaW50aW5nIGF3YXkgZnJvbSB0aGUgbGlzdGVuZXIgY2FuIGJlIHF1aWV0IG9yIHNpbGVudC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB4ICBUaGUgeC1vcmllbnRhdGlvbiBvZiB0aGUgc291cmNlLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHkgIFRoZSB5LW9yaWVudGF0aW9uIG9mIHRoZSBzb3VyY2UuXG4gICAqIEBwYXJhbSAge051bWJlcn0geiAgVGhlIHotb3JpZW50YXRpb24gb2YgdGhlIHNvdXJjZS5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBpZCAob3B0aW9uYWwpIFRoZSBzb3VuZCBJRC4gSWYgbm9uZSBpcyBwYXNzZWQsIGFsbCBpbiBncm91cCB3aWxsIGJlIHVwZGF0ZWQuXG4gICAqIEByZXR1cm4ge0hvd2wvQXJyYXl9ICAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCAzRCBzcGF0aWFsIG9yaWVudGF0aW9uOiBbeCwgeSwgel0uXG4gICAqL1xuICBIb3dsLnByb3RvdHlwZS5vcmllbnRhdGlvbiA9IGZ1bmN0aW9uKHgsIHksIHosIGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gU3RvcCByaWdodCBoZXJlIGlmIG5vdCB1c2luZyBXZWIgQXVkaW8uXG4gICAgaWYgKCFzZWxmLl93ZWJBdWRpbykge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBjaGFuZ2Ugb3JpZW50YXRpb24gd2hlbiBjYXBhYmxlLlxuICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICBldmVudDogJ29yaWVudGF0aW9uJyxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLm9yaWVudGF0aW9uKHgsIHksIHosIGlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdHMgZm9yIG9wdGlvbmFsICd5JyAmICd6Jy5cbiAgICB5ID0gKHR5cGVvZiB5ICE9PSAnbnVtYmVyJykgPyBzZWxmLl9vcmllbnRhdGlvblsxXSA6IHk7XG4gICAgeiA9ICh0eXBlb2YgeiAhPT0gJ251bWJlcicpID8gc2VsZi5fb3JpZW50YXRpb25bMl0gOiB6O1xuXG4gICAgLy8gU2V0dXAgdGhlIGdyb3VwJ3Mgc3BhdGlhbCBvcmllbnRhdGlvbiBpZiBubyBJRCBpcyBwYXNzZWQuXG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFJldHVybiB0aGUgZ3JvdXAncyBzcGF0aWFsIG9yaWVudGF0aW9uIGlmIG5vIHBhcmFtZXRlcnMgYXJlIHBhc3NlZC5cbiAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgc2VsZi5fb3JpZW50YXRpb24gPSBbeCwgeSwgel07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZi5fb3JpZW50YXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIHRoZSBzcGF0aWFsIG9yaWVudGF0aW9uIG9mIG9uZSBvciBhbGwgc291bmRzIGluIGdyb3VwLlxuICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHNvdW5kLl9vcmllbnRhdGlvbiA9IFt4LCB5LCB6XTtcblxuICAgICAgICAgIGlmIChzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBwYW5uZXIgc2V0dXAgYW5kIGNyZWF0ZSBhIG5ldyBvbmUgaWYgbm90LlxuICAgICAgICAgICAgaWYgKCFzb3VuZC5fcGFubmVyKSB7XG4gICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGEgcG9zaXRpb24gdG8gc2V0dXAgdGhlIG5vZGUgd2l0aC5cbiAgICAgICAgICAgICAgaWYgKCFzb3VuZC5fcG9zKSB7XG4gICAgICAgICAgICAgICAgc291bmQuX3BvcyA9IHNlbGYuX3BvcyB8fCBbMCwgMCwgLTAuNV07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZXR1cFBhbm5lcihzb3VuZCwgJ3NwYXRpYWwnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VuZC5fcGFubmVyLm9yaWVudGF0aW9uWCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgc291bmQuX3Bhbm5lci5vcmllbnRhdGlvblguc2V0VmFsdWVBdFRpbWUoeCwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIub3JpZW50YXRpb25ZLnNldFZhbHVlQXRUaW1lKHksIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgICAgICAgICBzb3VuZC5fcGFubmVyLm9yaWVudGF0aW9uWi5zZXRWYWx1ZUF0VGltZSh6LCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIuc2V0T3JpZW50YXRpb24oeCwgeSwgeik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fZW1pdCgnb3JpZW50YXRpb24nLCBzb3VuZC5faWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzb3VuZC5fb3JpZW50YXRpb247XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvKipcbiAgICogR2V0L3NldCB0aGUgcGFubmVyIG5vZGUncyBhdHRyaWJ1dGVzIGZvciBhIHNvdW5kIG9yIGdyb3VwIG9mIHNvdW5kcy5cbiAgICogVGhpcyBtZXRob2QgY2FuIG9wdGlvbmFsbCB0YWtlIDAsIDEgb3IgMiBhcmd1bWVudHMuXG4gICAqICAgcGFubmVyQXR0cigpIC0+IFJldHVybnMgdGhlIGdyb3VwJ3MgdmFsdWVzLlxuICAgKiAgIHBhbm5lckF0dHIoaWQpIC0+IFJldHVybnMgdGhlIHNvdW5kIGlkJ3MgdmFsdWVzLlxuICAgKiAgIHBhbm5lckF0dHIobykgLT4gU2V0J3MgdGhlIHZhbHVlcyBvZiBhbGwgc291bmRzIGluIHRoaXMgSG93bCBncm91cC5cbiAgICogICBwYW5uZXJBdHRyKG8sIGlkKSAtPiBTZXQncyB0aGUgdmFsdWVzIG9mIHBhc3NlZCBzb3VuZCBpZC5cbiAgICpcbiAgICogICBBdHRyaWJ1dGVzOlxuICAgKiAgICAgY29uZUlubmVyQW5nbGUgLSAoMzYwIGJ5IGRlZmF1bHQpIEEgcGFyYW1ldGVyIGZvciBkaXJlY3Rpb25hbCBhdWRpbyBzb3VyY2VzLCB0aGlzIGlzIGFuIGFuZ2xlLCBpbiBkZWdyZWVzLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICBpbnNpZGUgb2Ygd2hpY2ggdGhlcmUgd2lsbCBiZSBubyB2b2x1bWUgcmVkdWN0aW9uLlxuICAgKiAgICAgY29uZU91dGVyQW5nbGUgLSAoMzYwIGJ5IGRlZmF1bHQpIEEgcGFyYW1ldGVyIGZvciBkaXJlY3Rpb25hbCBhdWRpbyBzb3VyY2VzLCB0aGlzIGlzIGFuIGFuZ2xlLCBpbiBkZWdyZWVzLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICBvdXRzaWRlIG9mIHdoaWNoIHRoZSB2b2x1bWUgd2lsbCBiZSByZWR1Y2VkIHRvIGEgY29uc3RhbnQgdmFsdWUgb2YgYGNvbmVPdXRlckdhaW5gLlxuICAgKiAgICAgY29uZU91dGVyR2FpbiAtICgwIGJ5IGRlZmF1bHQpIEEgcGFyYW1ldGVyIGZvciBkaXJlY3Rpb25hbCBhdWRpbyBzb3VyY2VzLCB0aGlzIGlzIHRoZSBnYWluIG91dHNpZGUgb2YgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgYGNvbmVPdXRlckFuZ2xlYC4gSXQgaXMgYSBsaW5lYXIgdmFsdWUgaW4gdGhlIHJhbmdlIGBbMCwgMV1gLlxuICAgKiAgICAgZGlzdGFuY2VNb2RlbCAtICgnaW52ZXJzZScgYnkgZGVmYXVsdCkgRGV0ZXJtaW5lcyBhbGdvcml0aG0gdXNlZCB0byByZWR1Y2Ugdm9sdW1lIGFzIGF1ZGlvIG1vdmVzIGF3YXkgZnJvbVxuICAgKiAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLiBDYW4gYmUgYGxpbmVhcmAsIGBpbnZlcnNlYCBvciBgZXhwb25lbnRpYWwuXG4gICAqICAgICBtYXhEaXN0YW5jZSAtICgxMDAwMCBieSBkZWZhdWx0KSBUaGUgbWF4aW11bSBkaXN0YW5jZSBiZXR3ZWVuIHNvdXJjZSBhbmQgbGlzdGVuZXIsIGFmdGVyIHdoaWNoIHRoZSB2b2x1bWVcbiAgICogICAgICAgICAgICAgICAgICAgd2lsbCBub3QgYmUgcmVkdWNlZCBhbnkgZnVydGhlci5cbiAgICogICAgIHJlZkRpc3RhbmNlIC0gKDEgYnkgZGVmYXVsdCkgQSByZWZlcmVuY2UgZGlzdGFuY2UgZm9yIHJlZHVjaW5nIHZvbHVtZSBhcyBzb3VyY2UgbW92ZXMgZnVydGhlciBmcm9tIHRoZSBsaXN0ZW5lci5cbiAgICogICAgICAgICAgICAgICAgICAgVGhpcyBpcyBzaW1wbHkgYSB2YXJpYWJsZSBvZiB0aGUgZGlzdGFuY2UgbW9kZWwgYW5kIGhhcyBhIGRpZmZlcmVudCBlZmZlY3QgZGVwZW5kaW5nIG9uIHdoaWNoIG1vZGVsXG4gICAqICAgICAgICAgICAgICAgICAgIGlzIHVzZWQgYW5kIHRoZSBzY2FsZSBvZiB5b3VyIGNvb3JkaW5hdGVzLiBHZW5lcmFsbHksIHZvbHVtZSB3aWxsIGJlIGVxdWFsIHRvIDEgYXQgdGhpcyBkaXN0YW5jZS5cbiAgICogICAgIHJvbGxvZmZGYWN0b3IgLSAoMSBieSBkZWZhdWx0KSBIb3cgcXVpY2tseSB0aGUgdm9sdW1lIHJlZHVjZXMgYXMgc291cmNlIG1vdmVzIGZyb20gbGlzdGVuZXIuIFRoaXMgaXMgc2ltcGx5IGFcbiAgICogICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZSBvZiB0aGUgZGlzdGFuY2UgbW9kZWwgYW5kIGNhbiBiZSBpbiB0aGUgcmFuZ2Ugb2YgYFswLCAxXWAgd2l0aCBgbGluZWFyYCBhbmQgYFswLCDiiJ5dYFxuICAgKiAgICAgICAgICAgICAgICAgICAgIHdpdGggYGludmVyc2VgIGFuZCBgZXhwb25lbnRpYWxgLlxuICAgKiAgICAgcGFubmluZ01vZGVsIC0gKCdIUlRGJyBieSBkZWZhdWx0KSBEZXRlcm1pbmVzIHdoaWNoIHNwYXRpYWxpemF0aW9uIGFsZ29yaXRobSBpcyB1c2VkIHRvIHBvc2l0aW9uIGF1ZGlvLlxuICAgKiAgICAgICAgICAgICAgICAgICAgIENhbiBiZSBgSFJURmAgb3IgYGVxdWFscG93ZXJgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtIb3dsL09iamVjdH0gUmV0dXJucyBzZWxmIG9yIGN1cnJlbnQgcGFubmVyIGF0dHJpYnV0ZXMuXG4gICAqL1xuICBIb3dsLnByb3RvdHlwZS5wYW5uZXJBdHRyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBvLCBpZCwgc291bmQ7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIHZhbHVlcyBiYXNlZCBvbiBhcmd1bWVudHMuXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBSZXR1cm4gdGhlIGdyb3VwJ3MgcGFubmVyIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICByZXR1cm4gc2VsZi5fcGFubmVyQXR0cjtcbiAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG8gPSBhcmdzWzBdO1xuXG4gICAgICAgIC8vIFNldCB0aGUgZ3JvdSdzIHBhbm5lciBhdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGlmICghby5wYW5uZXJBdHRyKSB7XG4gICAgICAgICAgICBvLnBhbm5lckF0dHIgPSB7XG4gICAgICAgICAgICAgIGNvbmVJbm5lckFuZ2xlOiBvLmNvbmVJbm5lckFuZ2xlLFxuICAgICAgICAgICAgICBjb25lT3V0ZXJBbmdsZTogby5jb25lT3V0ZXJBbmdsZSxcbiAgICAgICAgICAgICAgY29uZU91dGVyR2Fpbjogby5jb25lT3V0ZXJHYWluLFxuICAgICAgICAgICAgICBkaXN0YW5jZU1vZGVsOiBvLmRpc3RhbmNlTW9kZWwsXG4gICAgICAgICAgICAgIG1heERpc3RhbmNlOiBvLm1heERpc3RhbmNlLFxuICAgICAgICAgICAgICByZWZEaXN0YW5jZTogby5yZWZEaXN0YW5jZSxcbiAgICAgICAgICAgICAgcm9sbG9mZkZhY3Rvcjogby5yb2xsb2ZmRmFjdG9yLFxuICAgICAgICAgICAgICBwYW5uaW5nTW9kZWw6IG8ucGFubmluZ01vZGVsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX3Bhbm5lckF0dHIgPSB7XG4gICAgICAgICAgICBjb25lSW5uZXJBbmdsZTogdHlwZW9mIG8ucGFubmVyQXR0ci5jb25lSW5uZXJBbmdsZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLnBhbm5lckF0dHIuY29uZUlubmVyQW5nbGUgOiBzZWxmLl9jb25lSW5uZXJBbmdsZSxcbiAgICAgICAgICAgIGNvbmVPdXRlckFuZ2xlOiB0eXBlb2Ygby5wYW5uZXJBdHRyLmNvbmVPdXRlckFuZ2xlICE9PSAndW5kZWZpbmVkJyA/IG8ucGFubmVyQXR0ci5jb25lT3V0ZXJBbmdsZSA6IHNlbGYuX2NvbmVPdXRlckFuZ2xlLFxuICAgICAgICAgICAgY29uZU91dGVyR2FpbjogdHlwZW9mIG8ucGFubmVyQXR0ci5jb25lT3V0ZXJHYWluICE9PSAndW5kZWZpbmVkJyA/IG8ucGFubmVyQXR0ci5jb25lT3V0ZXJHYWluIDogc2VsZi5fY29uZU91dGVyR2FpbixcbiAgICAgICAgICAgIGRpc3RhbmNlTW9kZWw6IHR5cGVvZiBvLnBhbm5lckF0dHIuZGlzdGFuY2VNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLnBhbm5lckF0dHIuZGlzdGFuY2VNb2RlbCA6IHNlbGYuX2Rpc3RhbmNlTW9kZWwsXG4gICAgICAgICAgICBtYXhEaXN0YW5jZTogdHlwZW9mIG8ucGFubmVyQXR0ci5tYXhEaXN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLnBhbm5lckF0dHIubWF4RGlzdGFuY2UgOiBzZWxmLl9tYXhEaXN0YW5jZSxcbiAgICAgICAgICAgIHJlZkRpc3RhbmNlOiB0eXBlb2Ygby5wYW5uZXJBdHRyLnJlZkRpc3RhbmNlICE9PSAndW5kZWZpbmVkJyA/IG8ucGFubmVyQXR0ci5yZWZEaXN0YW5jZSA6IHNlbGYuX3JlZkRpc3RhbmNlLFxuICAgICAgICAgICAgcm9sbG9mZkZhY3RvcjogdHlwZW9mIG8ucGFubmVyQXR0ci5yb2xsb2ZmRmFjdG9yICE9PSAndW5kZWZpbmVkJyA/IG8ucGFubmVyQXR0ci5yb2xsb2ZmRmFjdG9yIDogc2VsZi5fcm9sbG9mZkZhY3RvcixcbiAgICAgICAgICAgIHBhbm5pbmdNb2RlbDogdHlwZW9mIG8ucGFubmVyQXR0ci5wYW5uaW5nTW9kZWwgIT09ICd1bmRlZmluZWQnID8gby5wYW5uZXJBdHRyLnBhbm5pbmdNb2RlbCA6IHNlbGYuX3Bhbm5pbmdNb2RlbFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJldHVybiB0aGlzIHNvdW5kJ3MgcGFubmVyIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKHBhcnNlSW50KGFyZ3NbMF0sIDEwKSk7XG4gICAgICAgIHJldHVybiBzb3VuZCA/IHNvdW5kLl9wYW5uZXJBdHRyIDogc2VsZi5fcGFubmVyQXR0cjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICBvID0gYXJnc1swXTtcbiAgICAgIGlkID0gcGFyc2VJbnQoYXJnc1sxXSwgMTApO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgdmFsdWVzIG9mIHRoZSBzcGVjaWZpZWQgc291bmRzLlxuICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgIC8vIE1lcmdlIHRoZSBuZXcgdmFsdWVzIGludG8gdGhlIHNvdW5kLlxuICAgICAgICB2YXIgcGEgPSBzb3VuZC5fcGFubmVyQXR0cjtcbiAgICAgICAgcGEgPSB7XG4gICAgICAgICAgY29uZUlubmVyQW5nbGU6IHR5cGVvZiBvLmNvbmVJbm5lckFuZ2xlICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZUlubmVyQW5nbGUgOiBwYS5jb25lSW5uZXJBbmdsZSxcbiAgICAgICAgICBjb25lT3V0ZXJBbmdsZTogdHlwZW9mIG8uY29uZU91dGVyQW5nbGUgIT09ICd1bmRlZmluZWQnID8gby5jb25lT3V0ZXJBbmdsZSA6IHBhLmNvbmVPdXRlckFuZ2xlLFxuICAgICAgICAgIGNvbmVPdXRlckdhaW46IHR5cGVvZiBvLmNvbmVPdXRlckdhaW4gIT09ICd1bmRlZmluZWQnID8gby5jb25lT3V0ZXJHYWluIDogcGEuY29uZU91dGVyR2FpbixcbiAgICAgICAgICBkaXN0YW5jZU1vZGVsOiB0eXBlb2Ygby5kaXN0YW5jZU1vZGVsICE9PSAndW5kZWZpbmVkJyA/IG8uZGlzdGFuY2VNb2RlbCA6IHBhLmRpc3RhbmNlTW9kZWwsXG4gICAgICAgICAgbWF4RGlzdGFuY2U6IHR5cGVvZiBvLm1heERpc3RhbmNlICE9PSAndW5kZWZpbmVkJyA/IG8ubWF4RGlzdGFuY2UgOiBwYS5tYXhEaXN0YW5jZSxcbiAgICAgICAgICByZWZEaXN0YW5jZTogdHlwZW9mIG8ucmVmRGlzdGFuY2UgIT09ICd1bmRlZmluZWQnID8gby5yZWZEaXN0YW5jZSA6IHBhLnJlZkRpc3RhbmNlLFxuICAgICAgICAgIHJvbGxvZmZGYWN0b3I6IHR5cGVvZiBvLnJvbGxvZmZGYWN0b3IgIT09ICd1bmRlZmluZWQnID8gby5yb2xsb2ZmRmFjdG9yIDogcGEucm9sbG9mZkZhY3RvcixcbiAgICAgICAgICBwYW5uaW5nTW9kZWw6IHR5cGVvZiBvLnBhbm5pbmdNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLnBhbm5pbmdNb2RlbCA6IHBhLnBhbm5pbmdNb2RlbFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcGFubmVyIHZhbHVlcyBvciBjcmVhdGUgYSBuZXcgcGFubmVyIGlmIG5vbmUgZXhpc3RzLlxuICAgICAgICB2YXIgcGFubmVyID0gc291bmQuX3Bhbm5lcjtcbiAgICAgICAgaWYgKHBhbm5lcikge1xuICAgICAgICAgIHBhbm5lci5jb25lSW5uZXJBbmdsZSA9IHBhLmNvbmVJbm5lckFuZ2xlO1xuICAgICAgICAgIHBhbm5lci5jb25lT3V0ZXJBbmdsZSA9IHBhLmNvbmVPdXRlckFuZ2xlO1xuICAgICAgICAgIHBhbm5lci5jb25lT3V0ZXJHYWluID0gcGEuY29uZU91dGVyR2FpbjtcbiAgICAgICAgICBwYW5uZXIuZGlzdGFuY2VNb2RlbCA9IHBhLmRpc3RhbmNlTW9kZWw7XG4gICAgICAgICAgcGFubmVyLm1heERpc3RhbmNlID0gcGEubWF4RGlzdGFuY2U7XG4gICAgICAgICAgcGFubmVyLnJlZkRpc3RhbmNlID0gcGEucmVmRGlzdGFuY2U7XG4gICAgICAgICAgcGFubmVyLnJvbGxvZmZGYWN0b3IgPSBwYS5yb2xsb2ZmRmFjdG9yO1xuICAgICAgICAgIHBhbm5lci5wYW5uaW5nTW9kZWwgPSBwYS5wYW5uaW5nTW9kZWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgYSBwb3NpdGlvbiB0byBzZXR1cCB0aGUgbm9kZSB3aXRoLlxuICAgICAgICAgIGlmICghc291bmQuX3Bvcykge1xuICAgICAgICAgICAgc291bmQuX3BvcyA9IHNlbGYuX3BvcyB8fCBbMCwgMCwgLTAuNV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHBhbm5lciBub2RlLlxuICAgICAgICAgIHNldHVwUGFubmVyKHNvdW5kLCAnc3BhdGlhbCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLyoqIFNpbmdsZSBTb3VuZCBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBBZGQgbmV3IHByb3BlcnRpZXMgdG8gdGhlIGNvcmUgU291bmQgaW5pdC5cbiAgICogQHBhcmFtICB7RnVuY3Rpb259IF9zdXBlciBDb3JlIFNvdW5kIGluaXQgbWV0aG9kLlxuICAgKiBAcmV0dXJuIHtTb3VuZH1cbiAgICovXG4gIFNvdW5kLnByb3RvdHlwZS5pbml0ID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFNldHVwIHVzZXItZGVmaW5lZCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gICAgICBzZWxmLl9vcmllbnRhdGlvbiA9IHBhcmVudC5fb3JpZW50YXRpb247XG4gICAgICBzZWxmLl9zdGVyZW8gPSBwYXJlbnQuX3N0ZXJlbztcbiAgICAgIHNlbGYuX3BvcyA9IHBhcmVudC5fcG9zO1xuICAgICAgc2VsZi5fcGFubmVyQXR0ciA9IHBhcmVudC5fcGFubmVyQXR0cjtcblxuICAgICAgLy8gQ29tcGxldGUgaW5pdGlsaXphdGlvbiB3aXRoIGhvd2xlci5qcyBjb3JlIFNvdW5kJ3MgaW5pdCBmdW5jdGlvbi5cbiAgICAgIF9zdXBlci5jYWxsKHRoaXMpO1xuXG4gICAgICAvLyBJZiBhIHN0ZXJlbyBvciBwb3NpdGlvbiB3YXMgc3BlY2lmaWVkLCBzZXQgaXQgdXAuXG4gICAgICBpZiAoc2VsZi5fc3RlcmVvKSB7XG4gICAgICAgIHBhcmVudC5zdGVyZW8oc2VsZi5fc3RlcmVvKTtcbiAgICAgIH0gZWxzZSBpZiAoc2VsZi5fcG9zKSB7XG4gICAgICAgIHBhcmVudC5wb3Moc2VsZi5fcG9zWzBdLCBzZWxmLl9wb3NbMV0sIHNlbGYuX3Bvc1syXSwgc2VsZi5faWQpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKFNvdW5kLnByb3RvdHlwZS5pbml0KTtcblxuICAvKipcbiAgICogT3ZlcnJpZGUgdGhlIFNvdW5kLnJlc2V0IG1ldGhvZCB0byBjbGVhbiB1cCBwcm9wZXJ0aWVzIGZyb20gdGhlIHNwYXRpYWwgcGx1Z2luLlxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gX3N1cGVyIFNvdW5kIHJlc2V0IG1ldGhvZC5cbiAgICogQHJldHVybiB7U291bmR9XG4gICAqL1xuICBTb3VuZC5wcm90b3R5cGUucmVzZXQgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHBhcmVudCA9IHNlbGYuX3BhcmVudDtcblxuICAgICAgLy8gUmVzZXQgYWxsIHNwYXRpYWwgcGx1Z2luIHByb3BlcnRpZXMgb24gdGhpcyBzb3VuZC5cbiAgICAgIHNlbGYuX29yaWVudGF0aW9uID0gcGFyZW50Ll9vcmllbnRhdGlvbjtcbiAgICAgIHNlbGYuX3N0ZXJlbyA9IHBhcmVudC5fc3RlcmVvO1xuICAgICAgc2VsZi5fcG9zID0gcGFyZW50Ll9wb3M7XG4gICAgICBzZWxmLl9wYW5uZXJBdHRyID0gcGFyZW50Ll9wYW5uZXJBdHRyO1xuXG4gICAgICAvLyBJZiBhIHN0ZXJlbyBvciBwb3NpdGlvbiB3YXMgc3BlY2lmaWVkLCBzZXQgaXQgdXAuXG4gICAgICBpZiAoc2VsZi5fc3RlcmVvKSB7XG4gICAgICAgIHBhcmVudC5zdGVyZW8oc2VsZi5fc3RlcmVvKTtcbiAgICAgIH0gZWxzZSBpZiAoc2VsZi5fcG9zKSB7XG4gICAgICAgIHBhcmVudC5wb3Moc2VsZi5fcG9zWzBdLCBzZWxmLl9wb3NbMV0sIHNlbGYuX3Bvc1syXSwgc2VsZi5faWQpO1xuICAgICAgfSBlbHNlIGlmIChzZWxmLl9wYW5uZXIpIHtcbiAgICAgICAgLy8gRGlzY29ubmVjdCB0aGUgcGFubmVyLlxuICAgICAgICBzZWxmLl9wYW5uZXIuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgc2VsZi5fcGFubmVyID0gdW5kZWZpbmVkO1xuICAgICAgICBwYXJlbnQuX3JlZnJlc2hCdWZmZXIoc2VsZik7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbXBsZXRlIHJlc2V0dGluZyBvZiB0aGUgc291bmQuXG4gICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcyk7XG4gICAgfTtcbiAgfSkoU291bmQucHJvdG90eXBlLnJlc2V0KTtcblxuICAvKiogSGVscGVyIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBwYW5uZXIgbm9kZSBhbmQgc2F2ZSBpdCBvbiB0aGUgc291bmQuXG4gICAqIEBwYXJhbSAge1NvdW5kfSBzb3VuZCBTcGVjaWZpYyBzb3VuZCB0byBzZXR1cCBwYW5uaW5nIG9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUeXBlIG9mIHBhbm5lciB0byBjcmVhdGU6ICdzdGVyZW8nIG9yICdzcGF0aWFsJy5cbiAgICovXG4gIHZhciBzZXR1cFBhbm5lciA9IGZ1bmN0aW9uKHNvdW5kLCB0eXBlKSB7XG4gICAgdHlwZSA9IHR5cGUgfHwgJ3NwYXRpYWwnO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgcGFubmVyIG5vZGUuXG4gICAgaWYgKHR5cGUgPT09ICdzcGF0aWFsJykge1xuICAgICAgc291bmQuX3Bhbm5lciA9IEhvd2xlci5jdHguY3JlYXRlUGFubmVyKCk7XG4gICAgICBzb3VuZC5fcGFubmVyLmNvbmVJbm5lckFuZ2xlID0gc291bmQuX3Bhbm5lckF0dHIuY29uZUlubmVyQW5nbGU7XG4gICAgICBzb3VuZC5fcGFubmVyLmNvbmVPdXRlckFuZ2xlID0gc291bmQuX3Bhbm5lckF0dHIuY29uZU91dGVyQW5nbGU7XG4gICAgICBzb3VuZC5fcGFubmVyLmNvbmVPdXRlckdhaW4gPSBzb3VuZC5fcGFubmVyQXR0ci5jb25lT3V0ZXJHYWluO1xuICAgICAgc291bmQuX3Bhbm5lci5kaXN0YW5jZU1vZGVsID0gc291bmQuX3Bhbm5lckF0dHIuZGlzdGFuY2VNb2RlbDtcbiAgICAgIHNvdW5kLl9wYW5uZXIubWF4RGlzdGFuY2UgPSBzb3VuZC5fcGFubmVyQXR0ci5tYXhEaXN0YW5jZTtcbiAgICAgIHNvdW5kLl9wYW5uZXIucmVmRGlzdGFuY2UgPSBzb3VuZC5fcGFubmVyQXR0ci5yZWZEaXN0YW5jZTtcbiAgICAgIHNvdW5kLl9wYW5uZXIucm9sbG9mZkZhY3RvciA9IHNvdW5kLl9wYW5uZXJBdHRyLnJvbGxvZmZGYWN0b3I7XG4gICAgICBzb3VuZC5fcGFubmVyLnBhbm5pbmdNb2RlbCA9IHNvdW5kLl9wYW5uZXJBdHRyLnBhbm5pbmdNb2RlbDtcblxuICAgICAgaWYgKHR5cGVvZiBzb3VuZC5fcGFubmVyLnBvc2l0aW9uWCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc291bmQuX3Bhbm5lci5wb3NpdGlvblguc2V0VmFsdWVBdFRpbWUoc291bmQuX3Bvc1swXSwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgIHNvdW5kLl9wYW5uZXIucG9zaXRpb25ZLnNldFZhbHVlQXRUaW1lKHNvdW5kLl9wb3NbMV0sIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgICBzb3VuZC5fcGFubmVyLnBvc2l0aW9uWi5zZXRWYWx1ZUF0VGltZShzb3VuZC5fcG9zWzJdLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvdW5kLl9wYW5uZXIuc2V0UG9zaXRpb24oc291bmQuX3Bvc1swXSwgc291bmQuX3Bvc1sxXSwgc291bmQuX3Bvc1syXSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygc291bmQuX3Bhbm5lci5vcmllbnRhdGlvblggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHNvdW5kLl9wYW5uZXIub3JpZW50YXRpb25YLnNldFZhbHVlQXRUaW1lKHNvdW5kLl9vcmllbnRhdGlvblswXSwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgIHNvdW5kLl9wYW5uZXIub3JpZW50YXRpb25ZLnNldFZhbHVlQXRUaW1lKHNvdW5kLl9vcmllbnRhdGlvblsxXSwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgIHNvdW5kLl9wYW5uZXIub3JpZW50YXRpb25aLnNldFZhbHVlQXRUaW1lKHNvdW5kLl9vcmllbnRhdGlvblsyXSwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb3VuZC5fcGFubmVyLnNldE9yaWVudGF0aW9uKHNvdW5kLl9vcmllbnRhdGlvblswXSwgc291bmQuX29yaWVudGF0aW9uWzFdLCBzb3VuZC5fb3JpZW50YXRpb25bMl0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzb3VuZC5fcGFubmVyID0gSG93bGVyLmN0eC5jcmVhdGVTdGVyZW9QYW5uZXIoKTtcbiAgICAgIHNvdW5kLl9wYW5uZXIucGFuLnNldFZhbHVlQXRUaW1lKHNvdW5kLl9zdGVyZW8sIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgIH1cblxuICAgIHNvdW5kLl9wYW5uZXIuY29ubmVjdChzb3VuZC5fbm9kZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGNvbm5lY3Rpb25zLlxuICAgIGlmICghc291bmQuX3BhdXNlZCkge1xuICAgICAgc291bmQuX3BhcmVudC5wYXVzZShzb3VuZC5faWQsIHRydWUpLnBsYXkoc291bmQuX2lkLCB0cnVlKTtcbiAgICB9XG4gIH07XG59KSgpO1xuIiwiLy9pbXBvcnQgeyBwbGF5ZXIgfSBmcm9tICcuL3BsYXllcic7XG5pbXBvcnQgeyByZXBsYWNlU1ZHIH0gZnJvbSAnLi90b29scyc7XG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuL1BsYXllcic7XG5pbXBvcnQgeyBHYWxsZXJ5IH0gZnJvbSAnLi9HYWxsZXJ5JztcbmltcG9ydCB7IEZvcm0gfSBmcm9tICcuL0Zvcm0nO1xuLy9pbXBvcnQgeyBmb3JtX3N1Ym1pc3Npb24gfSBmcm9tICcuL2Zvcm1fc3VibWlzc2lvbic7XG4vLyBOT1RFOiBFbWJlZGRlZCBmb3JtIHN1Ym1pc3Npb24ganMgb25seSBvbiB0aGUgYm9va2luZy5odG1sIHBhZ2Ugb3IgbGVzc29ucy5odG1sIHBhZ2Vcblxud2luZG93Lm9uc2Nyb2xsID0gKCkgPT4ge1xuICBpZiAod2luZG93LnNjcm9sbFkgPj0gKHdpbmRvdy5pbm5lckhlaWdodCAqIC4zMCkpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYnKS5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZScpO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdicpLmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlJyk7XG4gIH1cbn1cbi8vbW9iaWxlIG1lbnUgdG9nZ2xlXG5sZXQgbW9iaWxlTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3VsLm1lbnUnKTtcbmxldCBoYW1idXJnZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGFtYnVyZ2VyJyk7XG5sZXQgeF9jbG9zZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy54X2Nsb3NlJyk7XG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubW9iaWxlLW1lbnUtdG9nZ2xlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbmF2JykuY2xhc3NMaXN0LmNvbnRhaW5zKCdtZW51LXRvZ2dsZWQnKSl7XG5cbiAgICBtb2JpbGVNZW51LmNsYXNzTGlzdC5yZW1vdmUoJ3RvZ2dsZWQnKTtcblxuICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdicpLmNsYXNzTGlzdC5yZW1vdmUoJ21lbnUtdG9nZ2xlZCcpO1xuICAgIH0sIDEwMCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbW9iaWxlTWVudS5jbGFzc0xpc3QudG9nZ2xlKCd0b2dnbGVkJyk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdicpLmNsYXNzTGlzdC50b2dnbGUoJ21lbnUtdG9nZ2xlZCcpO1xufSk7XG4vL2NoYW5nZSBtb2JpbGUgaWNvblxuaGFtYnVyZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PntcbiAgaGFtYnVyZ2VyLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgeF9jbG9zZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG59KTtcbnhfY2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICBoYW1idXJnZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICB4X2Nsb3NlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbn0pO1xuXG4vLyBUT0RPOiBSZWZhY3RvciB0byBiZSBpbiBhIGZ1bmNpdG9uIGFuZCBvbmx5IGNhbGxlZCBvbiB0aGUgTGlzdGVuIHBhZ2VcbmxldCBwbGF5ZXJFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wbGF5ZXInKTtcbmxldCBwbGF5ZXJzID0gW107XG4vLyBUT0RPOiBtYWtlIHNvdW5kIHNvdXJjZSBkeW5hbWljXG4vLyBtYXliZSBhZGQgZmlsZW5hbWUgYXMgYSBkYXRhIG1lbWJlciBvZiB0aGUgcGxheWVyIGVsZW1lbnQgaW4gdGhlIG1hcmt1cFxuZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICBsZXQgcGxheWVyID0gbmV3IFBsYXllcihwbGF5ZXJFbGVtZW50c1tpXS5pZCwgcGxheWVyRWxlbWVudHNbaV0uZGF0YXNldC5zcmMpO1xuICBjb25zb2xlLmxvZyhwbGF5ZXIpO1xuICBwbGF5ZXIuaW5pdCgpO1xuICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgcGxheWVyRWxlbWVudHNbaV0ucXVlcnlTZWxlY3RvcignLnBsYXllci1wbGF5UGF1c2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKT0+e1xuICAgIGNvbnNvbGUubG9nKGA+IFBsYXllciAke3BsYXllci5pZH1gKTtcbiAgICBwbGF5ZXIuc291bmRUb2dnbGUodHJ1ZSk7XG4gIH0pO1xufVxuXG4vLyBUT0RPOiBkbyBhIGNoZWNrIHNvIHRoaXMgb25seSBydW5zIHdoZW4gYSBnYWxsZXJ5IGV4aXN0cyxcbi8vIGFuZCB0aGVuIGR5bmFtaWNhbGx5IGNyZWF0ZSBhIEdhbGxlcnkgb2JqZWN0IGZvciBlYWNoIGdhbGxlcnkgaWQgZm91bmQuXG5sZXQgZ2FsbGVyeTtcbmlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ2FsbGVyeS0xJykgIT09IG51bGwpIHtcbiAgZ2FsbGVyeSA9IG5ldyBHYWxsZXJ5KFwiZ2FsbGVyeS0xXCIpO1xuICBnYWxsZXJ5LmluaXQoKTtcbn1cblxubGV0IGNoZWNrYm94O1xuLy8gQ29udmVydCBTVkcgaWNvbnMgdG8gU1ZHIGVsZW1lbnRzXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICByZXBsYWNlU1ZHKCk7XG4gIGxldCBmb3JtO1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZm9ybS5nZm9ybScpKSB7XG4gICAgZm9ybSA9IG5ldyBGb3JtKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0uZ2Zvcm0nKS5pZCk7XG4gIH1cbiAgLy8gaWYgKGZvcm0gIT0gdW5kZWZpbmVkKSBmb3JtLmdldERhdGEoKTtcbiAgLy8gZWxzZSAoY29uc29sZS5sb2coXCJGb3JtIG5vdCBmb3VuZC5cIikpO1xuXG4gIC8vUGFyZW50IEd1YXJkaWFuIGNoZWNrXG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT1pc19wYXJlbnRdXCIpICE9PSBudWxsKSB7XG4gICAgY2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT1pc19wYXJlbnRdXCIpO1xuICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3N0dWRlbnRzJykuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZScpO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJ1c2VyX3N0dWRlbnRGaXJzdE5hbWVcIl0nKVxuICAgICAgICAgICAgLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwidXNlcl9zdHVkZW50TGFzdE5hbWVcIl0nKVxuICAgICAgICAgICAgLnJlcXVpcmVkID0gdHJ1ZTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3N0dWRlbnRzJykuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZScpO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInVzZXJfc3R1ZGVudEZpcnN0TmFtZVwiXScpXG4gICAgICAgICAgICAgIC5yZXF1aXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInVzZXJfc3R1ZGVudExhc3ROYW1lXCJdJylcbiAgICAgICAgICAgICAgLnJlcXVpcmVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuLy9QYWdlIExvYWQgQW5pbWF0aW9uXG5sZXQgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZE92ZXJsYXknKTtcbmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJhbmltYXRpb25lbmRcIiwgb3ZlcmxheURvbmUpO1xuXG5mdW5jdGlvbiBvdmVybGF5RG9uZSgpIHtcbiAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnbG9hZE92ZXJsYXknKTtcbn1cbiIsIi8vICoqIFZhcmlvdXMgVG9vbHMhISEhXG4vL1xuXG5jb25zdCBQUkVGSVggPSAnW1RPT0xTXTogJztcbmNvbnN0IFNIT1dfTE9HID0gZmFsc2U7XG5jb25zdCBsb2cgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gIGlmIChTSE9XX0xPRykgY29uc29sZS5sb2coUFJFRklYLCAuLi5hcmdzKTtcbiAgZWxzZSByZXR1cm47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlU1ZHKCkge1xuICBsZXQgaW1nU1ZHID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW1nLnN2ZycpO1xuICBsZXQgc3JjO1xuICBmb3IgKGxldCBpIG9mIGltZ1NWRykge1xuICAgIHNyYyA9IGkuc3JjLnNwbGl0KCcvJyk7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBzcmMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChzcmNbal0gPT0gJ2ltZycpIHtcbiAgICAgICAgc3JjID0gc3JjLnNsaWNlKGkpO1xuICAgICAgICBzcmMgPSBzcmMuam9pbignLycpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgZ2V0QXN5bmMoc3JjLCAoc3ZnKSA9PiB7XG4gICAgICBsb2coc3ZnKTtcbiAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICAgIGNvbnN0IHhtbERvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoc3ZnLCAndGV4dC9odG1sJyk7XG4gICAgICBsZXQgc3ZnRWwgPSB4bWxEb2MucXVlcnlTZWxlY3Rvcignc3ZnJyk7XG4gICAgICBsb2coc3ZnRWwpO1xuICAgICAgaS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzdmdFbCwgaSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0QXN5bmModXJsLCBjYWxsYmFjaykge1xuICBsZXQgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICBodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICBpZiAoaHR0cC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cC5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICBjYWxsYmFjayhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgfVxuICB9XG4gIGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpOyAvLyBmYWxzZSBmb3Igc3luY2hyb25vdXMgcmVxdWVzdFxuICBodHRwLnNlbmQobnVsbCk7XG59XG4iXX0=
