import { CustomerType } from "../types/types";

export const storeUserData = (userData: CustomerType) => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userData', JSON.stringify(userData));
      console.log('✅ BusinessID stored successfully in sessionStorage');
    }
  } catch (error) {
    console.error('❌ Failed to store BusinessID in sessionStorage:', error);
  }
};

export const getUserData = () => {
  try {
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('userData');
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get BusinessID from sessionStorage:', error);
    return null;
  }
};