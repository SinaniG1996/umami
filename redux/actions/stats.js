import { createSlice } from '@reduxjs/toolkit';

const stats = createSlice({
  name: 'stats',
  initialState: [],
  reducers: {
    updateStats(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { updateStats } = stats.actions;

export default stats.reducer;

export function setStats(data) {
  return dispatch => {
    return dispatch(updateStats(data));
  };
}
