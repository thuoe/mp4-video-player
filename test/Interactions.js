/* eslint-disable no-param-reassign */
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
