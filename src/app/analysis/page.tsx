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
  Area,
  Cell
} from 'recharts';
import { TrendingUp, Sprout, Target, Calendar, Info } from 'lucide-react';

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
    <div className="space-y-8 p-4 md:p-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">Professional Analytics</h1>
          <p className="text-muted-foreground text-lg mt-1">Historical tracking and seasonal growth trajectories.</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="flex items-center gap-3 px-4 py-2 bg-white border-none shadow-sm rounded-2xl">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Season: 2024</span>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Growth Rate</p>
              <h3 className="text-2xl font-bold text-slate-900">+12.4%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prediction Accuracy</p>
              <h3 className="text-2xl font-bold text-slate-900">94.2%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Sprout className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avg pH Level</p>
              <h3 className="text-2xl font-bold text-slate-900">6.7</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-headline">Predicted vs Actual Yields</CardTitle>
                <CardDescription className="text-base">Comparison over the last 5 years (tons/acre)</CardDescription>
              </div>
              <Info className="w-5 h-5 text-muted-foreground/40" />
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full p-8 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '12px' }}
                />
                <Bar dataKey="actual" fill="#A36B27" radius={[6, 6, 0, 0]} name="Actual Yield" barSize={32} />
                <Bar dataKey="predicted" fill="#D6B6AC" radius={[6, 6, 0, 0]} name="AI Forecast" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-headline">Seasonal Soil Trends</CardTitle>
                <CardDescription className="text-base">pH and Moisture stability tracking</CardDescription>
              </div>
              <Sprout className="w-5 h-5 text-muted-foreground/40" />
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full p-8 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={soilHealthData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A36B27" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#A36B27" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ph" 
                  stroke="#A36B27" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPh)" 
                  name="Soil pH" 
                />
                <Area 
                  type="monotone" 
                  dataKey="moisture" 
                  stroke="#60A5FA" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMoisture)" 
                  name="Moisture (%)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-headline">Harvest Productivity Benchmark</CardTitle>
          <CardDescription className="text-base">Regional comparison against top performing Punjab farms</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full p-8 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yieldData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px 16px'
                }} 
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#A36B27" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#A36B27', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }} 
                name="My Productivity" 
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#94A3B8" 
                strokeWidth={2}
                strokeDasharray="8 8" 
                dot={false}
                name="Regional Average" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
