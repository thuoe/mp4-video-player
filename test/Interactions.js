/* eslint-disable no-param-reassign */

const HAS_NEW_MOUSE = (() => {
  let has = false;
  try {
    has = Boolean(new MouseEvent('x'));
  } catch (_) {
    // do nothing
  }
  return has;
})();

/**
 * Returns a keyboard event. This event bubbles and is cancellable.
 *
 * @param {string} type The type of keyboard event (such as 'keyup' or
 * 'keydown').
 * @param {number} keyCode The keyCode for the event.
 * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
 *     Accepted values are shift, ctrl, alt, meta.
 * @param {string=} key The KeyboardEvent.key value for the event.
 * @return {!Event}
 */
export function keyboardEventFor(type, keyCode, modifiers, key) {
  const event = new CustomEvent(type, {
    detail: 0,
    bubbles: true,
    cancelable: true,
    // Allow event to go outside a ShadowRoot.
    composed: true
  });

  event.keyCode = keyCode;
  event.code = keyCode;

  modifiers = modifiers || [];
  if (typeof modifiers === 'string') {
    modifiers = [modifiers];
  }
  event.shiftKey = modifiers.indexOf('shift') !== -1;
  event.altKey = modifiers.indexOf('alt') !== -1;
  event.ctrlKey = modifiers.indexOf('ctrl') !== -1;
  event.metaKey = modifiers.indexOf('meta') !== -1;

  event.key = key;

  return event;
}

/**
 * Fires a keyboard event on a specific node. This event bubbles and is
 * cancellable.
 *
 * @param {!Element} target The node to fire the event on.
 * @param {string} type The type of keyboard event (such as 'keyup' or
 * 'keydown').
 * @param {number} keyCode The keyCode for the event.
 * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
 *     Accepted values are shift, ctrl, alt, meta.
 * @param {string=} key The KeyboardEvent.key value for the event.
 * @return {undefined}
 */
export function keyEventOn(target, type, keyCode, modifiers, key) {
  target.dispatchEvent(keyboardEventFor(type, keyCode, modifiers, key));
}

/**
 * Fires a 'keyup' event on a specific node. This event bubbles and is
 * cancellable.
 *
 * @param {!Element} target The node to fire the event on.
 * @param {number} keyCode The keyCode for the event.
 * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
 *     Accepted values are shift, ctrl, alt, meta.
 * @param {string=} key The KeyboardEvent.key value for the event.
 * @return {undefined}
 */
export function keyUpOn(target, keyCode, modifiers, key) {
  keyEventOn(target, 'keyup', keyCode, modifiers, key);
}

/**
 * Simulates a complete key press by firing a `keydown` keyboard event, followed
 * by an asynchronous `keyup` event on a specific node.
 *
 * @param {!Element} target The node to fire the event on.
 * @param {number} keyCode The keyCode for the event.
 * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
 *     Accepted values are shift, ctrl, alt, meta.
 * @param {string=} key The KeyboardEvent.key value for the event.
 * @return {undefined}
 */
export function pressAndReleaseKeyOn(target, keyCode, modifiers, key) {
  keyUpOn(target, keyCode, modifiers, key);
}

/**
 * Simulates a complete 'space' key press by firing a `keydown` keyboard event,
 * followed by an asynchronous `keyup` event on a specific node.
 *
 * @param {!Element} target The node to fire the event on.
 */
export function pressSpace(target) {
  pressAndReleaseKeyOn(target, 32);
}

/**
 * Fires a mouse event on a specific node, at a given set of coordinates.
 * This event bubbles and is cancellable.
 *
 * @param {string} type The type of mouse event (such as 'tap' or 'down').
 * @param {{ x: number, y: number }} xy The (x,y) coordinates the mouse event
 * should be fired from.
 * @param {!Element} node The node to fire the event on.
 * @return {undefined}
 */
export function makeMouseEvent(type, xy, node) {
  const props = {
    bubbles: true,
    cancelable: true,
    clientX: xy.x,
    clientY: xy.y,
    // Allow event to go outside a ShadowRoot.
    composed: true,
    // Make this a primary input.
    buttons:
        1 // http://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
  };
  let e;
  if (HAS_NEW_MOUSE) {
    e = new MouseEvent(type, props);
  } else {
    e = document.createEvent('MouseEvent');
    e.initMouseEvent(
      type,
      props.bubbles,
      props.cancelable,
      null, /* view */
      null, /* detail */
      0, /* screenX */
      0, /* screenY */
      props.clientX,
      props.clientY,
      false, /* ctrlKey */
      false, /* altKey */
      false, /* shiftKey */
      false, /* metaKey */
      0, /* button */
      null /* relatedTarget */
    );
  }
  node.dispatchEvent(e);
}

/**
 * Returns the (x,y) coordinates representing the middle of a node.
 *
 * @param {!Element} node An element.
 * @return {{x: number, y:number}}
 */
export function middleOfNode(node) {
  const bcr = node.getBoundingClientRect();
  return { y: bcr.top + (bcr.height / 2), x: bcr.left + (bcr.width / 2) };
}

/**
 * Generate a click event on a given node, optionally at a given coordinate.
 * @param {!Element} node The node to fire the click event on.
 * @param {{ x: number, y: number }=} xy Optional. The (x,y) coordinates the
 * mouse event should be fired from.
 * @return {undefined}
 */
export function click(node, xy) {
  xy = xy || middleOfNode(node);
  makeMouseEvent('click', xy, node);
}
