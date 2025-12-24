"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MovementChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
  title: string
}

export function MovementChart({ data, title }: MovementChartProps) {
  // Transform data for Recharts if needed
  const chartData = data.map((item) => ({
    name: item.name,
    [item.name]: item.value,
  }))

  // Create a single data point with all categories
  const combinedData = data.reduce(
    (acc, item) => {
      acc[item.name] = item.value
      return acc
    },
    { name: "Pergerakan Penduduk" },
  )

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-full w-full">
          <ChartContainer
            config={data.reduce(
              (acc, item) => {
                acc[item.name] = {
                  label: item.name,
                  color: item.color,
                }
                return acc
              },
              {} as Record<string, { label: string; color: string }>,
            )}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[combinedData]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {data.map((entry) => (
                  <Bar
                    key={entry.name}
                    dataKey={entry.name}
                    name={entry.name}
                    fill={entry.color}
                    stroke={entry.color}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

