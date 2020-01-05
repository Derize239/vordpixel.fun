/* @flow */

import type { Action } from '../actions/types';

export type UserState = {
  name: string,
  center: Cell,
  wait: ?Date,
  coolDown: ?number, // ms
  placeAllowed: boolean,
  online: ?number,
  // messages are sent by api/me, like not_verified status
  messages: Array,
  mailreg: boolean,
  // stats
  totalPixels: number,
  dailyTotalPixels: number,
  ranking: number,
  dailyRanking: number,
  // global stats
  totalRanking: Object,
  totalDailyRanking: Object,
  // user factions
  userFactions: Array,
  // all factions
  factions: Array,
  // chat
  chatMessages: Array,
  // minecraft
  minecraftname: string,
};

const initialState: UserState = {
  name: null,
  center: [0, 0],
  wait: null,
  coolDown: null,
  placeAllowed: true,
  online: null,
  messages: [],
  mailreg: false,
  totalRanking: {},
  totalDailyRanking: {},
  userFactions: [],
  factions: [],
  chatMessages: [['info', 'Welcome to the PixelPlanet Chat']],
  minecraftname: null,
};

export default function user(
  state: UserState = initialState,
  action: Action,
): UserState {
  switch (action.type) {
    case 'COOLDOWN_SET': {
      const { coolDown } = action;
      return {
        ...state,
        coolDown,
      };
    }

    case 'COOLDOWN_END': {
      return {
        ...state,
        coolDown: null,
        wait: null,
      };
    }

    case 'SET_PLACE_ALLOWED': {
      const { placeAllowed } = action;
      return {
        ...state,
        placeAllowed,
      };
    }

    case 'SET_WAIT': {
      const { wait: duration } = action;

      const wait = duration ? new Date(Date.now() + duration) : null;

      return {
        ...state,
        wait,
      };
    }

    case 'PLACE_PIXEL': {
      let { totalPixels, dailyTotalPixels } = state;
      totalPixels += 1;
      dailyTotalPixels += 1;
      return {
        ...state,
        totalPixels,
        dailyTotalPixels,
      };
    }

    case 'RECEIVE_ONLINE': {
      const { online } = action;
      return {
        ...state,
        online,
      };
    }

    case 'RECEIVE_CHAT_MESSAGE': {
      const { name, text } = action;
      let { chatMessages } = state;
      console.log('received chat message');
      if (chatMessages.length > 50) {
        chatMessages = chatMessages.slice(-50);
      }
      return {
        ...state,
        chatMessages: chatMessages.concat([[name, text]]),
      };
    }

    case 'RECEIVE_CHAT_HISTORY': {
      const { data: chatMessages } = action;
      return {
        ...state,
        chatMessages,
      };
    }

    case 'RECEIVE_COOLDOWN': {
      const { waitSeconds } = action;
      const wait = waitSeconds
        ? new Date(Date.now() + waitSeconds * 1000)
        : null;
      return {
        ...state,
        wait,
        coolDown: null,
      };
    }

    case 'RECEIVE_ME': {
      const {
        name,
        mailreg,
        totalPixels,
        dailyTotalPixels,
        ranking,
        dailyRanking,
        minecraftname,
        factions,
      } = action;
      const messages = action.messages ? action.messages : [];
      return {
        ...state,
        name,
        messages,
        mailreg,
        totalPixels,
        dailyTotalPixels,
        ranking,
        dailyRanking,
        minecraftname,
        userFactions: factions,
      };
    }

    case 'RECEIVE_STATS': {
      const { totalRanking, totalDailyRanking } = action;
      return {
        ...state,
        totalRanking,
        totalDailyRanking,
      };
    }

    case 'RECIEVE_FACTIONS': {
      const { factions } = action;
      return {
        ...state,
        factions,
      };
    }

    case 'SET_NAME': {
      const { name } = action;
      return {
        ...state,
        name,
      };
    }

    case 'SET_MINECRAFT_NAME': {
      const { minecraftname } = action;
      return {
        ...state,
        minecraftname,
      };
    }

    case 'REM_FROM_MESSAGES': {
      const { message } = action;
      const messages = [...state.messages];
      const index = messages.indexOf(message);
      if (index > -1) {
        messages.splice(index);
      }
      return {
        ...state,
        messages,
      };
    }

    case 'SET_MAILREG': {
      const { mailreg } = action;
      return {
        ...state,
        mailreg,
      };
    }

    default:
      return state;
  }
}
