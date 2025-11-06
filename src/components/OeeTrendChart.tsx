import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

interface DailyOeeData {
  calendar_date: string;
  availability_avg: number;
  performance_avg: number;
  quality_avg: number;
  oee_avg: number;
  total_units_sum: number;
  defective_units_sum: number;
}

interface OeeTrendChartProps {
  data: DailyOeeData[];
  isLoading: boolean;
}

export function OeeTrendChart({ data, isLoading }: OeeTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <p className="text-muted-foreground">No trend data available</p>
      </Card>
    );
  }

  // Transform data for chart (convert to percentages)
  const chartData = data.map((day) => ({
    date: format(parseISO(day.calendar_date), "MMM dd"),
    fullDate: day.calendar_date,
    Availability: (day.availability_avg * 100).toFixed(1),
    Performance: (day.performance_avg * 100).toFixed(1),
    Quality: (day.quality_avg * 100).toFixed(1),
    OEE: (day.oee_avg * 100).toFixed(1),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.fullDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">OEE Trend Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Daily performance metrics over the selected period
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "14px" }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="OEE"
            stroke="#27ae60"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Availability"
            stroke="#3498db"
            strokeWidth={2}
            dot={{ r: 3 }}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="Performance"
            stroke="#9b59b6"
            strokeWidth={2}
            dot={{ r: 3 }}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="Quality"
            stroke="#2ecc71"
            strokeWidth={2}
            dot={{ r: 3 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Band Reference */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-2">OEE Performance Bands</p>
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Excellence", color: "#27ae60", range: "≥85%" },
            { label: "Good", color: "#2ecc71", range: "75-84%" },
            { label: "Acceptable", color: "#f1c40f", range: "60-74%" },
            { label: "Fair", color: "#f39c12", range: "40-59%" },
            { label: "Unacceptable", color: "#e74c3c", range: "<40%" },
          ].map((band) => (
            <div key={band.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: band.color }}
              />
              <span className="text-xs text-muted-foreground">
                {band.label} ({band.range})
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
