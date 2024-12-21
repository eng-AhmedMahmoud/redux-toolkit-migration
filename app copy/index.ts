import 'whatwg-fetch';
import { createStore } from '@vfde-sails/core';
import './style.scss';
import mountVvlHardwareDetailContainer from './container/App';
import { APP_CONTAINER } from 'Constant';
import { trackingMiddleware } from '@vfde-sails/tracking';

const appContainer = document.getElementById(APP_CONTAINER);

if (appContainer) {
    createStore({}, [trackingMiddleware]);
    mountVvlHardwareDetailContainer();
}
else {
    // eslint-disable-next-line no-console
    console.log('no appContainer provided.');
}
