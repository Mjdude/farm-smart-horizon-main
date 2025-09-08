
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Droplets, Leaf } from 'lucide-react';

export const FarmOverview: React.FC = () => {
  const farmMetrics = [
    { label: 'Total Area', value: '25 Acres', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Active Crops', value: '4 Types', icon: Leaf, color: 'bg-green-500' },
    { label: 'Water Usage', value: '85%', icon: Droplets, color: 'bg-cyan-500' },
    { label: 'Yield Prediction', value: '+12%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const cropData = [
    { name: 'Wheat', area: 10, yield: 85 },
    { name: 'Corn', area: 8, yield: 92 },
    { name: 'Tomatoes', area: 5, yield: 78 },
    { name: 'Onions', area: 2, yield: 95 },
  ];

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Farm Overview</h3>
        <span className="text-sm text-gray-500">Greenfield Farm</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {farmMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Crop Yield Chart */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Crop Performance</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cropData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value}${name === 'area' ? ' acres' : '%'}`, name === 'area' ? 'Area' : 'Health Score']}
              />
              <Bar dataKey="area" fill="#4CAF50" name="area" />
              <Bar dataKey="yield" fill="#8BC34A" name="yield" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
