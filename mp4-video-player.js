import '@polymer/iron-icon/iron-icon';
import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import 'player-icons/player-icons';
import playerStyles from './player-styles';

/**
 * `mp4-video-player`
 * Simple MP4 Video Player Element
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class MP4VideoPlayer extends PolymerElement {
  static get template() {
    return html`
      ${playerStyles}
      <div id="video_container" class="container">
        <div class="title">
          <h3 id="video_title">[[title]]</h3>
        </div>
        <div class="large-btn" on-click="play">
          <iron-icon icon="player-icons:play-arrow"></iron-icon>
        </div>
        <video id="video_player" playsinline preload="metadata" poster$="[[poster]]" on-loadedmetadata="_metadetaLoaded" on-timeupdate="_handleTimeUpdate" on-ended="_handleEnd">
          <source src$="{{videoFilePath}}" type="video/mp4">
        </video>
        <div class="video-controls">
          <template is="dom-if" if={{timelinePreview}}>
            <div id="preview_thumbnail" class="thumbnail">[[previewTime]]</div>
          </template>
          <div id="menu" class="dropdown-menu" hidden>
            <button type="button" class="menu-item">
              <iron-icon icon="player-icons:closed-caption"></iron-icon>
              <span>CAPTION</span>
            </button>
            <template is="dom-if" if="{{_enablePIP}}">
              <button type="button" class="menu-item" on-click="_togglePictureInPicture">
                <iron-icon icon="player-icons:picture-in-picture"></iron-icon>
                <span>PICTURE-IN-PICTURE</span>
              </button>
            </template>
            <button type="button" class="menu-item">
                <a href$="{{videoFilePath}}" download>
                  <iron-icon icon="player-icons:file-download"></iron-icon>
                </a>
              <span>DOWNLOAD</span>
            </button>
          </div>
          <div class="track" 
            on-mouseenter="_togglePreview"
            on-mousemove="_updatePreviewPosition"
            on-mouseleave="_togglePreview"
            on-mousedown="_handleDown"
            on-touchstart="_handleDown"> 
            <div id="track_slider" class="slider">
              <div id="track_thumb" class="thumb"></div>
            </div>
            <div id="track_fill" class="fill"></div>
          </div>
          <div class="lower-controls">
            <div class="left">
              <div id="play_icons" class="control-icons" on-click="_togglePlay">
                <template is="dom-if" if={{!playing}}>
                  <iron-icon icon="player-icons:play-arrow"></iron-icon>
                </template>
                <template is="dom-if" if={{playing}}>
                  <iron-icon icon="player-icons:pause"></iron-icon>
                </template>
                <template is="dom-if" if={{ended}}>
                  <iron-icon icon="player-icons:ended"></iron-icon>
                </template>
                <span class="tooltip">[[_tooltipCaptions.playButton]]</span>
              </div>
              <div id="time" class="time-elapsed">
                <span id="current_time" tabindex="-1">[[_formattedCurrentTime]]</span>
                &nbsp;/&nbsp;
                <span id="total_duration" tabindex="-1">[[_formattedDuration]]</span>
              </div>
            </div>
            <div class="right">
              <div id="volume_icons" class="control-icons" tabindex="0" on-click="_toggleMute">
                <template is="dom-if" if={{muted}}>
                <iron-icon icon="player-icons:volume-off"></iron-icon>
                </template>
                <template is="dom-if" if={{!muted}}>
                <iron-icon icon="player-icons:volume-up"></iron-icon>
                </template>
                <span class="tooltip">[[_tooltipCaptions.volumeButton]]</span>
              </div>
              <div id="volume_track" class="track volume" on-mousedown="_handleDown" on-touchstart="_handleDown"> 
                <div id="volume_track_slider" class="slider volume">
                  <div id="volume_track_thumb" class="thumb volume"></div>
                  <div id="volume_track_fill" class="fill volume"></div>
                </div>
              </div>
              <div id="fullscreen_icons" class="control-icons" on-click="_toggleFullscreen">
                <template is="dom-if" if={{!fullscreen}}>
                  <iron-icon icon="player-icons:fullscreen"></iron-icon>
                </template>
                <template is="dom-if" if={{fullscreen}}>
                  <iron-icon icon="player-icons:fullscreen-exit"></iron-icon>
                </template>
                <span class="tooltip">[[_tooltipCaptions.fullscreenButton]]</span>
              </div>
              <div id="settings_icon" class="control-icons" on-click="_toggleMenu">
                <iron-icon icon="player-icons:more-vert"></iron-icon>
                <span class="tooltip">[[_tooltipCaptions.optionButton]]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      /* The title displayed on the top of video player */
      title: String,
      /* File path to .mp4 video */
      videoFilePath: String,
      /* File path to poster image. It can be a relative or absolute URL */
      poster: String,
      /* Duration of the video */
      duration: {
        type: Number,
        readOnly: true
      },
      /* If the video is currently playing */
      playing: {
        type: Boolean,
        value: false,
        readOnly: true,
        reflectToAttribute: true
      },
      /* If the audio is currently muted */
      muted: {
        type: Boolean,
        computed: '_isMuted(volume)'
      },
      /* If the player is in fullscreen mode */
      fullscreen: {
        type: Boolean,
        value: false,
        readOnly: true,
        reflectToAttribute: true
      },
      /* Determines if the timeline preview above the track appears when hovering */
      timelinePreview: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      /* The volume scaled from 0-1 */
      volume: {
        type: Number,
        value: 0.5
      },
      /* Current time of video playback */
      time: {
        type: Number,
        value: 0
      },
      /* Skip ahead or behind the current time based on the right or left arrow keys respectively */
      skipBy: {
        type: Number,
        value: 5
      },
      /* The formatted current position of the video playback in m:ss */
      _formattedCurrentTime: {
        type: String,
        value: '0:00'
      },
      /* The formatted total duration of the video playback in m:ss */
      _formattedDuration: {
        type: String,
        value: '0:00'
      },
      /* Used the populate the tooltip captions based on the current state of the player */
      _tooltipCaptions: {
        type: Object,
        computed: '_computeTooltipCaptions(playing, muted, fullscreen)'
      },
      /* Toggle the Picture-in-Picture feature based on browser compatibility */
      _enablePIP: {
        type: Boolean,
        value: () => document.pictureInPictureEnabled,
        readOnly: true
      }
    };
  }

  constructor() {
    super();
    this.tabIndex = 0;
    this.min = 0;
    this.step = 0.01;
    this.toFixed = 8;
    this.dragging = { volume: false, track: false };
    this.fullscreenChangeEvent = this._prefix === 'ms' ? 'MSFullscreenchange' : `${this._prefix}fullscreenchange`;
  }

  ready() {
    super.ready();
    this.addEventListener(this.fullscreenChangeEvent, this._handleFullscreenChange.bind(this));
    this.addEventListener('dblclick', this._toggleFullscreen.bind(this));
    this._createPropertyObserver('volume', '_volumeChanged', true);
    this._createPropertyObserver('time', '_timeChanged', true);
    window.addEventListener('resize', () => {
      const { currentTime, duration } = this._getShadowElementById('video_player');
      this._setTrackPosition(currentTime, duration);
    });
    window.addEventListener('keydown', this._handleKeyCode.bind(this));
  }

  /**
   * Determine if variable/property is truly a function.
   * @param {*} func function variable
   * @return {boolean} if variable is function.
   * @private
   */
  _isFunction(func) {
    return typeof func === 'function';
  }

  /**
   * Retrieve vender prefix for handling fullscreen
   * functionality
   * @private
   * @return {string} vendor prefix
   */
  get _prefix() {
    if (document.exitFullscreen) {
      return ''; // no prefix Edge
    }
    const prefixes = ['webkit', 'ms', 'moz'];
    return prefixes.find((prefix) => {
      const exitFunction = document[`${prefix}ExitFullscreen`]; // Chrome, Safari, IE
      const mozExitFunction = document[`${prefix}CancelFullscreen`]; // Firefox
      return this._isFunction(exitFunction) || this._isFunction(mozExitFunction);
    });
  }

  get _SPACE_BAR_KEY() {
    return 32;
  }

  get _P_KEY() {
    return 80;
  }

  get _M_KEY() {
    return 77;
  }

  get _F_KEY() {
    return 70;
  }

  get _LEFT_ARROW() {
    return 37;
  }

  get _UP_ARROW() {
    return 38;
  }

  get _RIGHT_ARROW() {
    return 39;
  }

  get _DOWN_ARROW() {
    return 40;
  }

  /**
   * Computes the value of the `muted` prop based on the current volume.
   * @param {number} volume current volume
   * @return {boolean} if the current volume is 0
   * @private
   */
  _isMuted(volume) {
    return volume === 0;
  }

  /**
   * Compute the tooltip caption text based on the current
   * state of the video player.
   * @param {boolean} playing if video is playing
   * @param {boolean} muted if volume is muted
   * @param {boolean} fullscreen if player is in fullscreen mode
   * @return {Object} captions for lower track controls
   * @private
   */
  _computeTooltipCaptions(playing, muted, fullscreen) {
    const captions = {
      playButton: 'Play',
      volumeButton: 'Volume',
      fullscreenButton: 'Fullscreen',
      optionButton: 'Options'
    };
    if (playing) {
      captions.playButton = 'Pause';
    }
    if (muted) {
      captions.volumeButton = 'Mute';
    }
    if (fullscreen) {
      captions.fullscreenButton = 'Exit Fullscreen';
    }
    return captions;
  }

  /**
   * Find element with an id within the Shadow DOM
   * of the video player.
   * @param {string} id id of element
   * @return {Element | undefined} element
   * @private
   */
  _getShadowElementById(id) {
    const element = this.$[id];
    if (element) {
      return element;
    }
    return this.shadowRoot.querySelector(`#${id}`);
  }

  /**
   * Toggle thumbnail previews event handler
   * @param {MouseEvent} event mouse-enter/leave event
   * @private
   */
  _togglePreview(event) {
    if (this.timelinePreview) {
      const thumbnail = this._getShadowElementById('preview_thumbnail');
      const { type } = event;
      let toggle = false;
      if (type === 'mouseenter') {
        toggle = true;
      }
      thumbnail.classList.toggle('appear', toggle);
    }
  }

  /**
   * Toggle Picture-in-Picture mode
   * @private
   */
  _togglePictureInPicture() {
    const video = this._getShadowElementById('video_player');
    if (!document.pictureInPictureElement) {
      video.requestPictureInPicture()
        .catch(() => {
          console.log('Failed to enter Picture-in-Picture mode');
        });
    } else {
      document.exitPictureInPicture()
        .catch(() => {
          console.log('Failed to leave Picture-in-Picture mode');
        });
    }
  }

  /**
   * Toggle settings menu
   * @private
   */
  _toggleMenu() {
    const menu = this._getShadowElementById('menu');
    menu.hidden = !menu.hidden;
  }

  /**
   * Update preview position on track
   * @param {MouseEvent} event mouse-move event
   * @private
   */
  _updatePreviewPosition(event) {
    if (this.timelinePreview) {
      const video = this._getShadowElementById('video_player');
      const thumbnail = this._getShadowElementById('preview_thumbnail');
      const container = this._getShadowElementById('video_container');
      const containerRec = container.getBoundingClientRect();
      const thumbnailRec = thumbnail.getBoundingClientRect();
      const progressBarRec = event.currentTarget.getBoundingClientRect();
      const thumbnailWidth = thumbnailRec.width;
      const minVal = containerRec.left - progressBarRec.left + 10;
      const maxVal = containerRec.right - progressBarRec.left - thumbnailWidth - 10;
      const mousePosX = event.pageX;
      const relativePosX = mousePosX - progressBarRec.left;
      let previewPos = relativePosX - thumbnailWidth / 2;
      if (previewPos < minVal) {
        previewPos = minVal;
      }
      if (previewPos > maxVal) {
        previewPos = maxVal;
      }
      thumbnail.style.left = `${previewPos + 5}px`; // TODO: very hacky. This is because of the 5px padding..
      this.previewTime = this._formatTime(video.duration * (relativePosX / event.currentTarget.offsetWidth));
    }
  }

  /**
   * Calculate and set the track thumb position & track fill.
   * @param {*} value  current value on track
   * @param {*} maxValue  maximum value on track
   * @param {*} sliderIdPrefix id prefix of the slider that is being targeted (volume or otherwise)
   * @private
   */
  _setTrackPosition(value, maxValue, sliderIdPrefix = '') {
    const thumb = this._getShadowElementById(`${sliderIdPrefix}track_thumb`);
    const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
    const maxHandlePos = slider.offsetWidth - thumb.offsetWidth;
    this.grabX = thumb.offsetWidth / 2;
    const position = this._getPositionFromValue(value, maxHandlePos, maxValue);
    this._setPosition(position, sliderIdPrefix);
  }

  /**
   * When video metadata is completely loaded
   * total duration is then formatted onto the player
   * @param {Event} event when the video has loaded metadeta
   * @private
   */
  _metadetaLoaded(event) {
    const { duration } = event.currentTarget;
    this._setDuration(duration);
    this._formattedDuration = this._formatTime(duration);
  }

  /**
   * Format the elasped time to minutes and seconds
   * @private
   */
  _formatElapsedTime() {
    const { currentTime } = this._getShadowElementById('video_player');
    this._formattedCurrentTime = this._formatTime(currentTime);
  }

  /**
   * Format the current time
   * @param {number} time current time
   * @return {string} formatted time
   * @private
   */
  _formatTime(time) {
    let mins = Math.floor(time / 60);
    let secs = Math.round(time - mins * 60);
    if (secs === 60) {
      mins += 1;
      secs = 0;
    }
    if (secs < 10) {
      secs = `0${secs}`;
    }
    return `${mins}:${secs}`;
  }

  /**
   * Update the track positioning when the
   * current video curentTime property updates
   * @param {Event} event
   * @private
   */
  _handleTimeUpdate() {
    if (this.playing && !this.dragging.track) {
      const { currentTime, duration } = this._getShadowElementById('video_player');
      this._setTrackPosition(currentTime, duration);
    }
    this._formatElapsedTime();
  }

  /**
   * Update the current time of the video
   * @param {number} progress current progress
   * @private
   */
  _updateCurrentTime(progress) {
    const video = this._getShadowElementById('video_player');
    video.currentTime = progress;
  }

  /**
   * Update the volume of the video player
   * @param {number} volume  current volume
   * @private
   */
  _updateCurrentVolume(volume) {
    this.volume = volume;
  }

  _matches(element, selector) {
    const matchMethod = element.matches
    || element.webwebkitMatchesSelector
    || element.msMatchesSelector
    || element.mozMatchesSelector;
    return matchMethod.call(element, selector);
  }

  /**
   * Handle keycode video playback shortcuts
   * @param {KeyboardEvent} event key-up event
   * @private
   */
  _handleKeyCode(event) {
    const { keyCode } = event;
    const { activeElement } = document;
    const preventableCodes = [38, 40];
    const editableSelectors = 'input, select, textarea';

    if (activeElement instanceof Element) {
      if (this._matches(activeElement, editableSelectors)) return;
    }

    if (preventableCodes.includes(keyCode)) {
      event.preventDefault();
    }

    const maxVol = 1;
    const minVol = 0;
    const { currentTime, volume } = this._getShadowElementById('video_player');
    switch (event.keyCode) {
      case this._SPACE_BAR_KEY:
      case this._P_KEY:
        this._togglePlay();
        break;
      case this._M_KEY:
        this._toggleMute();
        break;
      case this._F_KEY:
        this._toggleFullscreen();
        break;
      case this._LEFT_ARROW: {
        this._updateCurrentTime(currentTime - this.skipBy);
        break;
      }
      case this._RIGHT_ARROW: {
        this._updateCurrentTime(currentTime + this.skipBy);
        break;
      }
      case this._UP_ARROW: {
        const newVolume = this._between(volume + 0.05, minVol, maxVol);
        this._updateCurrentVolume(newVolume);
        break;
      }
      case this._DOWN_ARROW: {
        const newVolume = this._between(volume - 0.05, minVol, maxVol);
        this._updateCurrentVolume(newVolume);
        break;
      }
      default:
        break;
    }
  }

  /**
   * Handle changes when toggling between
   * fullscreen mode
   * @private
   */
  _handleFullscreenChange() {
    this._setFullscreen(!!document.fullscreenElement);
  }

  /**
   * Play the video
   */
  play() {
    this._getShadowElementById('video_player').play();
    this._setPlaying(true);
    this.focus();
  }

  /**
   * Pause the video
   */
  pause() {
    this._getShadowElementById('video_player').pause();
    this._setPlaying(false);
  }

  /**
   * Mute the audio
   */
  mute() {
    this.volume = 0;
  }

  /**
   * Dispatch a custom event when the video has
   * ended
   * @private
   */
  _handleEnd() {
    this.dispatchEvent(new CustomEvent('videoEnded', { detail: { ended: true } }));
  }

  /**
   * Toggle play the player
   * @private
   */
  _togglePlay() {
    this._setPlaying(!this.playing);
    if (this.playing) {
      this.play();
    } else {
      this.pause();
    }
  }

  /**
   * Request to enter fullscreen mode
   * @private
   */
  _enterFullscreen() {
    if (!this._prefix) {
      this.requestFullscreen();
    } else {
      this[`${this._prefix}RequestFullscreen`]();
    }
  }

  /**
   * Exit fullscreen mode
   * @private
   */
  _exitFullscreen() {
    if (!this._prefix) {
      document.exitFullscreen();
    } else {
      const action = this._prefix === 'moz' ? 'Cancel' : 'Exit';
      document[`${this._prefix}${action}Fullscreen`]();
    }
  }

  /**
   * Toggle fullscreen mode
   * @private
   */
  _toggleFullscreen() {
    this._setFullscreen(!this.fullscreen);
    if (this.fullscreen) {
      this._enterFullscreen();
    } else {
      this._exitFullscreen();
    }
  }

  _timeChanged(newTime) {
    const video = this._getShadowElementById('video_player');
    const { duration } = video;
    this._setTrackPosition(newTime, duration);
    if (!this.dragging.track) {
      video.currentTime = 0;
    }
  }

  /**
   * Change the volume of the video
   * @param {Number} newVolume new volume level
   * @param {Number} oldVolume current volume level
   * @private
   */
  _volumeChanged(newVolume, oldVolume) {
    const maxVolume = 1;
    this.prevVolume = oldVolume;
    this._setTrackPosition(newVolume, maxVolume, 'volume_');
    this._getShadowElementById('video_player').volume = newVolume;
  }

  /**
   * Toggle mute the player
   * @private
   */
  _toggleMute() {
    if (this.volume !== 0) {
      this.mute();
    } else {
      this.volume = this.prevVolume;
    }
  }

  /**
   * Calculate video playback, slider thumb & slider fill positioning
   * when the user has begun pressing or tapping within a region of the slider (volume or otherwise)
   * @param {TouchEvent| MouseEvent} e touchstart or mousedown event
   * @private
   */
  _handleDown(e) {
    if (e.cancelable) e.preventDefault();
    const { button, touches, currentTarget } = e;
    if (touches === undefined && button !== 0) return;
    const eventPrefix = e.type === 'touchstart' ? 'touch' : 'mouse';
    const eventReleasePrefix = e.type === 'touchstart' ? 'end' : 'up';
    const sliderIdPrefix = currentTarget.classList.contains('volume') ? 'volume_' : '';
    const thumb = this._getShadowElementById(`${sliderIdPrefix}track_thumb`);
    const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
    const posX = this._getRelativePosition(e, sliderIdPrefix);
    const maxHandlePos = slider.offsetWidth - thumb.offsetWidth;
    this.dragging.track = !currentTarget.classList.contains('volume');
    this.dragging.volume = currentTarget.classList.contains('volume');
    this.grabX = thumb.offsetWidth / 2;
    this._boundMouseMove = (event) => this._handleMove(event, sliderIdPrefix);
    this._boundMouseUp = (event) => this._handleRelease(event, sliderIdPrefix);

    if (sliderIdPrefix === '') {
      this.prevPlaying = this.playing;
      if (this.playing) this.pause();
      this.time = this._getValueFromPosition(this._between(posX - this.grabX, 0, maxHandlePos), maxHandlePos, this.duration);
    } else {
      const maxVolume = 1;
      this.volume = this._getValueFromPosition(this._between(posX - this.grabX, 0, maxHandlePos), maxHandlePos, maxVolume);
    }
    document.addEventListener(`${eventPrefix}move`, this._boundMouseMove);
    document.addEventListener(`${eventPrefix + eventReleasePrefix}`, this._boundMouseUp);
  }

  /**
   * Calculate video playback, slider thumb & slider fill positioning
   * when the user begins dragging within of the document (volume or otherwise)
   * whilst still pressing down.
   * @param {TouchEvent| MouseEvent} e mousemove or touchmove event
   * @param {string} sliderIdPrefix id prefix of the slider being targeted
   * @private
   */
  _handleMove(e, sliderIdPrefix) {
    if (e.cancelable) e.preventDefault();
    if (this.dragging.track || this.dragging.volume) {
      const thumb = this._getShadowElementById(`${sliderIdPrefix}track_thumb`);
      const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
      const posX = this._getRelativePosition(e, sliderIdPrefix);
      const maxHandlePos = slider.offsetWidth - thumb.offsetWidth;
      const pos = posX - this.grabX;
      if (sliderIdPrefix === '') {
        this.time = this._getValueFromPosition(this._between(pos, 0, maxHandlePos), maxHandlePos, this.duration);
      } else {
        const maxVolume = 1;
        this.volume = this._getValueFromPosition(this._between(pos, 0, maxHandlePos), maxHandlePos, maxVolume);
      }
    }
  }

  /**
   * @param {TouchEvent| MouseEvent} e mouseup or touchend event
   * @param {string} sliderIdPrefix id prefix of the slider being targeted
   * @private
   */
  _handleRelease(e, sliderIdPrefix) {
    if (e.cancelable) e.preventDefault();
    const eventPrefix = e.type === 'touchend' ? 'touch' : 'mouse';
    const eventReleasePrefix = e.type === 'touchend' ? 'end' : 'up';
    const draggableItem = sliderIdPrefix === '' ? 'track' : 'volume';
    this.dragging[draggableItem] = false;
    document.removeEventListener(`${eventPrefix}move`, this._boundMouseMove);
    document.removeEventListener(`${eventPrefix + eventReleasePrefix}`, this._boundMouseUp);
    if (sliderIdPrefix === '') {
      if (this.prevPlaying) this.play();
    }
  }

  /**
   * Derive the positioning on a slider based on a value
   * @param {number} value current value
   * @param {number} maxHandlePos maximum handle position of slider
   * @param {number} maxValue maximum value
   * @return {number} position in pixels
   * @private
   */
  _getPositionFromValue(value, maxHandlePos, maxValue) {
    const percentage = (value - this.min) / (maxValue - this.min);
    const pos = percentage * maxHandlePos;
    // eslint-disable-next-line no-restricted-globals
    return isNaN(pos) ? 0 : pos;
  }

  /**
   * Derive the value on a slider based on the current position
   * @param {number} pos current position in pixels
   * @param {number} maxHandlePos maximum handle position of slider
   * @param {number} maxValue maximum value
   * @return {number} value
   * @private
   */
  _getValueFromPosition(pos, maxHandlePos, maxValue) {
    const percentage = ((pos) / (maxHandlePos || 1));
    const value = this.step * Math.round((percentage * (maxValue - this.min)) / this.step) + this.min;
    return Number((value).toFixed(this.toFixed));
  }

  /**
   * Retreive the relative positioning on a slider when a user presses or taps
   * within its region.
   * @param {TouchEvent| MouseEvent} e
   * @param {string} sliderIdPrefix id prefix of the slider being targeted
   * @return {number} relative position in pixels
   * @private
   */
  _getRelativePosition(e, sliderIdPrefix) {
    const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
    const boundingClientRect = slider.getBoundingClientRect();
    // Get the offset relative to the viewport
    const rangeSize = boundingClientRect.left;
    let pageOffset = 0;

    const pagePositionProperty = this.vertical ? 'pageY' : 'pageX';

    if (typeof e[pagePositionProperty] !== 'undefined') {
      pageOffset = (e.touches && e.touches.length) ? e.touches[0][pagePositionProperty] : e[pagePositionProperty];
    } else if (typeof e.originalEvent !== 'undefined') {
      if (typeof e.originalEvent[pagePositionProperty] !== 'undefined') {
        pageOffset = e.originalEvent[pagePositionProperty];
      } else if (e.originalEvent.touches && e.originalEvent.touches[0]
        && typeof e.originalEvent.touches[0][pagePositionProperty] !== 'undefined') {
        pageOffset = e.originalEvent.touches[0][pagePositionProperty];
      }
    } else if (e.touches && e.touches[0] && typeof e.touches[0][pagePositionProperty] !== 'undefined') {
      pageOffset = e.touches[0][pagePositionProperty];
    } else if (e.currentPoint && (typeof e.currentPoint.x !== 'undefined' || typeof e.currentPoint.y !== 'undefined')) {
      pageOffset = this.vertical ? e.currentPoint.y : e.currentPoint.x;
    }

    return this.vertical ? rangeSize - pageOffset : pageOffset - rangeSize;
  }

  /**
   * Return the same position if it is within the maximum and minimum values.
   * Otherwise set to maximum and minimum values if the position is greater than or less
   * than respectively.
   * @param {number} pos current position
   * @param {number} min minimum position
   * @param {number} max maximum position
   * @return position
   * @private
   */
  _between(pos, min, max) {
    if (pos < min) {
      return min;
    }
    if (pos > max) {
      return max;
    }
    return pos;
  }

  /**
   * Position a slider's elements appropriately
   * @param {number} pos current position
   * @param {string} sliderIdPrefix id prefix of the slider that is being targeted
   * @private
   */
  _setPosition(pos, sliderIdPrefix = '') {
    const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
    const thumb = this._getShadowElementById(`${sliderIdPrefix}track_thumb`);
    const fill = this._getShadowElementById(`${sliderIdPrefix}track_fill`);
    const maxHandlePos = slider.offsetWidth - thumb.offsetWidth;
    const max = sliderIdPrefix === 'volume_' ? 1 : this.duration;
    const value = this._getValueFromPosition(this._between(pos, 0, maxHandlePos), maxHandlePos, max);
    const newPos = this._getPositionFromValue(value, maxHandlePos, max);
    fill.style.width = `${newPos + this.grabX}px`;
    thumb.style.left = `${newPos}px`;

    if (sliderIdPrefix === 'volume_' && this.dragging.volume) { // dragging volume
      this._updateCurrentVolume(value);
    }
    if (sliderIdPrefix !== 'volume_' && this.dragging.track) { //  dragging timeline
      this._updateCurrentTime(value);
    }
  }
}

window.customElements.define('mp4-video-player', MP4VideoPlayer);
