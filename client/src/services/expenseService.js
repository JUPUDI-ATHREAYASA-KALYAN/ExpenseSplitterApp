import apiClient from './apiService';

class ExpenseService {
  // Get expenses for a specific group
  async getExpensesByGroup(groupId) {
    const response = await apiClient.get(`/group/${groupId}/expenses`);
    return response.data;
  }

  // Create new expense
  async createExpense(expenseData) {
    const response = await apiClient.post('/expense', expenseData);
    return response.data;
  }

  // Get specific expense by ID
  async getExpenseById(expenseId) {
    const response = await apiClient.get(`/expense/${expenseId}`);
    return response.data;
  }

  // Settle an expense
  async settleExpense(expenseId, settlementData) {
    const response = await apiClient.post(`/expense/${expenseId}/settle`, settlementData);
    return response.data;
  }

  // Get balances for a group
  async getBalancesByGroup(groupId) {
    const response = await apiClient.get(`/group/${groupId}/balances`);
    return response.data;
  }
}

const expenseService = new ExpenseService();
export default expenseService;
