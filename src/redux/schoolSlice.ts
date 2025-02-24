import { createSlice } from '@reduxjs/toolkit';

interface SchoolState {
  selectedSchool: string;
}

const initialState: SchoolState = {
  selectedSchool: '', // Default school
};

const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    setSchool(state, action) {
      state.selectedSchool = action.payload;
    },
  },
});

export const { setSchool } = schoolSlice.actions;
export default schoolSlice.reducer;