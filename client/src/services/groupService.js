import apiClient from './apiService';

class GroupService {
  // Get all groups for current user
  async getGroups() {
    try {
      const response = await apiClient.get('/group');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Return empty array instead of throwing error to prevent UI crashes
      return [];
    }
  }

  // Get specific group by ID
  async getGroupById(groupId) {
    try {
      const response = await apiClient.get(`/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching group ${groupId}:`, error);
      throw error;
    }
  }

  // Create new group
  async createGroup(groupData) {
    try {
      const response = await apiClient.post('/group', groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Invite user to group
  async inviteUser(groupId, email) {
    try {
      const response = await apiClient.post(`/group/${groupId}/invite`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error inviting user to group ${groupId}:`, error);
      throw error;
    }
  }

  // Accept group invitation
  async acceptInvitation(invitationId) {
    try {
      const response = await apiClient.post(`/group/invitations/${invitationId}/accept`);
      return response.data;
    } catch (error) {
      console.error(`Error accepting invitation ${invitationId}:`, error);
      throw error;
    }
  }

  // Reject group invitation
  async rejectInvitation(invitationId) {
    try {
      const response = await apiClient.post(`/group/invitations/${invitationId}/reject`);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting invitation ${invitationId}:`, error);
      throw error;
    }
  }

  // Get pending invitations
  async getPendingInvitations() {
    try {
      const response = await apiClient.get('/group/invitations');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      throw error;
    }
  }
}

const groupService = new GroupService();
export default groupService;
