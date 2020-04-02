import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-icon/iron-icon.js';
import 'player-icons/player-icons.js';

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
      <style>
        :host {
          display: block;
        }
        
        iron-icon {
          fill: white;
        }

        a {
          text-decoration: none;
        }

        button {
          background: white;
          border: 0;
          cursor: pointer;
          outline: none;
          transition: all .2s ease;
        }

        button iron-icon {
          fill: black;
        }

        button:hover {
          background: #29b6f6;
          color: white; 
        }

        button:hover iron-icon {
          fill: white;
        }

        video {
          width: 100%;
          height: 100%;
          background: black;
        }

        h3 {
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          top: 10px;
          color: white;
        }

        .container {
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 600px;
          box-sizing: border-box;
        }

        .video-controls {
          position: absolute;
          display: flex;
          flex-direction: column;
          width: 100%;
          bottom: 0;
          background: linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.7));
          opacity: 1;
          transition: opacity .4s ease-in-out, transform .4s ease-in-out
        }

        .video-controls:hover {
          opacity: 1;
        }

        .upper-controls {
          display: flex;
          flex-direction: column;
        }

        .track{
          position: relative;
          width: 100%;
        }

        .track-bar {
          position: absolute;
          width: 100%;
          height: 4px;
          bottom: 0;
          background: white;
          border-radius: 25px;
        }

        .extra {
          background: none;
          height: 16px;
        }

        .fill {
          pointer-events: none;
          background: #29b6f6;
          width: 0px;
        }

        .track-bar.large, .track-fill.large {
          height: 6px;
        }
        .track-pointer {
          position: absolute;
          height: 24px;
          width: 24px;
          padding: 6px;
          cursor: pointer;
          box-sizing: border-box;
          margin-left: -12px;
          bottom: -10px;
          outline: none;
        }

        .track-pointer span {
          position: absolute;
          top: calc(50% - 6px);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #29b6f6;
          transition: all 200ms;
        }

        .track-pointer span:active {
          transform: scale(1.5);
        }

        .track, .track-bar {
          cursor: pointer;
        }

        .lower-controls {
          height: 45px;
        }

        #volume_track_bar, #volume_track_fill {
          top: calc(50% - 2px);
        }

        #volume_track_pointer {
          bottom: 0;
        }

        .control-icons {
         cursor: pointer;
         position: relative;
        }

        .control-icons:hover {
          background: #29b6f6;
          border-radius: 3px;
        }

        #volume_icons, #volume_track, #download_icon, #fullscreen_icons {
          cursor: pointer;
          margin-right: 15px;
        }

        .left {
          position: relative;
          top: calc(50% - 12px);
          display: flex;
          float: left;
          margin-left: 7px;
        }

        .right {
          position: relative;
          top: calc(50% - 12px);
          display: flex;
          float: right;
          min-width: 350px;
          margin-right: 7px;
        }

        .time-elapsed {
          margin-left: 25px;
          line-height: 24px;
          color: white;
          font-weight: bold;
          pointer-events: none;
        }

        .icons {
          display: flex;
        }
        
        .thumbnail {
          position: absolute;
          width: 168px;
          height: 96px;
          background: #29b6f6;
          bottom: 100%;
          border-radius: 5px;
          margin-bottom: 25px;
          text-align: center;
          opacity: 0;
        }
        
        .thumbnail::after {
          position: absolute;
          top: 100%;
          left: 50%;
          content: '';
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #29b6f6 transparent transparent transparent;
        }

        .dropdown-menu::after {
          position: absolute;
          top: 100%;
          right: 5%;
          content: '';
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: white transparent transparent transparent;
        }

        .appear {
          opacity: 1;
        }

        .dropdown-menu[hidden] {
          display: none!important;
        }

        .dropdown-menu {
          position: absolute;
          width: 225px;
          height: 150px;
          bottom: 100%;
          background: red;
          right: 5px;
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
          animation: menu-popup 0.2s ease;
        }

        .dropdown-menu .menu-item {
          width: 100%;
          height: 50%;
        }

        @keyframes menu-popup { 
          0% {
            opacity: 0.5;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tooltip {
          background: rgba(255,255,255,.9);
          border-radius: 3px;
          bottom: 100%;
          box-shadow: 0 1px 2px rgba(0,0,0,.15);
          color: black;
          font-size: 12px;
          font-weight: 500;
          left: 50%;
          line-height: 1.3;
          margin-bottom: 32px;
          opacity: 0;
          padding: 5px 7.5px;
          pointer-events: none;
          position: absolute;
          transition: all .3s ease;
          transform: translate(-50%, 5px) scale(1);
          white-space: nowrap;
          z-index: 2;
        }

        .tooltip::before {
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid rgba(255,255,255,.9);
          bottom: -4px;
          content: '';
          height: 0;
          left: 50%;
          position: absolute;
          transform: translateX(-50%);
          width: 0;
          z-index: 2;
        }

        .control-icons:hover .tooltip {
          opacity: 1;
          transform: translate(-50%, -5px) scale(1);
        }
      </style>

      <div id="video_container" class="container">
        <h3>[[title]]</h3>
        <video id="video_player" preload="auto" on-loadedmetadata="_metadetaLoaded" on-timeupdate="_updateTrack" on-ended="_handleEnd">
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
            <button type="button" class="menu-item">
              <iron-icon icon="player-icons:picture-in-picture"></iron-icon>
              <span>PICTURE-IN-PICTURE</span>
            </button>
            <button type="button" class="menu-item">
                <a href$="{{videoFilePath}}" download>
                  <iron-icon icon="player-icons:file-download"></iron-icon>
                </a>
              <span>DOWNLOAD</span>
            </button>
          </div>
          <div id="playback_track" class="track">
            <div id="track_bar_extra" class="track-bar extra" 
              on-mouseenter="_toggleThumbnail"
              on-mousemove="_updateThumbnailPosition" 
              on-mouseleave="_toggleThumbnail" 
              on-click="_handleTimelineClick">
            </div>
            <div id="track_bar" class="track-bar"on-click="_handleTimelineClick"></div>
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
                <span class="tooltip">Play</span>
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
                <span class="tooltip">Volume</span>
              </div>
              <div id="volume_track" class="track" on-click="_handleTimelineClick">
                <div id="volume_track_bar" class="track-bar" on-click="_handleTimelineClick"></div>
                <div id="volume_track_fill" class="track-bar fill"></div>
                <div id="volume_track_pointer" class="track-pointer" on-track="_handleTrack">
                <span></span>
                </div>
              </div>
              <div id="fullscreen_icons" class="control-icons">
                <template is="dom-if" if={{!fullscreen}}>
                  <iron-icon icon="player-icons:fullscreen"></iron-icon>
                </template>
                <template is="dom-if" if={{fullscreen}}>
                  <iron-icon icon="player-icons:fullscreen-exit"></iron-icon>
                </template>
                <span class="tooltip">Fullscreen</span>
              </div>
              <div id="settings_icon" class="control-icons" on-click="_toggleMenu">
                <iron-icon icon="player-icons:more-vert"></iron-icon>
                <span class="tooltip">Options</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  static get properties() {
    return {
      videoFilePath: {
        type: String,
        value: '/assets/sample.mp4'
      },
      playing: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      dragging: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },
      muted: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      ended: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      fullscreen: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      showThumbnailPreview: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      title: {
        type: String,
        value: 'VIDEO TITLE HERE'
      },
      volume: {
        type: Number,
        value: 0.75,
        observer: '_volumeChanged'
      },
      elapsed: {
        type: Number,
        observer: '_elapsedChanged'
      },
      formattedCurrentTime: {
        type: String,
        value: '0:00'
      },
      formattedDuration: {
        type: String,
        value: '0:00'
      }
    };
  }

  ready() {
    super.ready();
    window.addEventListener('resize', this._updateControlStyling.bind(this));
    this.addEventListener('keyup', this._handleKeyCode.bind(this));
  }

  getShadowElementById(id) {
    const element = this.$[id];
    if (element) {
      return element;
    }
    return this.shadowRoot.querySelector(`#${id}`);
  }

  _toggleThumbnail(event) {
    const thumbnail = this.getShadowElementById('preview_thumbnail');
    const { type } = event;
    let toggle = false;
    if (type === 'mouseenter') {
      toggle = true;
    }
    thumbnail.classList.toggle('appear', toggle);
  }

  _toggleMenu(event) {
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
      const progressBarRec= event.currentTarget.getBoundingClientRect();
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

  _formatTime(time){
    let mins = Math.floor(time / 60);
    let secs = Math.round(time - mins * 60);
    if (secs === 60) {
      mins++;
      secs = 0;
    }
    if (secs < 10) {
      secs = `0${secs}`;
    }
    let formattedTime = `${mins}:${secs}`;
    return formattedTime;
  }

  /**
   * update the track when the time updates
   * is playing
   * @param {Object} event
   */
  _updateTrack(event) {
    if (!this.dragging && this.playing) {
      const currentTime = event.currentTarget.currentTime;
      const duration = event.currentTarget.duration;
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
    this.getShadowElementById('track_pointer').style.left = offset + 'px';
    this.getShadowElementById('track_fill').style.width = offset + 'px';
    this._formatElapsedTime();
  }

  _handleKeyCode(event) {
    switch(event.keyCode) {
      case 32: // space
      case 80: // p
        this._togglePlay();
        break;
      case 109: // m
        this._toggleMute();
        break;
    }
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
    this.getShadowElementById('volume_track_fill').style.width = offset + 'px';
    this.getShadowElementById('volume_track_pointer').style.left = offset + 'px';
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
    const clickPos = event.offsetX / event.currentTarget.offsetWidth;
    const id = event.currentTarget.id;
    if (id === 'volume_track_bar' || id === 'volume_track') {
      this.volume = clickPos;
    } else {
      this.elapsed = clickPos;
    }
  }

  _handleTrack(event) {
    const video = this.getShadowElementById('video_player');
    switch (event.detail.state) {
      case 'start':
        this.dragging = true;
        this.startleft = parseInt(event.currentTarget.style.left) || 0;
        video.muted = true;
        break;
      case 'track':
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
      case 'end':
        this.dragging = false;
        video.muted = false;
        break;
      default:
        break;
    }
  }

}

window.customElements.define('mp4-video-player', MP4VideoPlayer);