import initThinky from 'thinky';
import {db as dbConfig} from '../../../config';

export const thinky = initThinky(dbConfig);
const {type, r, Query} = thinky;

export {type, r, Query};
