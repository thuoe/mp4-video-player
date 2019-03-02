import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';

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
        video {
          width: 560px;
          height: 240px;
          background: lightgray;
        }
        .video-controls {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 40px;
          background: lightgray;
        }
        .track-timeline {
          position: relative;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .track-bar {
          position: absolute;
          width: 100%;
          height: 2px;
          top: calc(50% - 1px);
          background: black;
        }
        .fill {
          background: blueviolet;
          width: 0px;
        }
        .video-track-pointer {
          position: absolute;
          top: calc(50% - 12px);
          height: 24px;
          width: 24px;
          padding: 6px;
          cursor: pointer;
          box-sizing: border-box;
          margin-left: -12px;
        }

        .video-track-pointer span {
          position: absolute;
          top: calc(50% - 6px);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: blueviolet;
        }
      </style>
      <video id="video_player" on-timeupdate="_updateTrack" on-ended="_handleEnd" controls>
        <source src="/assets/sample.mp4" type="video/mp4">
      </video>
      <div class="video-controls track">
        <div class="track-timeline" on-click="_handleTimelineClick"></div>
        <div class="track-bar"></div>
        <div id="track_fill" class="track-bar fill"></div>
        <div id="track_pointer" class="video-track-pointer" on-track="_handleTrack">
          <span></span>
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
      volume: {
        type: Number,
        value: 0.3,
        observer: '_volumeChanged'
      },
      elapsed: {
        type: Number,
        observer: '_elapsedChanged'
      }
    };    
  }

  /**
   * Updates the timeline progress when the video 
   * is playing
   * @param {Object} event 
   */
  _updateTrack(event) {
    if (!this.dragging && !this.playing) {
      const currentTime = event.currentTarget.currentTime;
      const duration = event.currentTarget.duration;
      const progress = currentTime / duration;
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
    const offset = this.shadowRoot.querySelector('.track-timeline').offsetWidth * progress;
    this.$['track_pointer'].style.left = offset + 'px';
    this.$['track_fill'].style.width = offset + 'px';
  }

  _handleEnd() {
    this.dispatchEvent(new CustomEvent('videoEnded', {detail: {ended: true}}));
  }

  /**
   * Toggle play the player
   * @private
   */
  _togglePlay() {
    const video = this.$['volume_player'];
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
    this.$['video_player'].muted = this.muted;
  }

  /**
   * Calculates the click positioning of the timeline
   * @param {Object} event 
   */
  _handleTimelineClick(event) {
    const clickPos = event.offsetX / event.currentTarget.offsetWidth;
    this.elapsed = clickPos;
  }
  
  _handleTrack(event) {
    const video = this.$['video_player'];
    switch (event.detail.state) {
      case 'start':
        this.dragging = true;
        this.startleft =  parseInt(event.currentTarget.style.left) || 0;
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
        this.elapsed = value;
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
