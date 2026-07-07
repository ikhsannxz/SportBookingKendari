'use client'

import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LineChart as LineChartIcon, BarChart as BarChartIcon } from 'lucide-react'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatMonth(monthKey: string) {
  // monthKey is YYYY-MM
  try {
    const date = parseISO(`${monthKey}-01`)
    return format(date, 'MMM yyyy', { locale: id })
  } catch (e) {
    return monthKey
  }
}

interface AnalyticsChartsProps {
  monthlyBookingData: { month: string; bookings: number }[]
  monthlyRevenueData: { month: string; revenue: number }[]
}

export function AnalyticsCharts({ monthlyBookingData, monthlyRevenueData }: AnalyticsChartsProps) {
  const formattedBookingData = monthlyBookingData.map(d => ({
    ...d,
    label: formatMonth(d.month)
  }))

  const formattedRevenueData = monthlyRevenueData.map(d => ({
    ...d,
    label: formatMonth(d.month)
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Pendapatan Bulanan */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Pendapatan Bulanan</CardTitle>
          <CardDescription>Pendapatan terverifikasi per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          {formattedRevenueData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    dy={10} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Pendapatan']}
                    labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '8px' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Pendapatan"
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <EmptyState
                icon="lineChart"
                title="Belum Ada Data"
                description="Belum ada data pendapatan bulanan."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking per Bulan */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Booking per Bulan</CardTitle>
          <CardDescription>Total booking (termasuk yang belum dibayar) per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          {formattedBookingData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedBookingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    dy={10} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                  />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Total Booking']}
                    labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '8px' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="bookings" name="Booking" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <EmptyState
                icon="barChart"
                title="Belum Ada Data"
                description="Belum ada data booking per bulan."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
