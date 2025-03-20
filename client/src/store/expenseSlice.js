import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import ExpenseService from '../services/expenseService';

// Get expenses for a group
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (groupId, { rejectWithValue }) => {
    try {
      return await ExpenseService.getExpensesByGroup(groupId);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch expenses';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Create a new expense
export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await ExpenseService.createExpense(expenseData);
      toast.success('Expense added successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add expense';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Settle an expense
export const settleExpense = createAsyncThunk(
  'expenses/settleExpense',
  async ({ expenseId, settlementData }, { rejectWithValue }) => {
    try {
      const response = await ExpenseService.settleExpense(expenseId, settlementData);
      toast.success('Payment settled successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to settle payment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get balances for a group
export const fetchBalances = createAsyncThunk(
  'expenses/fetchBalances',
  async (groupId, { rejectWithValue }) => {
    try {
      return await ExpenseService.getBalancesByGroup(groupId);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch balances';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  expenses: [],
  balances: [],
  loading: false,
  error: null
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    resetExpenseError: (state) => {
      state.error = null;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.balances = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.push(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Settle Expense
      .addCase(settleExpense.pending, (state) => {
        state.loading = true;
      })
      .addCase(settleExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(settleExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Balances
      .addCase(fetchBalances.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.balances = action.payload;
      })
      .addCase(fetchBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetExpenseError, clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
