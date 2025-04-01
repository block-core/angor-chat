import {Capacitor} from '@capacitor/core';
import {PaletteMode} from '@mui/material';
import {Channel, Platform, RelayDict} from 'types';

export const DEFAULT_RELAYS: RelayDict = {
    'wss://relay.primal.net': {read: true, write: true},
    'wss://relay.nostr.band': {read: true, write: true},
    'wss://relay1.angor.io': {read: true, write: true},
    'wss://relay2.angor.io': {read: true, write: true},
    'wss://relay.damus.io': {read: true, write: true},
    'wss://relay.snort.social': {read: true, write: false},
    'wss://nos.lol': {read: true, write: true},
};

export const MESSAGE_PER_PAGE = 30;
export const ACCEPTABLE_LESS_PAGE_MESSAGES = 5;
export const SCROLL_DETECT_THRESHOLD = 5;

export const GLOBAL_CHAT: Channel = {
    id: 'aa752aef9bc47b8cfb765b6ae08f83745dac563bf564f9c8defffc680cad1300',
    name: 'Angor Chat',
    about: 'Whatever you want it to be, just be nice',
    picture: 'https://angor.io/angor-logo.jpg',
    creator: '5f432a9f39b58ff132fc0a4c8af10d42efd917d8076f68bb7f2f91ed7d4f6a41',
    created: 1678198928
};

export const PLATFORM = Capacitor.getPlatform() as Platform;

export const DEFAULT_THEME: PaletteMode = 'dark';