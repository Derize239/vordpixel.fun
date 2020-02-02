/* eslint-disable react/jsx-filename-extension */
/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import fetch from 'isomorphic-fetch'; // TODO put in the beggining with webpack!

import './components/font.css';

// import initAds, { requestAds } from './ui/ads';
import onKeyPress from './controls/keypress';
import {
  receivePixelUpdate,
  receiveCoolDown,
  fetchMe,
  fetchStats,
  initTimer,
  urlChange,
  receiveOnline,
  receiveChatMessage,
  receiveChatHistory,
  setMobile,
  joinFaction,
} from './actions';
import store from './ui/store';

import App from './components/App';

import { initRenderer, getRenderer } from './ui/renderer';
import ProtocolClient from './socket/ProtocolClient';

function init() {
  const invitePattern = /^\/invite\/(.+)$/g;
  const matches = invitePattern.exec(window.location.pathname);
  if (matches !== null) {
    store.dispatch(joinFaction(matches[1]));
  }

  initRenderer(store, false);

  ProtocolClient.on('pixelUpdate', ({
    i, j, offset, color,
  }) => {
    store.dispatch(receivePixelUpdate(i, j, offset, color));
  });
  ProtocolClient.on('cooldownPacket', (waitSeconds) => {
    store.dispatch(receiveCoolDown(waitSeconds));
  });
  ProtocolClient.on('onlineCounter', ({ online }) => {
    store.dispatch(receiveOnline(online));
  });
  ProtocolClient.on('chatMessage', (name, text) => {
    store.dispatch(receiveChatMessage(name, text));
  });
  ProtocolClient.on('chatHistory', (data) => {
    store.dispatch(receiveChatHistory(data));
  });
  ProtocolClient.on('changedMe', () => {
    store.dispatch(fetchMe());
  });

  window.addEventListener('hashchange', () => {
    store.dispatch(urlChange());
  });

  // check if on mobile
  //
  function checkMobile() {
    store.dispatch(setMobile(true));
    document.removeEventListener('touchstart', checkMobile, false);
  }
  document.addEventListener('touchstart', checkMobile, false);

  store.dispatch(initTimer());

  store.dispatch(fetchMe());
  ProtocolClient.connect();

  store.dispatch(fetchStats());
  setInterval(() => {
    store.dispatch(fetchStats());
  }, 300000);
}
init();

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('app'),
  );

  document.addEventListener('keydown', onKeyPress, false);

  // garbage collection
  function runGC() {
    const renderer = getRenderer();

    const chunks = renderer.getAllChunks();
    if (chunks) {
      const curTime = Date.now();
      let cnt = 0;
      chunks.forEach((value, key) => {
        if (curTime > value.timestamp + 300000) {
          cnt++;
          const [z, i, j] = value.cell;
          if (!renderer.isChunkInView(z, i, j)) {
            if (value.isBasechunk) {
              ProtocolClient.deRegisterChunk([i, j]);
            }
            chunks.delete(key);
          }
        }
      });
      // eslint-disable-next-line no-console
      console.log('Garbage collection cleaned', cnt, 'chunks');
    }
  }
  setInterval(runGC, 300000);
});
