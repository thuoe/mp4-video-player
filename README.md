# \<mp4-video-player\>

[![Build Status](https://travis-ci.org/Eddie-Thuo/mp4-video-player.svg?branch=master)](https://travis-ci.org/Eddie-Thuo/mp4-video-player)

Simple MP4 Video Player Element

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) and npm (packaged with [Node.js](https://nodejs.org)) installed. Run `npm install` to install your element's dependencies, then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```
The live demo page will be available to view via `http://127.0.0.1:8081/components/mp4-video-player/`

## Running Tests

```
$ npm test
```

## Running ESLint

```
$ npm run lint
```

## Video Player Properties

The following properties are accessible to use:

| Property               | Description                                                        | Type    | Value       |
|------------------------|--------------------------------------------------------------------|---------|-------------|
| `title`                | Title positioned on top of the video player                        | String  | `undefined` |
| `videoFilePath`        | Relative file path to .mp4 video                                   | String  | `undefined` |
| `poster`               | File path to poster image. It can be a relative or absolute URL    | String  | `undefined` |
| `playing`              | If the video is playing                                            | Boolean | `false`     |
| `muted`                | If the video is muted                                              | Boolean | `false`     |
| `showThumbnailPreview` | Determines if the thumbnail previews show above the timeline track | Boolean | `false`     |
| `volume`               | The volume scaled from 0-1                                         | Number  | `0.75`      |

## Custom CSS Properties

The following custom CSS variables are also available for custom styling the video player:

Custom property | Description | Default
------------------------------------------|-------------------------------------------------------------|----------------------
`--video-title-color`                     | Color of the video title                | `rgba(255,255,255,.9)`
`--video-min-width`                       | The minimum width of the video player   | `600px`
`--video-min-height`                      | The minimum height of the video player  | `400px`
`--video-track-bar-color`                 | Track bar color                         | `rgba(255,255,255,.55)`
`--video-track-fill-color`                | Track fill color                        | `#29b6f6`
`--video-pointer-color`                   | Pointer color                           | `#29b6f6`
`--video-control-icons-background-hover-color` | Control icons background hover color  | `#29b6f6`
`--video-thumbnail-background-color`      | Thumbnail track background color        | `rgba(255,255,255,.9)`
`--video-menu-background-color`           | Menu background color                   | `rgba(255,255,255,.9)`
`--video-menu-item-color`                 | Menu item background color              | `rgba(255,255,255,.9)`
`--video-menu-item-icon-color`            | Menu icon color                         | `black`
`--video-menu-item-hover-color`           | Menu item hover color                   | `#29b6f6`
`--video-menu-item-icon-hover-color`      | Menu icon hover color                   | `white`
`--video-tooltip-background-color`        | Tooltip background color                | `rgba(255,255,255,.9)`


### HTML Example:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
    <title>mp4-video-player demo</title>
    <script type="module">
        import '@webcomponents/webcomponentsjs/webcomponents-loader.js';
        // custom-style element invokes the custom properties polyfill
        import '@polymer/polymer/lib/elements/custom-style.js';
        import '../mp4-video-player.js'
    </script>
</head>
<body>
    <h3>Video player using custom CSS properties</h3>
    <!-- ensure that custom props are polyfilled on browsers that don't support them -->
    <custom-style>
        <style is="custom-style">
            mp4-video-player {
                /* Set the values for the custom CSS properties */
                --video-pointer-color: red;
                --video-tooltip-background-color: orange;
                --video-menu-item-hover-color: magenta;
            }
        </style>
    </custom-style>
    <mp4-video-player></mp4-video-player>
</body>
</html>
```

Or you can dynamically change the CSS properties at runtime..

```js
const player = window.querySelector('mp4-video-player');
player.updateStyles({
    '--video-min-width': '750px',
    '--video-min-height': '300px',
    '--video-title-color': 'red',
    '--video-track-bar-color': 'blue',
    ...
});  
```
