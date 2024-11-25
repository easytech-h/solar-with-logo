import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

interface PrintableReceiptProps {
  sale: {
    id: string;
    date: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    total: number;
    discount: number;
    paymentReceived: number;
    change: number;
    cashier: string;
    storeLocation: string;
    type?: 'direct' | 'order';
    customerName?: string;
  };
}

const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ sale }) => {
  const { products } = useInventory();
  const { users } = useAuth();

  const getCashierName = (userId: string) => {
    const user = users?.find((u) => u.id === userId);
    return user?.fullName || userId;
  };

  return (
    <div className="printable-receipt">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-receipt, .printable-receipt * {
              visibility: visible;
            }
            .printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
          .printable-receipt {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm;
            padding: 5mm;
            font-size: 12px;
            line-height: 1.2;
          }
          .receipt-logo {
            width: 20mm;
            height: auto;
            margin: 0 auto 2mm;
            display: block;
          }
        `}
      </style>
      <img
        src="/fcsolar.png"
        alt="FC Solar Logo"
        className="receipt-logo"
      />
      <div className="text-center font-bold mb-2">FC SOLAR</div>
      <div className="text-center mb-3">
        {sale.type === 'direct' ? 'Direct Sale Receipt' : 'Order Sale Receipt'}
      </div>

      <div className="mb-2">
        <div>Date: {new Date(sale.date).toLocaleString()}</div>
        <div>Receipt No: {sale.id}</div>
        <div>Cashier: {getCashierName(sale.cashier)}</div>
        <div>Customer: {sale.customerName || 'Walk-in Customer'}</div>
      </div>

      <div className="border-top border-bottom mb-2">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <tr key={index}>
                  <td>{product?.name || 'Unknown Product'}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">HTG {item.price.toFixed(2)}</td>
                  <td className="text-right">
                    HTG {(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>HTG {sale.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span>HTG {sale.discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>HTG {sale.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Received:</span>
          <span>HTG {sale.paymentReceived.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Change:</span>
          <span>HTG {sale.change.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center text-sm">
        <p>MERCI POUR VOTRE ACHAT !</p>
        <p>FC SOLAR SOLUTION ENERGIE </p>
        <p>Le plus complet en Service,garantie et qualité. </p>
        <p>Grand rue espagnole,Ouanaminthe ,HAITI </p>
        <p>Tel: (509) 4104-7284 / 4068-0436</p>
      </div>
    </div>
  );
};

export default PrintableReceipt;
