import React, { createContext, useState, useContext, useCallback } from 'react';
import { useSales } from './SalesContext';
import { useUser } from './UserContext';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  email: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'mobile' | 'bank_transfer';
  orderDate: string;
  notes?: string;
  createdBy?: string;
  completedBy?: string;
  completedDate?: string;
  advancePayment: number;
  discount?: number;
  saleId?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getCompletedOrdersByUser: (userId: string) => Order[];
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logActivity } = useUser();
  const { addSale } = useSales();
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const saveOrders = (updatedOrders: Order[]) => {
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const createSaleFromOrder = (order: Order) => {
    // Create sale record
    const sale = {
      id: `SALE-${Date.now()}`,
      items: order.items,
      subtotal: order.totalAmount,
      total: order.finalAmount,
      discount: order.discount || 0,
      paymentReceived: order.advancePayment,
      change: 0,
      date: new Date().toISOString(),
      cashier: order.completedBy || order.createdBy || 'System',
      storeLocation: 'FC SOLAR',
      type: 'order' as const,
      orderId: order.id,
      customerName: order.customerName,
      completedBy: order.completedBy || order.createdBy || 'System'
    };

    // Add the sale
    const newSale = addSale(sale);

    logActivity(
      order.completedBy || 'system',
      'SALE_CREATED_FROM_ORDER',
      `Sale created from order ${order.id}`
    );

    return newSale.id;
  };

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'orderDate'>) => {
    setIsLoading(true);
    try {
      const newOrder: Order = {
        ...orderData,
        id: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString()
      };
      const updatedOrders = [...orders, newOrder];
      saveOrders(updatedOrders);
      logActivity(newOrder.createdBy || 'system', 'ORDER_CREATED', `New order ${newOrder.id} created`);
    } catch (error) {
      console.error('Error adding order:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orders, logActivity]);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
    setIsLoading(true);
    try {
      const updatedOrders = orders.map(order => {
        if (order.id === id) {
          const updatedOrder = { ...order, ...updates };

          // If status is being updated to completed
          if (updates.status === 'completed' && !order.saleId) {
            // Add completion metadata
            updatedOrder.completedDate = new Date().toISOString();
            updatedOrder.completedBy = updates.completedBy || order.createdBy;
            
            // Create sale and store the sale ID
            const saleId = createSaleFromOrder(updatedOrder);
            updatedOrder.saleId = saleId;

            logActivity(
              updatedOrder.completedBy || 'system',
              'ORDER_COMPLETED',
              `Order ${order.id} completed by ${updatedOrder.completedBy}`
            );
          } else if (updates.status && updates.status !== order.status) {
            logActivity(
              order.createdBy || 'system',
              'ORDER_STATUS_UPDATED',
              `Order ${order.id} status updated: ${order.status} → ${updates.status}`
            );
          }

          return updatedOrder;
        }
        return order;
      });

      saveOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orders, logActivity, createSaleFromOrder]);

  const deleteOrder = useCallback((id: string) => {
    setIsLoading(true);
    try {
      const order = orders.find(o => o.id === id);
      if (order) {
        logActivity(
          order.createdBy || 'system',
          'ORDER_DELETED',
          `Order ${order.id} deleted`
        );
      }
      const updatedOrders = orders.filter(order => order.id !== id);
      saveOrders(updatedOrders);
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orders, logActivity]);

  const getOrderById = useCallback((id: string) => {
    return orders.find(order => order.id === id);
  }, [orders]);

  const getCompletedOrdersByUser = useCallback((userId: string) => {
    return orders.filter(order => 
      order.status === 'completed' && 
      (order.createdBy === userId || order.completedBy === userId)
    );
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrder,
      deleteOrder,
      getOrderById,
      getCompletedOrdersByUser,
      isLoading
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export type { Order, OrderItem };