import { useState } from 'react';

export interface AdminBookingFormValues {
  first_name?: string;
  last_name?: string;
  gender?: 'male' | 'female';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  nationality?: string;
  booking_date: string;
  end_date?: string;
  adults: number;
  children: number;
  special_requests?: string;
  dietary_requirements?: string;
  package_id?: string;
  destination_id?: string;
  selected_services?: { id: string; name: string; price: number; quantity: number }[];
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  payment_status?: 'pending' | 'paid' | 'refunded';
}

const defaultValues: AdminBookingFormValues = {
  first_name: '',
  last_name: '',
  gender: undefined,
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  nationality: '',
  booking_date: '',
  end_date: '',
  adults: 1,
  children: 0,
  special_requests: '',
  dietary_requirements: '',
  package_id: '',
  destination_id: '',
  selected_services: [],
  status: 'confirmed',
  payment_status: 'pending'
};

export const useAdminBookingForm = (initial: Partial<AdminBookingFormValues> = {}) => {
  const [values, setValues] = useState<AdminBookingFormValues>({ ...defaultValues, ...initial });

  const setField = <K extends keyof AdminBookingFormValues>(key: K, value: AdminBookingFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setValues({ ...defaultValues, ...initial });

  return { values, setField, reset };
};

export default useAdminBookingForm;


