import React, { createContext, useState, useContext, useEffect } from 'react';

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  discount: number;
  paymentReceived: number;
  change: number;
  date: string;
  cashier: string;
  storeLocation: string;
  type: 'direct' | 'order';
  orderId?: string;
  customerName?: string;
  completedBy: string;
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  getSaleById: (id: string) => Sale | undefined;
  getSalesByUser: (userId: string) => Sale[];
  clearSales: () => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const savedSales = localStorage.getItem('sales');
      return savedSales ? JSON.parse(savedSales) : [];
    } catch (error) {
      console.error('Error loading sales:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sales', JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales:', error);
    }
  }, [sales]);

  const addSale = (saleData: Omit<Sale, 'id'>) => {
    try {
      // Ensure date is in ISO format
      const date = saleData.date || new Date().toISOString();
      
      // Check if this sale already exists (prevent duplicates)
      if (saleData.orderId) {
        const existingSale = sales.find(s => s.orderId === saleData.orderId);
        if (existingSale) {
          console.warn('Sale already exists for this order:', saleData.orderId);
          return existingSale;
        }
      }

      const newSale: Sale = {
        ...saleData,
        id: `SALE-${Date.now()}`,
        date: date,
        type: saleData.orderId ? 'order' : 'direct',
        completedBy: saleData.completedBy || saleData.cashier
      };

      setSales(prevSales => [...prevSales, newSale]);
      return newSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  const getSaleById = (id: string) => {
    return sales.find(sale => sale.id === id);
  };

  const getSalesByUser = (userId: string) => {
    return sales.filter(sale => 
      sale.cashier === userId || sale.completedBy === userId
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const clearSales = () => {
    try {
      setSales([]);
      localStorage.removeItem('sales');
    } catch (error) {
      console.error('Error clearing sales:', error);
    }
  };

  return (
    <SalesContext.Provider value={{
      sales,
      addSale,
      getSaleById,
      getSalesByUser,
      clearSales
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

export type { Sale, SaleItem };