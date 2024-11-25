import React from 'react';

const PrintStyles: React.FC = () => (
  <style>
    {`
      @media print {
        body * {
          visibility: hidden;
        }
        .print-section, .print-section * {
          visibility: visible;
        }
        .print-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-before: always;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa !important;
        }
        tfoot {
          font-weight: bold;
          background-color: #f8f9fa !important;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .print-footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
      }
    `}
  </style>
);

export default PrintStyles;