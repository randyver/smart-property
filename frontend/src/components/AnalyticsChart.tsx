import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  TooltipProps,
  Text,
  Label,
} from "recharts";
import { formatter } from "@/utils/formatter";

// Chart type options
type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "stackedBar"
  | "horizontalBar"
  | "scatter";

interface ChartData {
  [key: string]: string | number;
}

interface AnalyticsChartProps {
  type: ChartType;
  data: ChartData[];
  xKey: string;
  yKey: string | string[];
  title: string;
  dataKey?: string;
  colors?: string[];
  height?: number;
  currency?: boolean;
  percentage?: boolean;
  animate?: boolean;
  stacked?: boolean;
  sorting?: "asc" | "desc" | "none";
  className?: string;
  showLabels?: boolean;
  labelKey?: string;
  formatter?: (value: number) => string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  binData?: boolean;
  numBins?: number;
  legend?:
    | boolean
    | {
        verticalAlign?: "top" | "middle" | "bottom";
        align?: "left" | "center" | "right";
        wrapperStyle?: React.CSSProperties;
      };
}

export default function AnalyticsChart({
  type,
  data,
  xKey,
  yKey,
  title,
  dataKey,
  colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
  height = 300,
  currency = false,
  percentage = false,
  legend = true,
  animate = true,
  stacked = false,
  sorting = "none",
  className = "",
  showLabels = false,
  labelKey,
  formatter: customFormatter,
  xAxisLabel,
  yAxisLabel,
  binData = false,
  numBins = 5,
}: AnalyticsChartProps) {
  const [formattedData, setFormattedData] = useState<ChartData[]>([]);

  // Process and format data for charts
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Create a copy of the data to avoid mutating the original
    let processedData = [...data];

    // Sort data if specified
    if (sorting !== "none") {
      processedData.sort((a, b) => {
        const aValue =
          typeof yKey === "string" ? Number(a[yKey]) : Number(a[yKey[0]]);
        const bValue =
          typeof yKey === "string" ? Number(b[yKey]) : Number(b[yKey[0]]);

        if (sorting === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    // For scatter/line charts with x and y values for relationships, bin the data if requested
    if (
      binData &&
      type === "line" &&
      typeof xKey === "string" &&
      typeof yKey === "string"
    ) {
      // Find min and max for x values
      const xValues = processedData
        .map((item) => Number(item[xKey]))
        .filter((x) => !isNaN(x));
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);

      // Create bins
      const binWidth = (maxX - minX) / numBins;
      const bins: { [key: string]: number[] } = {};

      // Initialize bins
      for (let i = 0; i < numBins; i++) {
        const binStart = minX + i * binWidth;
        const binEnd = binStart + binWidth;
        bins[`${Math.round(binStart)}-${Math.round(binEnd)}`] = [];
      }

      // Assign data points to bins
      processedData.forEach((item) => {
        const x = Number(item[xKey]);
        const y = Number(item[yKey]);
        if (isNaN(x) || isNaN(y)) return;

        const binIndex = Math.min(
          Math.floor((x - minX) / binWidth),
          numBins - 1
        );
        const binStart = minX + binIndex * binWidth;
        const binEnd = binStart + binWidth;
        const binKey = `${Math.round(binStart)}-${Math.round(binEnd)}`;

        bins[binKey].push(y);
      });

      // Calculate average y value for each bin
      const binnedData = Object.entries(bins).map(([range, values]) => {
        if (values.length === 0) return { x: range, y: 0, count: 0 };

        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        return {
          x: range,
          y: avg,
          count: values.length,
        };
      });

      // Sort by bin range (x value)
      binnedData.sort((a, b) => {
        const aStart = Number(a.x.split("-")[0]);
        const bStart = Number(b.x.split("-")[0]);
        return aStart - bStart;
      });

      setFormattedData(binnedData);
    }
    // For pie charts, format data differently
    else if (type === "pie") {
      // Make sure we're using a string key for pie charts
      const valueKey = typeof yKey === "string" ? yKey : yKey[0];
      const pieData = processedData.map((item) => ({
        name: String(item[xKey]),
        value: Number(item[valueKey]),
        ...(labelKey ? { label: item[labelKey] } : {}),
      }));
      setFormattedData(pieData);
    } else {
      setFormattedData(processedData);
    }
  }, [data, type, xKey, yKey, sorting, labelKey, binData, numBins]);

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
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-md text-sm text-black">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="flex items-center"
            >
              <span className="mr-2">{entry.name}:</span>
              <span className="font-semibold">
                {formatValue(entry.value as number)}
              </span>
            </p>
          ))}
          {type === "line" && binData && payload[0].payload.count && (
            <p className="text-gray-500 text-xs mt-1">
              Jumlah properti: {payload[0].payload.count}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom pie chart label
  const renderCustomizedPieLabel = (props: any) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
      value,
    } = props;
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
    const animationProps = animate
      ? {
          animationDuration: 1000,
          animationEasing: "ease-in-out",
        }
      : {};

    // Determine if we're using a single key or array of keys for Y axis
    const yKeys = Array.isArray(yKey) ? yKey : [yKey];

    switch (type) {
      case "line":
        return (
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
            {...animationProps}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey={binData ? "x" : xKey}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              height={50}
            >
              {xAxisLabel && (
                <Label
                  value={xAxisLabel}
                  position="bottom"
                  offset={20}
                  style={{
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#6B7280",
                  }}
                />
              )}
            </XAxis>
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              tickFormatter={formatValue}
              width={80}
            >
              {yAxisLabel && (
                <Label
                  value={yAxisLabel}
                  position="left"
                  angle={-90}
                  offset={10}
                  style={{
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#6B7280",
                  }}
                />
              )}
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            {(legend === true || typeof legend === "object") && (
              <Legend
                wrapperStyle={{
                  fontSize: 12,
                  paddingTop: 10,
                  ...(typeof legend === "object" ? legend.wrapperStyle : {}),
                }}
                verticalAlign={
                  typeof legend === "object" && legend.verticalAlign
                    ? legend.verticalAlign
                    : "bottom"
                }
                align={
                  typeof legend === "object" && legend.align
                    ? legend.align
                    : "center"
                }
              />
            )}
            <Line
              type="monotone"
              dataKey={binData ? "y" : yKeys[0]}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name={dataKey || yKeys[0]}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
            {...animationProps}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              height={50}
            >
              {xAxisLabel && (
                <Label
                  value={xAxisLabel}
                  position="bottom"
                  offset={40}
                  style={{
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#6B7280",
                  }}
                />
              )}
            </XAxis>
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              tickFormatter={formatValue}
              width={80}
            >
              {yAxisLabel && (
                <Label
                  value={yAxisLabel}
                  position="left"
                  angle={-90}
                  offset={-10}
                  style={{
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#6B7280",
                  }}
                />
              )}
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            {legend && (
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            )}
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
      case "horizontalBar":
        return (
          <BarChart
            data={formattedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 75, bottom: 30 }}
            {...animationProps}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#e5e7eb"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              tickFormatter={formatValue}
              height={50}
            >
              {xAxisLabel && (
                <Label
                  value={xAxisLabel}
                  position="bottom"
                  offset={40}
                  style={{
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#6B7280",
                  }}
                />
              )}
            </XAxis>
            <YAxis
              dataKey={xKey}
              type="category"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              width={70}
            >
              {yAxisLabel && (
                <Label
                  value={yAxisLabel}
                  position="left"
                  angle={-90}
                  offset={40}
                  style={{
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#6B7280",
                  }}
                />
              )}
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            {legend && (
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            )}
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
      case "stackedBar":
        return (
          <BarChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
            {...animationProps}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              height={50}
            >
              {xAxisLabel && (
                <Label
                  value={xAxisLabel}
                  position="bottom"
                  offset={20}
                  style={{
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#6B7280",
                  }}
                />
              )}
            </XAxis>
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              tickFormatter={formatValue}
              width={80}
            >
              {yAxisLabel && (
                <Label
                  value={yAxisLabel}
                  position="left"
                  angle={-90}
                  offset={-10}
                  style={{
                    textAnchor: "middle",
                    fontSize: "12px",
                    fill: "#6B7280",
                  }}
                />
              )}
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            {legend && (
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            )}
            {yKeys.map((key, i) => (
              <Bar
                key={key.toString()}
                dataKey={key}
                fill={colors[i % colors.length]}
                name={dataKey || key}
                stackId="a"
                radius={[
                  i === yKeys.length - 1 ? 4 : 0,
                  i === yKeys.length - 1 ? 4 : 0,
                  i === 0 ? 4 : 0,
                  i === 0 ? 4 : 0,
                ]}
              />
            ))}
          </BarChart>
        );
      case "pie":
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
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={formatValue} />
            {legend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              />
            )}
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
