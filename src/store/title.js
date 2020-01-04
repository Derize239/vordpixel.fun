/**
 *
 * @flow
 */

import {
  durationToString,
} from '../core/utils';


const TITLE = 'PixelPlanet.fun';

let lastTitle = null;

export default (store) => (next) => (action) => {
  switch (action.type) {
    case 'COOLDOWN_SET': {
      const { coolDown } = store.getState().user;
      const title = `${durationToString(coolDown, true)} | ${TITLE}`;
      if (lastTitle === title) break;
      lastTitle = title;
      document.title = title;
      break;
    }

    case 'COOLDOWN_END': {
      document.title = TITLE;
      break;
    }

    default:
    // nothing
  }

  return next(action);
};
