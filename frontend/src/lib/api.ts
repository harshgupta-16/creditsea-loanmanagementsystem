const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: HeadersInit = {};
    const token = this.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(options.body instanceof FormData),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  // Auth
  async register(email: string, password: string, fullName?: string) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  async login(email: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Borrower
  async updateProfile(data: {
    fullName: string;
    pan: string;
    dateOfBirth: string;
    monthlySalary: number;
    employmentMode: string;
  }) {
    return this.request<any>('/borrower/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadSalarySlip(file: File) {
    const formData = new FormData();
    formData.append('salarySlip', file);

    return this.request<any>('/borrower/salary-slip', {
      method: 'POST',
      body: formData,
    });
  }

  async applyForLoan(loanAmount: number, tenure: number) {
    return this.request<any>('/borrower/apply', {
      method: 'POST',
      body: JSON.stringify({ loanAmount, tenure }),
    });
  }

  async getMyLoans() {
    return this.request<any>('/borrower/loans');
  }

  // Dashboard
  async getLeads() {
    return this.request<any>('/dashboard/leads');
  }

  async getLoans(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<any>(`/dashboard/loans${query}`);
  }

  async sanctionLoan(id: string) {
    return this.request<any>(`/dashboard/loans/${id}/sanction`, {
      method: 'PUT',
    });
  }

  async rejectLoan(id: string, reason: string) {
    return this.request<any>(`/dashboard/loans/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async disburseLoan(id: string) {
    return this.request<any>(`/dashboard/loans/${id}/disburse`, {
      method: 'PUT',
    });
  }

  async recordPayment(id: string, data: { utrNumber: string; amount: number; date: string }) {
    return this.request<any>(`/dashboard/loans/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayments(loanId: string) {
    return this.request<any>(`/dashboard/loans/${loanId}/payments`);
  }

  async getAllUsers() {
    return this.request<any>('/dashboard/users');
  }
}

export const api = new ApiClient();
