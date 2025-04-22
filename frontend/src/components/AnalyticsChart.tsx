'use client';
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, TooltipProps
} from 'recharts';
import { formatter } from '@/utils/formatter';

// Chart type options
type ChartType = 'line' | 'bar' | 'pie' | 'stackedBar' | 'horizontalBar';

interface ChartData {
  [key: string]: string | number;
}

interface AnalyticsChartProps {
  type: ChartType;
  data: ChartData[];
  xKey: string;
  yKey: string | string[];  // Allow array for stacked bar charts
  title: string;
  dataKey?: string;
  colors?: string[];
  height?: number;
  currency?: boolean;
  percentage?: boolean;
  legend?: boolean;
  animate?: boolean;
  stacked?: boolean;
  sorting?: 'asc' | 'desc' | 'none';
  className?: string;
  showLabels?: boolean;
  labelKey?: string;
  formatter?: (value: number) => string;
}

export default function AnalyticsChart({
  type,
  data,
  xKey,
  yKey,
  title,
  dataKey,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  height = 300,
  currency = false,
  percentage = false,
  legend = true,
  animate = true,
  stacked = false,
  sorting = 'none',
  className = '',
  showLabels = false,
  labelKey,
  formatter: customFormatter,
}: AnalyticsChartProps) {
  const [formattedData, setFormattedData] = useState<ChartData[]>([]);
 
  // Process and format data for charts
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Create a copy of the data to avoid mutating the original
    let processedData = [...data];
    
    // Sort data if specified
    if (sorting !== 'none') {
      processedData.sort((a, b) => {
        const aValue = typeof yKey === 'string' ? Number(a[yKey]) : Number(a[yKey[0]]);
        const bValue = typeof yKey === 'string' ? Number(b[yKey]) : Number(b[yKey[0]]);
        
        if (sorting === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }
   
    // For pie charts, format data differently
    if (type === 'pie') {
      // Make sure we're using a string key for pie charts
      const valueKey = typeof yKey === 'string' ? yKey : yKey[0];
      const pieData = processedData.map(item => ({
        name: String(item[xKey]),
        value: Number(item[valueKey]),
        ...(labelKey ? { label: item[labelKey] } : {})
      }));
      setFormattedData(pieData);
    } else {
      setFormattedData(processedData);
    }
  }, [data, type, xKey, yKey, sorting, labelKey]);

  // Format values for display (with currency or percent)
  const formatValue = (value: number) => {
    if (customFormatter) {
      return customFormatter(value);
    }
    
    if (currency) {
      return formatter.formatCurrency(value);
    }
    if (percentage) {
      return formatter.formatPercentage(value);
    }
    return formatter.formatNumber(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-md text-sm text-black">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center">
              <span className="mr-2">{entry.name}:</span>
              <span className="font-semibold">{formatValue(entry.value as number)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom pie chart label
  const renderCustomizedPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, value } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null; // Don't show labels for small slices
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
 
  // Render the appropriate chart based on type
  const renderChart = () => {
    // Common props for animations
    const animationProps = animate ? {
      animationDuration: 1000,
      animationEasing: "ease-in-out"
    } : {};
    
    // Determine if we're using a single key or array of keys for Y axis
    const yKeys = Array.isArray(yKey) ? yKey : [yKey];
    
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            {...animationProps}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey={xKey}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            {legend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {yKeys.map((key, i) => (
              <Line
                key={key.toString()}
                type="monotone"
                dataKey={key}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name={dataKey || key}
              />
            ))}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            {...animationProps}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey={xKey} 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            {legend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {yKeys.map((key, i) => (
              <Bar
                key={key.toString()}
                dataKey={key}
                fill={colors[i % colors.length]}
                name={dataKey || key}
                stackId={stacked ? "stack" : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case 'horizontalBar':
        return (
          <BarChart
            data={formattedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 75, bottom: 5 }}
            {...animationProps}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatValue}
            />
            <YAxis 
              dataKey={xKey}
              type="category"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            {legend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {yKeys.map((key, i) => (
              <Bar
                key={key.toString()}
                dataKey={key}
                fill={colors[i % colors.length]}
                name={dataKey || key}
                stackId={stacked ? "stack" : undefined}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        );
      case 'stackedBar':
        return (
          <BarChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            {...animationProps}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey={xKey}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            {legend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {yKeys.map((key, i) => (
              <Bar
                key={key.toString()}
                dataKey={key}
                fill={colors[i % colors.length]}
                name={dataKey || key}
                stackId="a"
                radius={[i === yKeys.length - 1 ? 4 : 0, i === yKeys.length - 1 ? 4 : 0, i === 0 ? 4 : 0, i === 0 ? 4 : 0]}
              />
            ))}
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart {...animationProps}>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? renderCustomizedPieLabel : undefined}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatValue} />
            {legend && <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
          </PieChart>
        );
      default:
        return null;
    }
  };

  const chart = renderChart();
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="font-bold text-lg mb-4 text-gray-800">{title}</h3>
     
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