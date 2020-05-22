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
        <video id="video_player" preload="metadata" poster$="[[poster]]" on-loadedmetadata="_metadetaLoaded" on-timeupdate="_handleTimeUpdate" on-ended="_handleEnd">
          <source src$="{{videoFilePath}}" type="video/mp4">
        </video>
        <div class="video-controls">
          <template is="dom-if" if={{showThumbnailPreview}}>
            <div id="preview_thumbnail" class="thumbnail">THUMBNAIL PREVIEW MOUSE OVER POSITION: [[xPosition]]</div>
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
            on-mouseenter="_toggleThumbnail"
            on-mousemove="_updateThumbnailPosition"
            on-mouseleave="_toggleThumbnail" 
            on-mousedown="_onMouseDown"> 
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
              <div id="volume_track" class="track volume" on-mousedown="_onMouseDown"> 
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
      duration: Number,
      /* The title displayed on the top of video player */
      title: String,
      /* File path to .mp4 video */
      videoFilePath: String,
      /* File path to poster image. It can be a relative or absolute URL */
      poster: String,
      /* If the video is currently playing */
      playing: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      /* If the audio is currently muted */
      muted: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      /* If the video playback has ended */
      ended: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      /* If the player is in fullscreen mode */
      fullscreen: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      /* Determines if the timeline preview above the track appears when hovering */
      showThumbnailPreview: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      /* The volume scaled from 0-1 */
      volume: {
        type: Number,
        value: 0.5
      },
      time: {
        type: Number,
        value: 0
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
    this.min = 0;
    this.step = 0.01;
    this.toFixed = 8;
    this.dragging = { volume: false, track: false };
    this.fullscreenChangeEvent = this._prefix === 'ms' ? 'MSFullscreenchange' : `${this._prefix}fullscreenchange`;
  }

  ready() {
    super.ready();
    this.addEventListener(this.ullscreenChangeEvent, this._handleFullscreenChange.bind(this));
    this._createPropertyObserver('volume', '_volumeChanged', true);
    this._createPropertyObserver('time', '_timeChanged', true);
    window.addEventListener('resize', () => {
      const { currentTime, duration } = this._getShadowElementById('video_player');
      this._setTrackPosition(currentTime, duration);
    });
    window.addEventListener('keyup', this._handleKeyCode.bind(this));
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
  _toggleThumbnail(event) {
    if (this.showThumbnailPreview) {
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
   * Update thumbnail preview position on
   * track
   * @param {MouseEvent} event mouse-move event
   * @private
   */
  _updateThumbnailPosition(event) {
    if (this.showThumbnailPreview) {
      const thumbnail = this._getShadowElementById('preview_thumbnail');
      const containerRec = this._getShadowElementById('video_container').getBoundingClientRect();
      const thumbnailRec = thumbnail.getBoundingClientRect();
      const progressBarRec = event.currentTarget.getBoundingClientRect();
      const thumbnailWidth = thumbnailRec.width;
      const minVal = containerRec.left - progressBarRec.left + 10;
      const maxVal = containerRec.right - progressBarRec.left - thumbnailWidth - 10;
      const mousePosX = event.pageX;
      let previewPos = mousePosX - progressBarRec.left - thumbnailWidth / 2;
      if (previewPos < minVal) {
        previewPos = minVal;
      }
      if (previewPos > maxVal) {
        previewPos = maxVal;
      }
      thumbnail.style.left = `${previewPos}px`;
      this.xPosition = mousePosX;
    }
  }

  _setTrackPosition(value, maxValue, sliderIdPrefix = '') {
    const thumb = this._getShadowElementById(`${sliderIdPrefix}track_thumb`);
    const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
    const maxHandlePos = slider.offsetWidth - thumb.offsetWidth;
    this.grabX = thumb.offsetWidth / 2;
    const position = this.getPositionFromValue(value, maxHandlePos, maxValue);
    this.setPosition(position, sliderIdPrefix);
  }

  /**
   * When video metadata is completely loaded
   * total duration is then formatted onto the player
   * @param {Event} event when the video has loaded metadeta
   * @private
   */
  _metadetaLoaded(event) {
    const { duration } = event.currentTarget;
    this.duration = duration;
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
    } else {
      console.log('Not playing!');
    }
    this._formatElapsedTime();
  }

  _updateCurrentTime(progress) {
    const video = this._getShadowElementById('video_player');
    video.currentTime = progress;
  }

  _updateCurrentVolume(volume) {
    this.volume = volume;
  }

  /**
   * Handle keycode video playback shortcuts
   * @param {KeyboardEvent} event key-up event
   * @private
   */
  _handleKeyCode(event) {
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
    this.fullscreen = !!document.fullscreenElement;
  }

  /**
   * Play the video
   */
  play() {
    this._getShadowElementById('video_player').play();
    this.playing = true;
  }

  /**
   * Pause the video
   */
  pause() {
    this._getShadowElementById('video_player').pause();
    this.playing = false;
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
    this.playing = !this.playing;
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
    this.fullscreen = !this.fullscreen;
    if (this.fullscreen) {
      this._enterFullscreen();
    } else {
      this._exitFullscreen();
    }
  }

  _timeChanged(newTime) {
    const video = this._getShadowElementById('video_player');
    const { duration } = video;
    if (newTime === this.duration) {
      this.ended = true;
    } else {
      this.ended = false;
    }
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
    if (newVolume === 0) {
      this.muted = true;
    } else {
      this.muted = false;
    }
    this._setTrackPosition(newVolume, maxVolume, 'volume_');
    this._getShadowElementById('video_player').volume = newVolume;
  }

  /**
   * Toggle mute the player
   * @private
   */
  _toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.volume = 0;
    } else {
      this.volume = this.prevVolume;
    }
  }

  _onMouseDown(e) {
    e.preventDefault();
    const { button, currentTarget } = e;
    if (button !== 0) return;
    const sliderIdPrefix = currentTarget.classList.contains('volume') ? 'volume_' : '';
    const thumb = this._getShadowElementById(`${sliderIdPrefix}track_thumb`);
    const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
    const posX = this.getRelativePosition(e, sliderIdPrefix);
    const maxHandlePos = slider.offsetWidth - thumb.offsetWidth;
    this.dragging.track = !currentTarget.classList.contains('volume');
    this.dragging.volume = currentTarget.classList.contains('volume');
    this.grabX = thumb.offsetWidth / 2;
    this._boundMouseMove = (event) => this._onMouseMove(event, sliderIdPrefix);
    this._boundMouseUp = (event) => this._onMouseUp(event, sliderIdPrefix);

    if (sliderIdPrefix === '') { // timeline
      this.prevPlaying = this.playing;
      if (this.playing) this.pause();
      const newTime = this.getValueFromPosition(this.between(posX - this.grabX, 0, maxHandlePos), maxHandlePos, this.duration);
      this.time = newTime; // call timeChanged
    } else {
      const maxVolume = 1;
      const newVolume = this.getValueFromPosition(this.between(posX - this.grabX, 0, maxHandlePos), maxHandlePos, maxVolume);
      this.volume = newVolume; // call volumeChanged
    }
    document.addEventListener('mousemove', this._boundMouseMove);
    document.addEventListener('mouseup', this._boundMouseUp);
  }

  _onMouseMove(e, sliderIdPrefix) {
    e.preventDefault();
    if (this.dragging.track || this.dragging.volume) {
      const thumb = this._getShadowElementById(`${sliderIdPrefix}track_thumb`);
      const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
      const posX = this.getRelativePosition(e, sliderIdPrefix);
      const maxHandlePos = slider.offsetWidth - thumb.offsetWidth;
      const pos = posX - this.grabX;
      if (sliderIdPrefix === '') {
        const newTime = this.getValueFromPosition(this.between(pos, 0, maxHandlePos), maxHandlePos, this.duration);
        this.time = newTime; // call timeChanged
      } else {
        const maxVolume = 1;
        const newVolume = this.getValueFromPosition(this.between(pos, 0, maxHandlePos), maxHandlePos, maxVolume);
        this.volume = newVolume; // call volumeChanged
      }
    }
  }

  _onMouseUp(e, sliderIdPrefix) {
    e.preventDefault();
    const draggableItem = sliderIdPrefix === '' ? 'track' : 'volume';
    this.dragging[draggableItem] = false;
    document.removeEventListener('mousemove', this._boundMouseMove);
    document.removeEventListener('mouseup', this._boundMouseUp);
    if (sliderIdPrefix === '') { // timeline
      if (this.prevPlaying) this.play();
    }
  }

  getPositionFromValue(value, maxHandlePos, maxValue) {
    const percentage = (value - this.min) / (maxValue - this.min);
    const pos = percentage * maxHandlePos;
    // eslint-disable-next-line no-restricted-globals
    return isNaN(pos) ? 0 : pos;
  }

  getValueFromPosition(pos, maxHandlePos, maxValue) {
    const percentage = ((pos) / (maxHandlePos || 1));
    const value = this.step * Math.round((percentage * (maxValue - this.min)) / this.step) + this.min;
    return Number((value).toFixed(this.toFixed));
  }

  getRelativePosition(e, sliderIdPrefix) {
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

  between(pos, min, max) {
    if (pos < min) {
      return min;
    }
    if (pos > max) {
      return max;
    }
    return pos;
  }

  setPosition(pos, sliderIdPrefix = '') {
    const slider = this._getShadowElementById(`${sliderIdPrefix}track_slider`);
    const thumb = this._getShadowElementById(`${sliderIdPrefix}track_thumb`);
    const fill = this._getShadowElementById(`${sliderIdPrefix}track_fill`);
    const maxHandlePos = slider.offsetWidth - thumb.offsetWidth;
    const max = sliderIdPrefix === 'volume_' ? 1 : this.duration;
    const value = this.getValueFromPosition(this.between(pos, 0, maxHandlePos), maxHandlePos, max);
    const newPos = this.getPositionFromValue(value, maxHandlePos, max);
    fill.style.width = `${newPos + this.grabX}px`;
    thumb.style.left = `${newPos}px`;

    if (sliderIdPrefix === 'volume_' && this.dragging.volume) { // dragging volume
      console.log('Updating volume');
      this._updateCurrentVolume(value);
    }
    if (sliderIdPrefix !== 'volume_' && this.dragging.track) { //  dragging timeline
      console.log('Updating time');
      this._updateCurrentTime(value);
    }
  }
}

window.customElements.define('mp4-video-player', MP4VideoPlayer);
