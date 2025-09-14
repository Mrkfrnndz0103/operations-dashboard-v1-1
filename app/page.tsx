"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  AreaChart,
  Area,
  LabelList,
} from "recharts"
import { Menu, Search, Bell, MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// --- DATA INTERFACE & API CONFIG ---

interface DashboardData {
  region: string
  pending: number
  topContributor: string
  updated: string
  pendingDispatchHeader: string
  ageingBucket: string
  orderQty: number
}

const API_KEY = "AIzaSyB_hsL7DIB1P7yxxqOVM6sk7Gf2eaX0GLc"
const GOOGLE_SHEET_ID = "1Dx2UcHhfS8BSBbPbVM_VoY7WEdIjepeGKYK8KFl-OOQ"
const SHEET_NAME = "Dashboard_Data"
const RANGE = "A1:J13"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#FF8042", "#0088FE"];

export default function OperationsDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSheetRefreshTime, setLastSheetRefreshTime] = useState<string | null>(null)

  const fetchGoogleSheetData = useCallback(async (): Promise<{ data: DashboardData[]; refreshTime: string }> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.values && data.values.length > 1) {
        const processedData: DashboardData[] = []
        const refreshTime = data.values[1] && data.values[1][4] ? data.values[1][4] : ""

        for (let i = 1; i < data.values.length; i++) {
          const row = data.values[i]
          if (row[0] && row[0].trim() !== "") {
            processedData.push({
              region: row[0].trim(),
              pending: Number.parseInt(String(row[1]).replace(/,/g, "")) || 0,
              topContributor: row[2] || "N/A",
              orderQty: Number.parseInt(String(row[3]).replace(/,/g, "")) || 0,
              updated: row[4] || "",
              pendingDispatchHeader: (Number.parseInt(String(row[5]).replace(/,/g, "")) || 0).toString(),
              ageingBucket: row[8] || "",
            })
          }
        }
        return { data: processedData, refreshTime }
      } else {
        throw new Error("No data found in the sheet")
      }
    } catch (error) {
      throw error
    }
  }, [])

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const { data, refreshTime } = await fetchGoogleSheetData()

      if (refreshTime && refreshTime !== lastSheetRefreshTime) {
        if (data.length === 0) throw new Error("No valid data received from Google Sheets")
        setDashboardData(data)
        setLastSheetRefreshTime(refreshTime)
      } else if (!lastSheetRefreshTime) {
        if (data.length === 0) throw new Error("No valid data received from Google Sheets")
        setDashboardData(data)
        setLastSheetRefreshTime(refreshTime)
      }
      setLoading(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load data")
      setLoading(false)
    }
  }, [fetchGoogleSheetData, lastSheetRefreshTime])

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 60000) // Auto-refresh every 60 seconds
    return () => clearInterval(interval)
  }, [loadDashboardData])

  // --- DATA TRANSFORMATION FOR CHARTS ---
  const sortedDashboardData = [...dashboardData].sort((a, b) => b.pending - a.pending);

  const scorecards = sortedDashboardData.slice(0, 5).map(item => ({
    title: item.region,
    value: item.pending.toLocaleString(),
    topContributor: item.topContributor,
    orderQty: item.orderQty.toLocaleString(),
    chartData: [{ x: 1, y: Math.random() * 10 }, { x: 2, y: Math.random() * 15 }, { x: 3, y: Math.random() * 8 }, { x: 4, y: Math.random() * 12 }, { x: 5, y: Math.random() * 18 }]
  }));

  const ageingBucketData = [...dashboardData].reduce((acc, item) => {
    if (item.ageingBucket) {
      const existing = acc.find(i => i.name === item.ageingBucket);
      if (existing) {
        existing.value += item.orderQty;
      } else {
        acc.push({ name: item.ageingBucket, value: item.orderQty });
      }
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a,b) => b.value - a.value);

  const pendingByRegionData = sortedDashboardData.map(item => ({ name: item.region, Pending: item.pending }));

  const orderQtyByRegionData = sortedDashboardData.map(item => ({ name: item.region, OrderQuantity: item.orderQty }));

  if (loading) {
    return (
      <div className="dark bg-background min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Dashboard Data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dark bg-background min-h-screen w-full flex items-center justify-center">
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-6 rounded-lg">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{error}</p>
          <Button onClick={loadDashboardData} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }


  return (
    <div className="dark bg-background min-h-screen w-full text-foreground relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, #7C3AED 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, #00D9FF 0%, transparent 50%),
                  linear-gradient(45deg, transparent 40%, rgba(124, 58, 237, 0.1) 50%, transparent 60%)
                `,
              }}
            />
        </div>
        <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none select-none animate-grid-move"
            style={{
              backgroundImage: `
                linear-gradient(rgba(124, 58, 237, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(124, 58, 237, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
        />
      <header className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search" className="pl-10 w-64 bg-card" />
          </div>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white" onClick={loadDashboardData}>
            Refresh Report
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {scorecards.map((card, i) => (
             <Card key={i} className="bg-card border animate-card-glow animate-border-pulse" style={{ animationDelay: `${i * 100}ms`}}>
                <div className="h-full bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-lg flex flex-col justify-between">
                    <div>
                        <CardHeader className="p-0 flex-row items-center justify-between">
                            <CardTitle className="text-3xl font-bold text-white">{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-4 space-y-2">
                            <div className="text-6xl font-extrabold text-primary">{card.value}</div>
                            <p className="text-lg text-muted-foreground font-medium">PENDING ORDERS</p>
                        </CardContent>
                    </div>
                    <div>
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-lg font-bold text-muted-foreground">Top Contributor:</p>
                            <p className="text-2xl font-bold text-white">{card.topContributor} - {card.orderQty}</p>
                        </div>
                        <div className="h-16 mt-4 -mb-6 -mx-6">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={card.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                  <defs>
                                      <linearGradient id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.4}/>
                                          <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <Area type="monotone" dataKey="y" stroke={COLORS[i % COLORS.length]} strokeWidth={2} fillOpacity={1} fill={`url(#color${i})`} />
                              </AreaChart>
                          </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ageing Bucket (Donut) */}
          <Card className="lg:col-span-1 bg-card border animate-border-pulse animate-card-glow">
             <div className="h-full bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-lg">
                <CardHeader>
                    <CardTitle>Orders by Ageing Bucket</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie data={ageingBucketData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                            {ageingBucketData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }}/>
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                </CardContent>
             </div>
          </Card>

          {/* Pending Orders (Area) */}
          <Card className="lg:col-span-2 bg-card border animate-border-pulse animate-card-glow">
            <div className="h-full bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-lg">
                <CardHeader>
                    <CardTitle>Pending Orders by Region</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={pendingByRegionData}>
                          <defs>
                              <linearGradient id="pendingOrdersGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="#888888" />
                          <YAxis stroke="#888888" />
                          <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                          <Legend />
                          <Area type="monotone" dataKey="Pending" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#pendingOrdersGradient)">
                            <LabelList dataKey="Pending" position="top" fill="#FFFFFF" />
                          </Area>
                        </AreaChart>
                    </ResponsiveContainer>
                    </div>
                </CardContent>
             </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Quantity by Region */}
            <Card className="lg:col-span-2 bg-card border animate-border-pulse animate-card-glow">
                <div className="h-full bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-lg">
                    <CardHeader>
                        <CardTitle>Order Quantity by Region</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={orderQtyByRegionData}>
                                <defs>
                                    <linearGradient id="orderQtyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#888888" />
                                <YAxis stroke="#888888" />
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }}/>
                                <Area type="monotone" dataKey="OrderQuantity" stroke="#82ca9d" strokeWidth={2} fillOpacity={1} fill="url(#orderQtyGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                        </div>
                    </CardContent>
                </div>
            </Card>

            {/* Ageing Bucket Distribution */}
            <Card className="lg:col-span-1 bg-card border animate-border-pulse animate-card-glow">
                 <div className="h-full bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-lg">
                    <CardHeader>
                        <CardTitle>Ageing Bucket Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageingBucketData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                                <XAxis dataKey="name" stroke="#888888" />
                                <YAxis stroke="#888888" />
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }}/>
                                <Bar dataKey="value">
                                    {
                                        ageingBucketData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))
                                    }
                                </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </div>

      </main>
    </div>
  )
}
