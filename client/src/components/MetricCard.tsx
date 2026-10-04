import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

export default function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 flex items-center ${color}`}>
      <div className="text-4xl mr-4">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
