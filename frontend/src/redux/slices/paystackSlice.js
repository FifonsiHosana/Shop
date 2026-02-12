import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createSlice } from "@reduxjs/toolkit";

//Thunk to initialize payment
export const initializePayment = createAsyncThunk(
  "payment/initialize",
  async (checkoutId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:9000/api/payment/intializePayment`,
        {
          checkoutId,
        },
      );

    return response.data.authorization_url;
       
    } catch (error) {
      error;
      return rejectWithValue(error.response.data);
    }
  },
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    loading: false,
    error: null,
    paymentUrl: "",
  },
  reducers: {},
  extraReducers: (builders) => {
    builders
      .addCase(initializePayment.pending, (state) => {state.loading = true})
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentUrl = action.payload;
        console.log(action.payload);
        console.log(state.paymentUrl);
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});


export default paymentSlice.reducer; 
