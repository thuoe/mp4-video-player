import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import playerStyles from './player-styles';
import '@polymer/iron-icon/iron-icon';
import 'player-icons/player-icons';

/**
 * `mp4-video-player`
 * Simple MP4 Video Player Element
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class MP4VideoPlayer extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
      ${playerStyles}
      <div id="video_container" class="container">
        <div class="title">
          <h3 id="video_title">[[title]]</h3>
        </div>
        <video id="video_player" preload="metadata" poster$="[[poster]]" on-loadedmetadata="_metadetaLoaded" on-timeupdate="_updateTrack" on-ended="_handleEnd">
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
            <template is="dom-if" if="{{enablePIP}}">
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
          <div id="playback_track" class="track">
            <div id="track_bar_extra" class="track-bar extra" on-click="_handleTimelineClick"></div>
            <div id="track_bar" class="track-bar"on-click="_handleTimelineClick" 
              on-mouseenter="_toggleThumbnail"
              on-mousemove="_updateThumbnailPosition" 
              on-mouseleave="_toggleThumbnail">
            </div>
            <div id="track_fill" class="track-bar fill"></div>
            <div id="track_pointer" class="track-pointer" on-track="_handleTrack">
              <span></span>
            </div>
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
                <span class="tooltip">[[tooltipCaptions.playButton]]</span>
              </div>
              <div id="time" class="time-elapsed">
                <span id="current_time" tabindex="-1">[[formattedCurrentTime]]</span>
                &nbsp;/&nbsp;
                <span id="total_duration" tabindex="-1">[[formattedDuration]]</span>
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
                <span class="tooltip">[[tooltipCaptions.volumeButton]]</span>
              </div>
              <div id="volume_track" class="track" on-click="_handleTimelineClick">
                <div id="volume_track_bar" class="track-bar" on-click="_handleTimelineClick"></div>
                <div id="volume_track_fill" class="track-bar fill"></div>
                <div id="volume_track_pointer" class="track-pointer" on-track="_handleTrack">
                <span></span>
                </div>
              </div>
              <div id="fullscreen_icons" class="control-icons" on-click="_toggleFullscreen">
                <template is="dom-if" if={{!fullscreen}}>
                  <iron-icon icon="player-icons:fullscreen"></iron-icon>
                </template>
                <template is="dom-if" if={{fullscreen}}>
                  <iron-icon icon="player-icons:fullscreen-exit"></iron-icon>
                </template>
                <span class="tooltip">[[tooltipCaptions.fullscreenButton]]</span>
              </div>
              <div id="settings_icon" class="control-icons" on-click="_toggleMenu">
                <iron-icon icon="player-icons:more-vert"></iron-icon>
                <span class="tooltip">[[tooltipCaptions.optionButton]]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
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
      /* If the user is currently dragging the player track */
      dragging: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
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
        value: false,
        reflectToAttribute: true
      },
      /* The title displayed on the top of video player */
      title: {
        type: String,
        value: 'VIDEO TITLE HERE'
      },
      /* The volume scaled from 0-1 */
      volume: {
        type: Number,
        value: 0.75,
        observer: '_volumeChanged'
      },
      /* Time elapsed */
      elapsed: {
        type: Number,
        observer: '_elapsedChanged'
      },
      /* The formatted current position of the video playback in m:ss */
      formattedCurrentTime: {
        type: String,
        value: '0:00'
      },
      /* The formatted total duration of the video playback in m:ss */
      formattedDuration: {
        type: String,
        value: '0:00'
      },
      /* Used the populate the tooltip captions based on the current state of the player */
      tooltipCaptions: {
        type: Object,
        computed: '_computeTooltipCaptions(playing, muted, fullscreen)'
      },
      /* Toggle the Picture-in-Picture feature based on browser compatibility */
      enablePIP: {
        type: Boolean,
        value: () => document.pictureInPictureEnabled,
        readOnly: true
      }
    };
  }

  ready() {
    super.ready();
    window.addEventListener('resize', this._updateControlStyling.bind(this));
    this.addEventListener('keyup', this._handleKeyCode.bind(this));
    const fullscreenChangeEvent = this.prefix === 'ms' ? 'MSFullscreenchange' : `${this.prefix}fullscreenchange`;
    this.addEventListener(fullscreenChangeEvent, this._handleFullscreenChange.bind(this));
  }

  isFunction(func) {
    return typeof func === 'function';
  }

  get prefix() {
    if (document.exitFullscreen) {
      return ''; // no prefix Edge
    }
    const prefixes = ['webkit', 'ms', 'moz'];
    return prefixes.find((prefix) => {
      const exitFunction = document[`${prefix}ExitFullscreen`]; // Chrome, Safari, IE
      const mozExitFunction = document[`${prefix}CancelFullscreen`]; // Firefox
      return this.isFunction(exitFunction) || this.isFunction(mozExitFunction);
    });
  }

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

  getShadowElementById(id) {
    const element = this.$[id];
    if (element) {
      return element;
    }
    return this.shadowRoot.querySelector(`#${id}`);
  }

  _toggleThumbnail(event) {
    if (this.showThumbnailPreview) {
      const thumbnail = this.getShadowElementById('preview_thumbnail');
      const { type } = event;
      let toggle = false;
      if (type === 'mouseenter') {
        toggle = true;
      }
      thumbnail.classList.toggle('appear', toggle);
    }
  }

  _togglePictureInPicture() {
    const video = this.getShadowElementById('video_player');
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

  _toggleMenu() {
    const menu = this.getShadowElementById('menu');
    menu.hidden = !menu.hidden;
  }

  _updateControlStyling() {
    const { currentTime, duration } = this.getShadowElementById('video_player');
    const progress = currentTime / duration;
    this._updateTimeline(progress);
  }

  _updateThumbnailPosition(event) {
    if (this.showThumbnailPreview) {
      const thumbnail = this.getShadowElementById('preview_thumbnail');
      const containerRec = this.getShadowElementById('video_container').getBoundingClientRect();
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

  _metadetaLoaded(event) {
    const { duration } = event.currentTarget;
    this.formattedDuration = this._formatTime(duration);
  }

  _formatElapsedTime() {
    const { currentTime } = this.getShadowElementById('video_player');
    this.formattedCurrentTime = this._formatTime(currentTime);
  }

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
   * update the track when the time updates
   * is playing
   * @param {Object} event
   */
  _updateTrack(event) {
    if ((!this.dragging && this.playing) || document.pictureInPictureElement) {
      const { currentTime, duration } = event.currentTarget;
      const progress = currentTime / duration;
      this._updateTimeline(progress);
    }
  }

  /**
   * Update the current time of the video
   * when clicking a position of the timeline
   * @private
   * @param {Number} progress
   */
  _elapsedChanged(progress) {
    const video = this.getShadowElementById('video_player');
    video.currentTime = video.duration * progress;
    this._updateTimeline(progress);
  }

  /**
   * update the timeline
   * @private
   * @param {Number} progress
   */
  _updateTimeline(progress) {
    const offset = this.shadowRoot.querySelector('.track').offsetWidth * progress;
    this.getShadowElementById('track_pointer').style.left = `${offset}px`;
    this.getShadowElementById('track_fill').style.width = `${offset}px`;
    this._formatElapsedTime();
  }

  _handleKeyCode(event) {
    switch (event.keyCode) {
      case 32: // space
      case 80: // p
        this._togglePlay();
        break;
      case 109: // m
        this._toggleMute();
        break;
      default:
        break;
    }
  }

  _handleFullscreenChange() {
    this.fullscreen = !!document.fullscreenElement;
  }

  _handleEnd() {
    this.dispatchEvent(new CustomEvent('videoEnded', { detail: { ended: true } }));
  }

  /**
   * Toggle play the player
   * @private
   */
  _togglePlay() {
    const video = this.getShadowElementById('video_player');
    this.playing = !this.playing;
    if (this.playing) {
      video.play();
    } else {
      video.pause();
    }
  }

  _enterFullscreen() {
    if (!this.prefix) {
      this.requestFullscreen();
    } else {
      this[`${this.prefix}RequestFullscreen`]();
    }
  }

  _exitFullscreen() {
    if (!this.prefix) {
      document.exitFullscreen();
    } else {
      const action = this.prefix === 'moz' ? 'Cancel' : 'Exit';
      document[`${this.prefix}${action}Fullscreen`]();
    }
  }

  _toggleFullscreen() {
    this.fullscreen = !this.fullscreen;
    if (this.fullscreen) {
      this._enterFullscreen();
    } else {
      this._exitFullscreen();
    }
  }

  /**
   * Change the volume of the video when property
   * changes
   * @private
   * @param {Number} newVolume
   */
  _volumeChanged(newVolume, oldVolume) {
    this.prevVolume = oldVolume;
    if (newVolume === 0) {
      this.muted = true;
    } else {
      this.muted = false;
    }
    const offset = this.getShadowElementById('volume_track').offsetWidth * newVolume;
    this.getShadowElementById('volume_track_fill').style.width = `${offset}px`;
    this.getShadowElementById('volume_track_pointer').style.left = `${offset}px`;
    this.getShadowElementById('video_player').volume = newVolume;
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

  /**
   * Calculates the click positioning of the timeline
   * @param {Object} event
   */
  _handleTimelineClick(event) {
    const { id } = event.currentTarget;
    const clickPos = event.offsetX / event.currentTarget.offsetWidth;
    if (id === 'volume_track_bar' || id === 'volume_track') {
      this.volume = clickPos;
    } else {
      this.elapsed = clickPos;
    }
  }

  _handleTrack(event) {
    const video = this.getShadowElementById('video_player');
    switch (event.detail.state) {
      case 'start': {
        this.dragging = true;
        this.startleft = parseInt(event.currentTarget.style.left, 10) || 0;
        video.muted = true;
        break;
      }
      case 'track': {
        let movedBy = this.startleft + event.detail.dx;
        if (movedBy < 0) {
          movedBy = 0;
        }
        const trackWidth = event.currentTarget.previousElementSibling.previousElementSibling.offsetWidth;
        if (movedBy > trackWidth) {
          movedBy = trackWidth;
        }
        const value = movedBy / trackWidth;
        if (event.currentTarget.id === 'volume_track_pointer') {
          this.volume = value;
        } else {
          this.elapsed = value;
        }
        break;
      }
      case 'end':
        this.dragging = false;
        video.muted = false;
        break;
      default: {
        break;
      }
    }
  }
}

window.customElements.define('mp4-video-player', MP4VideoPlayer);
