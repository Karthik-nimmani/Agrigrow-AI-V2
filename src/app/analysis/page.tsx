"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

const yieldData = [
  { year: '2019', actual: 2.1, predicted: 2.0 },
  { year: '2020', actual: 2.4, predicted: 2.3 },
  { year: '2021', actual: 1.8, predicted: 2.2 },
  { year: '2022', actual: 2.6, predicted: 2.5 },
  { year: '2023', actual: 2.5, predicted: 2.6 },
  { year: '2024', actual: null, predicted: 2.8 },
];

const soilHealthData = [
  { month: 'Jan', ph: 6.5, moisture: 40 },
  { month: 'Feb', ph: 6.6, moisture: 35 },
  { month: 'Mar', ph: 6.8, moisture: 45 },
  { month: 'Apr', ph: 6.7, moisture: 50 },
  { month: 'May', ph: 6.8, moisture: 42 },
];

export default function AnalysisPage() {
  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold font-headline">Professional Analytics</h1>
        <p className="text-muted-foreground">Historical tracking and seasonal growth trajectories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Predicted vs Actual Yields</CardTitle>
            <CardDescription>Comparison over the last 5 years (tons/acre)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F1F5F9' }}
                />
                <Legend />
                <Bar dataKey="actual" fill="#A36B27" radius={[4, 4, 0, 0]} name="Actual Yield" />
                <Bar dataKey="predicted" fill="#D6B6AC" radius={[4, 4, 0, 0]} name="AI Forecast" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Seasonal Soil Trends</CardTitle>
            <CardDescription>pH and Moisture stability tracking</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={soilHealthData}>
                <defs>
                  <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A36B27" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A36B27" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="ph" stroke="#A36B27" fillOpacity={1} fill="url(#colorPh)" name="Soil pH" />
                <Line type="monotone" dataKey="moisture" stroke="#60A5FA" strokeWidth={2} dot={{ r: 4 }} name="Moisture (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Harvest Productivity Benchmark</CardTitle>
          <CardDescription>Regional comparison against top performing Punjab farms</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yieldData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Line type="stepAfter" dataKey="actual" stroke="#A36B27" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="My Productivity" />
              <Line type="monotone" dataKey="predicted" stroke="#94A3B8" strokeDasharray="5 5" name="Regional Average" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
