'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const pricing = require('../lib/pricing');
const invoice = require('../lib/invoice');

test('CURRENT BEHAVIOUR: order pricing uses HSN GST and discounts before tax', () => {
  const items = [{ id: 1, name: 'Rice', hsn: '1006', price: 1000, qty: 1 }];

  assert.deepEqual(pricing.computeTotals(items, 'SAVE10'), {
    subtotal: 1000,
    discount: 100,
    taxable: 900,
    tax: 45,
    cgst: 22.5,
    sgst: 22.5,
    total: 945,
    lines: [{
      id: 1,
      name: 'Rice',
      hsn: '1006',
      gstPercent: 5,
      gross: 1000,
      discount: 100,
      taxable: 900,
      tax: 45,
      net: 945
    }]
  });
});

test('invoice figures match the totals charged by order pricing', () => {
  const order = {
    items: [{ id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 1000, qty: 1 }],
    coupon: 'SAVE10',
    total: 945,
    tax: 45
  };

  const figures = invoice.computeInvoiceFigures(order);
  assert.deepEqual({
    subtotal: figures.subtotal,
    discount: figures.discount,
    tax: figures.tax,
    cgst: figures.cgst,
    sgst: figures.sgst,
    total: figures.total,
    rowGstPercent: figures.rows[0].gstPercent,
    rowTax: figures.rows[0].lineTax
  }, {
    subtotal: 1000,
    discount: 100,
    tax: 45,
    cgst: 22.5,
    sgst: 22.5,
    total: 945,
    rowGstPercent: 5,
    rowTax: 45
  });

  assert.equal(figures.total, order.total);
});
