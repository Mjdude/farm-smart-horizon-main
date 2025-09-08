
import React from 'react';
import { TrendingUp, ShoppingCart, Truck } from 'lucide-react';

export const MarketIntelligence: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2">Market Intelligence Hub</h1>
        <p className="text-purple-100 text-lg">Real-time pricing, trends, and marketplace access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="text-purple-500" size={24} />
            <h3 className="text-lg font-semibold">Price Analytics</h3>
          </div>
          <p className="text-gray-600 mb-4">Track commodity prices and market trends</p>
          <button className="farm-button w-full">View Trends</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <ShoppingCart className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold">E-Marketplace</h3>
          </div>
          <p className="text-gray-600 mb-4">Buy and sell agricultural products online</p>
          <button className="farm-button w-full">Browse Market</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Truck className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold">Supply Chain</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage logistics and inventory tracking</p>
          <button className="farm-button w-full">Track Orders</button>
        </div>
      </div>
    </div>
  );
};
