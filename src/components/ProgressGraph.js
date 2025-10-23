import React from "react";
import theme from "../styles/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  LabelList,
} from "recharts";

export default function ProgressGraph({ chartData,  maxPercent, totalPercent}) {

  return (
    <div
      style={{
        width: "92%",
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        padding: 28,
      }}
    >
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
          <YAxis
            type="category"
            dataKey="name"
            width={0}
            tick={null}
            axisLine={false}
            tickLine={false}
          />
          <XAxis
            type="number"
            domain={[0, maxPercent]}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fontSize: 12 }}
          />
          <ReferenceLine
            x={100}
            stroke={theme.colors.textSecondary}
            strokeDasharray="6 3"
            label={
              totalPercent >= 100
                ? null
                : {
                    position: "top",
                    fontSize: 15,
                    fill: theme.colors.textSecondary,
                  }
            }
          />
          <Bar
            dataKey="p1Bar"
            stackId="a"
            fill={theme.colors.p1}
            name="P1 Progress"
            style={(data) =>
              data.isCurrentDay
                ? { boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }
                : {}
            }
          >
            <LabelList
              dataKey="p1Bar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
          <Bar
            dataKey="p2Below100Bar"
            stackId="a"
            fill={theme.colors.p2Below100}
            name="P2 to Baseline"
            style={(data) =>
              data.isCurrentDay
                ? { boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }
                : {}
            }
          >
            <LabelList
              dataKey="p2Below100Bar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
          <Bar
            dataKey="p2Above100Bar"
            stackId="a"
            fill={theme.colors.p2Above100}
            name="P2 Above Baseline"
            style={(data) =>
              data.isCurrentDay
                ? { boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }
                : {}
            }
          >
            <LabelList
              dataKey="p2Above100Bar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}