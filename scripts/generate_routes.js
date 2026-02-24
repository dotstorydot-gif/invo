const fs = require('fs');
const path = require('path');

const routes = [
    '/purchasing/requests', '/purchasing/rfq', '/purchasing/quotations',
    '/purchasing/orders', '/purchasing/invoices', '/purchasing/returns',
    '/suppliers/directory', '/suppliers/payments', '/suppliers/debit-notes',
    '/payroll/contracts', '/payroll/register', '/payroll/slips',
    '/payroll/advances', '/payroll/items', '/payroll/templates'
];

routes.forEach(route => {
    const fullPath = path.join('/Volumes/sameh/invo/src/app', route);
    fs.mkdirSync(fullPath, { recursive: true });

    const title = path.basename(route).replace(/-/g, ' ');
    const content = `import React from 'react';

export default function Page() {
  return (
    <div className="p-8 overflow-y-auto w-full h-full bg-[#050505]">
      <h1 className="text-3xl font-bold text-white capitalize mb-4">${title}</h1>
      <div className="glass p-6 rounded-2xl border border-white/5">
        <p className="text-gray-400">This module is active and ready for data integration.</p>
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(path.join(fullPath, 'page.tsx'), content);
});
console.log('Successfully generated all placeholder pages.');
