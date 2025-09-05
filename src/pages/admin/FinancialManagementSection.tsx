import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Download, Upload, CreditCard, Receipt, FileText, Users, Calendar } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import PaymentProcessingTab from '../../components/admin/financial/PaymentProcessingTab';
import ReceiptManagementTab from '../../components/admin/financial/ReceiptManagementTab';
import { colors, typography, componentSizes, borderRadius, shadows, components } from '../../styles/designSystem';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  monthlyGrowth: number;
  recentTransactions: Transaction[];
  paymentMethods: PaymentMethodStats[];
  monthlyRevenue: MonthlyRevenue[];
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  booking_id?: string;
  payment_method?: string;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

interface MonthlyRevenue {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

const FinancialManagementSection: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

  const tabs = [
    { id: 'overview', label: 'Financial Overview', icon: DollarSign, description: 'Key financial metrics and trends' },
    { id: 'payments', label: 'Payment Processing', icon: CreditCard, description: 'Process payments and manage transactions' }
  ];

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings for income calculation
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Financial data query error:', bookingsError);
        throw bookingsError;
      }

      console.log('Loaded bookings for financial data:', bookings);
      
      // Process financial data from bookings
      const processedData = processFinancialData(bookings || []);
      console.log('Processed financial data:', processedData);
      setFinancialData(processedData);
      
    } catch (error: any) {
      console.error('Error fetching financial data:', error);
      showToast('error', 'Error', `Failed to load financial data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processFinancialData = (bookings: any[]): FinancialData => {
    // Calculate income from confirmed/completed bookings
    const confirmedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(b.status));
    const totalIncome = confirmedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
    
    // Mock expenses data (in real app, this would come from expenses table)
    const totalExpenses = totalIncome * 0.35; // Assume 35% expense ratio
    const netProfit = totalIncome - totalExpenses;
    const monthlyGrowth = 12.5; // This would be calculated from previous period

    // Process payment methods
    const paymentMethodMap = new Map();
    confirmedBookings.forEach(booking => {
      const method = booking.payment_method || 'Credit Card';
      if (paymentMethodMap.has(method)) {
        const existing = paymentMethodMap.get(method);
        paymentMethodMap.set(method, {
          count: existing.count + 1,
          total: existing.total + (booking.total_amount || 0)
        });
      } else {
        paymentMethodMap.set(method, {
          count: 1,
          total: booking.total_amount || 0
        });
      }
    });

    const paymentMethods = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0
    }));

    // Process monthly revenue
    const monthlyMap = new Map();
    confirmedBookings.forEach(booking => {
      const date = new Date(booking.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyMap.has(monthKey)) {
        const existing = monthlyMap.get(monthKey);
        monthlyMap.set(monthKey, {
          income: existing.income + (booking.total_amount || 0),
          expenses: existing.expenses + ((booking.total_amount || 0) * 0.35)
        });
      } else {
        const income = booking.total_amount || 0;
        const expenses = income * 0.35;
        monthlyMap.set(monthKey, { income, expenses });
      }
    });

    const monthlyRevenue = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        profit: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    // Recent transactions (mock data based on bookings)
    const recentTransactions: Transaction[] = confirmedBookings.slice(0, 10).map(booking => ({
      id: booking.id,
      type: 'income' as const,
      amount: booking.total_amount || 0,
      description: `Booking: ${booking.package_name} - ${booking.customer_name}`,
      category: 'Booking Revenue',
      date: booking.created_at,
      booking_id: booking.id,
      payment_method: booking.payment_method || 'Credit Card'
    }));

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      monthlyGrowth,
      recentTransactions,
      paymentMethods,
      monthlyRevenue
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  const handleExport = () => {
    showToast('info', 'Export Started', 'Generating financial report...');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'payments':
        return <PaymentProcessingTab />;
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {financialData ? formatCurrency(financialData.totalIncome) : '$0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              +{financialData?.monthlyGrowth || 0}% from last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {financialData ? formatCurrency(financialData.totalExpenses) : '$0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600">
                {financialData ? formatCurrency(financialData.netProfit) : '$0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-orange-600">
                {financialData?.recentTransactions.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {financialData?.recentTransactions.length ? (
            <div className="space-y-4">
              {financialData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderIncomeTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h3>
        <p className="text-gray-600">Income tracking functionality will be implemented here.</p>
      </div>
    </div>
  );

  const renderExpensesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Management</h3>
        <p className="text-gray-600">Expense management functionality will be implemented here.</p>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h3>
        <p className="text-gray-600">Financial reporting functionality will be implemented here.</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f29520]"></div>
        <span className="ml-3 text-lg text-gray-600">Loading financial data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
                     <div className="flex items-center justify-between">
                 <div>
                   <h1 className={`${typography.h1} text-gray-900`}>Financial Management</h1>
                   <p className={`${typography.body} text-gray-600 mt-2`}>Manage payments, receipts, and financial operations</p>
                 </div>
                 <div className="flex space-x-3">
                   <button
                     onClick={handleAddTransaction}
                     className={`${components.button.secondary} ${componentSizes.button.md} flex items-center space-x-2`}
                   >
                     <Plus className={componentSizes.icon.sm} />
                     <span>Add Transaction</span>
                   </button>
                   <button
                     onClick={handleExport}
                     className={`${components.button.outline} ${componentSizes.button.md} flex items-center space-x-2`}
                   >
                     <Download className={componentSizes.icon.sm} />
                     <span>Export Report</span>
                   </button>
                 </div>
               </div>

                     {/* Tabs */}
               <div className={components.card.base}>
                 <div className="border-b border-gray-200">
                   <nav className="flex px-6 py-4 space-x-1">
                     {tabs.map((tab) => {
                       const Icon = tab.icon;
                       return (
                         <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id as any)}
                           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                             activeTab === tab.id
                               ? `${components.button.secondary} shadow-md`
                               : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                           }`}
                         >
                           <Icon className={componentSizes.icon.sm} />
                           <span>{tab.label}</span>
                         </button>
                       );
                     })}
                   </nav>
                 </div>
                 <div className={componentSizes.card.padding}>
                   {renderTabContent()}
                 </div>
               </div>
    </div>
  );
};

export default FinancialManagementSection;
