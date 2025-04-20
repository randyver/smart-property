'use client';
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

// Chart type options
type ChartType = 'line' | 'bar' | 'pie' | 'radar';

interface ChartData {
  [key: string]: string | number;
}

interface AnalyticsChartProps {
  type: ChartType;
  data: ChartData[];
  xKey: string;
  yKey: string;
  title: string;
  dataKey?: string;
  colors?: string[];
  height?: number;
}

export default function AnalyticsChart({
  type,
  data,
  xKey,
  yKey,
  title,
  dataKey,
  colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
  height = 300,
}: AnalyticsChartProps) {
  const [formattedData, setFormattedData] = useState<ChartData[]>([]);
 
  // Process and format data for charts
  useEffect(() => {
    if (!data || data.length === 0) return;
   
    // For pie charts, format data differently
    if (type === 'pie') {
      const pieData = data.map(item => ({
        name: String(item[xKey]),
        value: Number(item[yKey])
      }));
      setFormattedData(pieData);
    } else {
      setFormattedData(data);
    }
  }, [data, type, xKey, yKey]);

  // Render loading state if no data
  if (!formattedData || formattedData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }
 
  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={colors[0]}
              activeDot={{ r: 8 }}
              name={dataKey || yKey}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey={yKey}
              fill={colors[0]}
              name={dataKey || yKey}
            />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
          </PieChart>
        );
      default:
        return null;
    }
  };

  const chart = renderChart();
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
     
      <div className="w-full" style={{ height: `${height}px` }}>
        {chart ? (
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Unsupported chart type</p>
          </div>
        )}
      </div>
    </div>
  );
}