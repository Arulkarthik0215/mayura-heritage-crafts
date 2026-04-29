import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, customerData: Customer) => void;
  logout: () => void;
  fetchCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomer = async () => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${api.baseUrl}/customer/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      } else {
        localStorage.removeItem('customer_token');
        setCustomer(null);
      }
    } catch (error) {
      console.error('Failed to fetch customer profile:', error);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  const login = (token: string, customerData: Customer) => {
    localStorage.setItem('customer_token', token);
    setCustomer(customerData);
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        logout,
        fetchCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
