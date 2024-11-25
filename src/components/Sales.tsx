import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Printer, Download, Search, X } from 'lucide-react';
import PrintableReceipt from './PrintableReceipt';

const Sales: React.FC = () => {
  // ... (previous state declarations remain the same)

  const handleCompleteSale = () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (selectedProducts.length === 0) {
      setError('No products selected');
      return;
    }

    if (paymentReceived < total) {
      setError('Insufficient payment');
      return;
    }

    const saleData = {
      items: selectedProducts.map(product => ({
        productId: product.id,
        quantity: product.quantity,
        price: product.price
      })),
      subtotal,
      total,
      discount,
      paymentReceived,
      change,
      date: new Date().toISOString(), // Ensure date is in ISO format
      cashier: user.id,
      storeLocation: 'FC SOLAR',
      type: 'direct' as const,
      customerName: 'Walk-in Customer',
      completedBy: user.id
    };

    try {
      const newSale = addSale(saleData);
      setCurrentSale(newSale);
      setShowTicket(true);

      // Update product quantities
      selectedProducts.forEach(product => {
        updateProductQuantity(product.id, product.quantity, 'Direct Sale');
      });

      // Reset form
      setSelectedProducts([]);
      setDiscount(0);
      setPaymentReceived(0);
      setError('');
    } catch (error) {
      console.error('Error completing sale:', error);
      setError('Failed to complete sale. Please try again.');
    }
  };

  // ... (rest of the component remains the same)
};