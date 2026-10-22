/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PosView } from './components/pos/PosView';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { SalesReportView } from './components/reports/SalesReportView';
import { BranchManagementView } from './components/branches/BranchManagementView';
import { NotificationModal } from './components/NotificationModal';

const AppContent: React.FC = () => {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState<'pos' | 'dashboard' | 'inventory' | 'reports' | 'branches'>('pos');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'dashboard' && <AnalyticsDashboard />}
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'reports' && <SalesReportView />}
        {activeTab === 'branches' && <BranchManagementView />}
      </main>

      {/* Low Stock Alerts Notification Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToInventory={() => setActiveTab('inventory')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
