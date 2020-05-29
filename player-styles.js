import { html } from '@polymer/polymer/polymer-element';

const playerStyles = html`
  <style>
    :host {
      display: block;
      min-width: var(--video-min-width, 600px);
      min-height: var(--video-min-height, 400px);
      user-select: none;
    }

    :host(:-webkit-full-screen) {
      width: 100%;
      height: 100%;
    }

    iron-icon {
      fill: white;
    }

    a {
      text-decoration: none;
    }

    video {
      width: 100%;
      height: 100%;
      background: black;
    }

    video::-webkit-media-controls {
      display: none;
    }

    h3 {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      top: 10px;
      color: var(--video-title-color, rgba(255,255,255,.9));
    }

    .title {
      position: absolute;
      background: linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,0));
      width: 100%;
      height: 40px;
      opacity: 0;
      transition: opacity .3s ease-in-out, transform .3s ease-in-out;
      z-index: 3;
    }

    .title:hover {
      opacity: 1;
    }

    .large-btn {
      position: absolute;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: var(--video-large-play-button-color, #d32f2f);
      cursor: pointer;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: background .2s ease-in-out;
    }

    .large-btn:hover {
      background: var(--video-large-play-button--hover-color, #9a0007);
    }

    .container {
      position: relative;
      display: flex;
      width: 100%;
      height: 100%;
      flex-direction: column;
      box-sizing: border-box;
    }

    .video-controls {
      position: absolute;
      display: flex;
      flex-direction: column;
      width: 100%;
      bottom: 0;
      background: linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.7));
      box-sizing: border-box;
      padding: 0px 5px 0px 5px;
      opacity: 1;
      transition: opacity .3s ease-in-out, transform .3s ease-in-out;
    }

    .video-controls:hover {
      opacity: 1;
    }

    .upper-controls {
      display: flex;
      flex-direction: column;
    }

    .track{
      width: 100%;
      height: 20px;
      box-sizing: border-box;
    }

    .extra {
      background: none;
      height: 16px;
    }

    .track {
      position: relative;
      width: 100%;
      height: 20px;
      box-sizing: border-box;
    }

    .track:active .thumb {
      box-shadow: 0 1px 1px rgba(35,40,47,.15), 0 0 0 1px rgba(35,40,47,.2), 0 0 0 3px rgba(255,255,255,.5)
    }

    .track.volume {
      height: 24px;
    }
    
    .slider {
      position: absolute;
      border-radius: 5px;
      background: var(--video-track-bar-color, rgba(255,255,255,.55));
      bottom: 0;
      width: 100%;
      height: 5px;
      cursor: pointer;
    }

    .slider.volume {
      bottom: 50%;
      transform: translateY(50%);
    }
    
    .fill {
      position: absolute;
      pointer-events: none;
      border-radius: 5px;
      background: var(--video-track-fill-color, #d32f2f);
      bottom: 0;
      height: 5px;
    }

    .thumb {
      width: 20px;
      height: 20px;
      position: relative;
      top: 50%;
      transform: translateY(-50%);
      transition: box-shadow .3s ease;
      background: var(--video-thumb-color, #fff);
      border-radius: 20px;
      cursor: pointer;
      z-index: 3;
    }

    .track, .track-bar {
      cursor: pointer;
    }

    .lower-controls {
      height: 45px;
    }

    .control-icons {
      cursor: pointer;
      position: relative;
    }

    .control-icons:hover {
      background: var(--video-control-icons-background-hover-color, #d32f2f);
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
      background: var(--video-thumbnail-background-color, rgba(255,255,255,.9));
      box-shadow: 0 1px 2px rgba(0,0,0,.15);
      bottom: 100%;
      border-radius: 5px;
      text-align: center;
      opacity: 0;
    }
    
    .thumbnail::after { 
      position: absolute;
      top: 100%;
      left: 50%;
      content: '';
      border-width: 5px;
      border-style: solid;
      border-color: var(--video-thumbnail-background-color, rgba(255,255,255,.9)) transparent transparent transparent;
    }

    .appear {
      opacity: 1;
    }


    .dropdown-menu {
      position: absolute;
      width: 225px;
      height: 150px;
      bottom: 100%;
      background: var(--video-menu-background-color, rgba(255,255,255,.9));
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(0,0,0,.15);
      right: 5px;
      margin-bottom: 15px;
      display: flex;
      flex-direction: column;
      animation: menu-popup 0.2s ease;
      padding: 7px;
      z-index: 4;
    }

    .dropdown-menu::after {
      position: absolute;
      top: 100%;
      right: 5%;
      content: '';
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: var(--video-menu-background-color, rgba(255,255,255,.9)) transparent transparent transparent;
    }

    .dropdown-menu[hidden] {
      display: none!important;
    }

    .dropdown-menu .menu-item {
      background: var(--video-menu-item-color, transparent);
      border: 0;
      border-radius: 4px;
      cursor: pointer;
      outline: none;
      transition: all .2s ease;
      width: 100%;
      height: 50%;
      padding: 4px 11px;
    }

    .menu-item iron-icon {
      fill: var(--video-menu-item-icon-color, black);
    }

    .menu-item:hover {
      background: var(--video-menu-item-hover-color, #d32f2f);
      color: white; 
    }

    .menu-item:hover iron-icon {
      fill: var(--video-menu-item-icon-hover-color, white);
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
      background: var(--video-tooltip-background-color, rgba(255,255,255,.9));
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
      border-top: 4px solid var(--video-tooltip-background-color, rgba(255,255,255,.9));
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
`;

export default playerStyles;
