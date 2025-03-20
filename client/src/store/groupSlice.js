import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import GroupService from '../services/groupService';

// Get all groups
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      return await GroupService.getGroups();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch groups';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get group by ID
export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId, { rejectWithValue }) => {
    try {
      return await GroupService.getGroupById(groupId);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch group details';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Create new group
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await GroupService.createGroup(groupData);
      toast.success('Group created successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create group';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Invite user to group
export const inviteToGroup = createAsyncThunk(
  'groups/inviteToGroup',
  async ({ groupId, email }, { rejectWithValue }) => {
    try {
      const response = await GroupService.inviteUser(groupId, email);
      toast.success('Invitation sent successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send invitation';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    resetGroupError: (state) => {
      state.error = null;
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Group by ID
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Invite to Group
      .addCase(inviteToGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(inviteToGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(inviteToGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetGroupError, clearCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;
