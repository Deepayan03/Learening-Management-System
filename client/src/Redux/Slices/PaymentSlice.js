import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../Helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
  key: "",
  subscription_id: "",
  isPaymentVerified: false,
  allPayments: {},
  finalMonths: {},
  monthlySalesRecord: [],
};

export const getRazorPayId = createAsyncThunk("/razorPay", async () => {
  try {
    const response = await axiosInstance.get("/payments/key");
    console.log("Id------");
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    console.log(error);
  }
});

export const purchaseCourseBundles = createAsyncThunk(
  "/purchaseCourseBundles",
  async () => {
    try {
      const response = await axiosInstance.post("/payments/subscribe");
      console.log(response);
      return response?.data;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }
);

export const verifyUserPayment = createAsyncThunk(
  "/purchase-course",
  async (data) => {
    console.log(data)
    try {
      const response = await axiosInstance.post("/payments/verify", {
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
        razorpay_subscription_id: data.razorpay_subscription_id,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }
);

export const getPaymentRecord = createAsyncThunk(
  "/payments/record",
  async () => {
    try {
      const response = axiosInstance.get("/payments?count=100");
      toast.promise(response, {
        loading: "Loading payment records...",
        success: (data) => {
          return data?.data?.message;
        },
        error: (error) => {
          return error?.response?.data?.message;
        },
      });
      return await response?.data;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "/payments/cancel",
  async () => {
    try {
      const response = await axiosInstance.post("/payments/unsubscribe");
      toast.promise(response, {
        loading: "Cancelling subscription...",
        success: (data) => {
          return data?.data?.message;
        },
        error: (error) => {
          return error?.response?.data?.message;
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }
);

const razorPaySlice = createSlice({
  name: "razorPay",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRazorPayId.fulfilled, (state, action) => {
        state.key = action?.payload?.key;
      })
      .addCase(purchaseCourseBundles.fulfilled, (state, action) => {
        state.subscription_id = action?.payload?.id;
      })
      .addCase(verifyUserPayment.fulfilled, (state, action) => {
        console.log(action.payload);
        toast.success(action?.payload?.message);
        state.isPaymentVerified = action?.payload?.success;
      })
      .addCase(getPaymentRecord.fulfilled, (state, action) => {
        state.allPayments = action?.payload;
        state.finalMonths = action?.payload?.finalMonths;
        state.monthlySalesRecord = action?.payload?.monthlySalesRecord;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isPaymentVerified = false;
      })
      .addCase(verifyUserPayment.rejected, (state, action) => {
        toast.error(action?.payload?.message);
        state.isPaymentVerified = action?.payload?.success;
      });
  },
});
export default razorPaySlice.reducer;
