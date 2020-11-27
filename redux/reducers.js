import { combineReducers } from 'redux';
import app from './actions/app';
import user from './actions/user';
import websites from './actions/websites';
import queries from './actions/queries';
import stats from './actions/stats';

export default combineReducers({ app, user, websites, queries, stats });
