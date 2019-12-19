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
        
        .container {
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 1000px;
          border: 1px solid lightcoral;
          box-sizing: border-box;
        }

        h3 {
          position: absolute;
          left: 50%; 
          transform: translate(-50%, -50%);
          text-align: center; 
          top: 10px;
          color: white;
        }

        video {
          width: 100%;
          height: 100%;
          background: black;
        }
        .video-controls {
          display: flex;
          flex-direction: column;
          width: 100%;
          background: lightgray;
        }

        .upper-controls {
          display: flex;
          flex-direction: column;
        }

        .track{
          position: relative;
          width: 100%;
          background: orangered;
        }

        #volume_track {
          margin-left: 7px;
        }

        .track-timeline {
          position: absolute;
          width: 100%;
          height: 100%;
          background: white;
          opacity: 0.4;
          display: none;
        }

        .track-bar {
          position: absolute;
          width: 100%;
          height: 4px;
          bottom: 0;
          background: black;
          border-radius: 25px;
        }

        .fill {
          pointer-events: none;
          background: blueviolet;
          width: 0px;
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
          background: blueviolet;
          transition: all 200ms;
        }

        .track-pointer span:active {
          transform: scale(1.5);
        }

        .track, .track-bar, .track-timeline {
          cursor: pointer;
        }
        
        .lower-controls {
          height: 35px;
        }

        #volume_track_bar, #volume_track_fill {
          top: calc(50% - 2px);
        }

        #volume_track_pointer {
          bottom: 0;
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
          min-width: 300px;
          margin-right: 7px;
        }

        .time-elapsed {
          margin-left: 7px;
          line-height: 24px;
        }   

        .icons {
          display: flex;
        }

        #time {
          margin-left: 7px;
        }

        #volume_icons, #volume_track, #download_icon {
          margin-right: 7px;
        }
      </style>

      <div class="container">
        <h3>[[title]]</h3>
        <video id="video_player" on-timeupdate="_updateTrack" on-ended="_handleEnd">
          <source src="/assets/sample.mp4" type="video/mp4">
        </video>
        <div class="video-controls">
          <div id="playback_track" class="track">
            <div class="track-timeline" on-click="_handleTimelineClick"></div>
            <div class="track-bar" on-click="_handleTimelineClick"></div>
            <div id="track_fill" class="track-bar fill"></div>
            <div id="track_pointer" class="track-pointer" on-track="_handleTrack">
              <span></span>
            </div>
          </div>
          <div class="lower-controls">
            <div class="left">
              <div id="play_icons" on-click="_togglePlay">
                <template is="dom-if" if={{!playing}}>
                  <iron-icon icon="player-icons:play-arrow"></iron-icon>
                </template>
                <template is="dom-if" if={{playing}}>
                  <iron-icon icon="player-icons:pause"></iron-icon>
                </template>
                <template is="dom-if" if={{ended}}>
                  <iron-icon icon="player-icons:ended"></iron-icon>
                </template>
              </div>
              <div id="time" class="time-elapsed">
                <span id="current_time" tabindex="-1">0:00</span>
                &nbsp;/&nbsp;
                <span id="total_duration" tabindex="-1">0:00</span>
              </div>
            </div>
            <div class="right">
              <div id="volume_icons">
                <template is="dom-if" if={{muted}}>
                <iron-icon icon="player-icons:volume-off"></iron-icon>
                </template>
                <template is="dom-if" if={{!muted}}>
                <iron-icon icon="player-icons:volume-up"></iron-icon>
                </template>
              </div>
              <div id="volume_track" class="track">
                <div id="volume_timeline" class="track-timeline"></div>
                <div id="volume_track_bar" class="track-bar"></div>
                <div id="volume_track_fill" class="track-bar fill"></div>
                <div id="volume_track_pointer" class="track-pointer">
                  <span></span>
                </div>
              </div>
              <div id="download_icon">
                <iron-icon icon="player-icons:file-download"></iron-icon>
              </div>
              <div id="fullscreen_icons" class="icons">
                <template is="dom-if" if={{!fullscreen}}>
                  <iron-icon icon="player-icons:fullscreen"></iron-icon>
                </template>
                <template is="dom-if" if={{fullscreen}}>
                  <iron-icon icon="player-icons:fullscreen-exit"></iron-icon>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  static get properties() {
    return {
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
      }
    };
  }
  
  _formatCurrentTime(time){
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
    this.$['current_time'].innerHTML = formattedTime;
  }

  /**
   * Updates the timeline progress when the video 
   * is playing
   * @param {Object} event 
   */
  _updateTrack(event) {
    if (!this.dragging && this.playing) {
      const currentTime = event.currentTarget.currentTime;
      const duration = event.currentTarget.duration;
      const progress = currentTime / duration;
      this._formatCurrentTime(currentTime);
      this._progressTimeline(progress);
    }
  }

  /**
   * Update the current time of the video
   * when clicking a position of the timeline
   * @private
   * @param {Number} progress 
   */
  _elapsedChanged(progress) {
    const video = this.$['video_player'];
    video.currentTime = video.duration * progress;
    this._progressTimeline(progress);
  }

  /**
   * Progress the timeline
   * @private
   * @param {Number} progress 
   */
  _progressTimeline(progress) {
    const offset = this.shadowRoot.querySelector('.track').offsetWidth * progress;
    this.$['track_pointer'].style.left = offset + 'px';
    this.$['track_fill'].style.width = offset + 'px';
  }

  _handleEnd() {
    this.dispatchEvent(new CustomEvent('videoEnded', { detail: { ended: true } }));
  }

  /**
   * Toggle play the player
   * @private
   */
  _togglePlay() {
    const video = this.$['video_player'];
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
  _volumeChanged(newVolume) {
    this.$['video_player'].volume = newVolume;
  }

  /**
   * Toggle mute the player
   * @private
   */
  _toggleMute() {
    this.muted != this.muted;
    let prevVolume = this.volume
    if (this.muted) {
      this.volume = 0;
    } else {
      this.volume = prevVolume;
    }
  }

  /**
   * Calculates the click positioning of the timeline
   * @param {Object} event 
   */
  _handleTimelineClick(event) {
    const clickPos = event.offsetX / event.currentTarget.offsetWidth;
    if (clickPos === this.elapsed) {
      console.log('Same');
    } 
    if (event.currentTarget.id === 'vol_track_timeline') {
      this.volume = clickPos;
    } else {
      this.elapsed = clickPos;
    }
  }

  _handleTrack(event) {
    const video = this.$['video_player'];
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
        if (event.currentTarget.id === 'vol_track_pointer') {
          this.volume = value;
        } else {
          this.elapsed = value;
        }
        break;
      case 'end':
        this.dragging = false;
        video.muted = false;
        console.log('Elapsed : ' + this.elapsed);
        console.log('Current Progress px: ' + this.shadowRoot.querySelector('.track').offsetWidth * this.elapsed);
        break;
      default:
        break;
    }
  }

}

window.customElements.define('mp4-video-player', MP4VideoPlayer);
