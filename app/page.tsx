"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Truck, Loader2, Package, MapPin, Clock, TrendingUp, Activity, Zap, RefreshCw } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

export default function OperationsDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastSheetRefreshTime, setLastSheetRefreshTime] = useState<string | null>(null)

  // Fetch data from Google Sheets
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
          const region = row[0] || ""
          const pending = Number.parseInt(String(row[1]).replace(/,/g, "")) || 0
          const topContributor = row[2] || "N/A"
          const orderQty = Number.parseInt(String(row[3]).replace(/,/g, "")) || 0
          const updated = row[4] || ""
          const pendingDispatchHeader = Number.parseInt(String(row[5]).replace(/,/g, "")) || 0
          const ageingBucket = row[8] || ""

          if (region && region.trim() !== "") {
            processedData.push({
              region: region.trim(),
              pending,
              topContributor,
              updated,
              pendingDispatchHeader: pendingDispatchHeader.toString(),
              ageingBucket,
              orderQty,
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

  // Load dashboard data only when sheet changes
  const loadDashboardData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const { data, refreshTime } = await fetchGoogleSheetData()

      if (refreshTime && refreshTime !== lastSheetRefreshTime) {
        if (data.length === 0) {
          throw new Error("No valid data received from Google Sheets")
        }

        setDashboardData(data)
        setLastUpdateTime(new Date(refreshTime))
        setLastSheetRefreshTime(refreshTime)
      } else if (!lastSheetRefreshTime) {
        if (data.length === 0) {
          throw new Error("No valid data received from Google Sheets")
        }

        setDashboardData(data)
        setLastUpdateTime(new Date(refreshTime || new Date()))
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
  }, [loadDashboardData])

  const getStatusClass = (pending: number) => {
    if (pending < 1500) return "green"
    return "red"
  }

  const totalPending = (dashboardData: DashboardData[]) => dashboardData.reduce((sum, item) => sum + item.pending, 0)

  const formatDateTime = (date: Date) => {
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", " |")
  }

  const formatTime = (date: Date) => {
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    return `${timeStr} - ${dateStr}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
  }

  // Prepare chart data
  const getPieChartData = (data: DashboardData[]) => {
    const aggregatedData: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.ageingBucket) {
        aggregatedData[item.ageingBucket] = (aggregatedData[item.ageingBucket] || 0) + item.orderQty;
      }
    });

    const colors = [
      '#FF69B4',
      '#6A5ACD',
      '#9370DB',
      '#3CB371',
      '#FFD700',
      '#87CEEB',
      '#FF4500',
      '#DA70D6',
    ];

    return Object.keys(aggregatedData).map((bucket, index) => ({
      name: bucket,
      value: aggregatedData[bucket],
      color: colors[index % colors.length],
    }));
  };

  const pieChartData = getPieChartData(dashboardData);
  const sortedDashboardData = [...dashboardData].sort((a, b) => b.pending - a.pending)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden relative">
      {/* UI code remains unchanged */}
    </div>
  )
}

  // Responsive styles for 55" TV (4K, 3840x2160) -- scale down from previous vw units
  // We use rem units and max-width wrappers for main content.
  // The grid is limited to a max-width for ideal TV viewing, with large scalable fonts.

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden relative">
      {/* Premium Background Pattern */}
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

      {/* Animated Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none select-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124, 58, 237, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 58, 237, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "grid-move 20s linear infinite",
        }}
      />

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.5); }
          50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.8), 0 0 60px rgba(0, 217, 255, 0.3); }
        }
        @keyframes data-flow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes border-pulse {
          0%, 100% {
            box-shadow: 0 0 5px rgba(124, 58, 237, 0.7), 0 0 10px rgba(0, 217, 255, 0.3);
            opacity: 0.8;
          }
          50% {
            box-shadow: 0 0 25px rgba(124, 58, 237, 1), 0 0 50px rgba(0, 217, 255, 0.6);
            opacity: 1;
          }
        }
        @keyframes card-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(124, 58, 237, 0.3), 0 0 20px rgba(0, 217, 255, 0.1); }
          50% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.6), 0 0 40px rgba(0, 217, 255, 0.2); }
        }
      `}</style>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-950/95 backdrop-blur-xl z-50 text-center">
          <div className="text-center space-y-8 p-16 rounded-3xl bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 shadow-2xl">
            <div className="relative">
              <Loader2 className="w-24 h-24 animate-spin mx-auto text-purple-400" />
              <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-cyan-400/30 animate-ping" />
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                INITIALIZING DASHBOARD
              </div>
              <div className="text-gray-400 text-xl">Connecting to data streams...</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-10 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white rounded-2xl shadow-2xl border border-white/10 text-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <svg className="w-12 h-12 text-indigo-300 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <h2 className="text-xl font-semibold text-indigo-100">Sheet is Updating</h2>
              <p className="text-sm text-indigo-300">Please wait a moment while data syncs. This won’t take long.</p>
              <p className="text-xs text-indigo-400 animate-pulse">Auto-recovery in progress…</p>
            </div>
          </div>
        </div>
      )}

      {/* Main content: limit width for TV, use rem units for scaling */}
      <div className="relative z-10 mx-auto px-8 py-8 space-y-10 w-full" style={{maxWidth: "1920px"}}>
        {/* Premium Header */}
        <div className="relative w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-cyan-600/10 rounded-3xl" />
          <div className="relative bg-gradient-to-r from-gray-900/60 to-slate-900/60 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8 shadow-2xl overflow-hidden w-full">
            <div
              className="absolute inset-0 rounded-3xl opacity-60"
              style={{
                animation: "border-pulse 5s ease-in-out infinite alternate",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "xor",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                padding: "2px",
              }}
            />

            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
              <div className="flex items-center space-x-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Truck className="w-20 h-20 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-9 h-9 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className="absolute inset-0 rounded-2xl opacity-30"
                    style={{ animation: "glow-pulse 6s ease-in-out infinite" }}
                  />
                </div>

                <div className="space-y-2">
                  <div
                    className="font-black tracking-wider relative overflow-hidden leading-none"
                    style={{
                      fontSize: "7rem", // scale for TV, not too big!
                      backgroundImage: "linear-gradient(110deg, #00BFFF 45%, #FFFFFF 55%, #32CD32 65%, #00BFFF)",
                      backgroundSize: "200% 100%",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      animation: "shimmer 5s linear infinite",
                      lineHeight: 1,
                    }}
                  >
                    {totalPending(dashboardData).toLocaleString()}
                  </div>
                  <div className="text-gray-300 text-3xl font-bold uppercase tracking-[0.2em]">
                    Pending for Dispatch
                  </div>
                </div>
              </div>

              <div className="text-right space-y-3">
                <div className="text-2xl font-bold text-white">{formatDateTime(currentTime)}</div>
                <div className="flex items-center justify-end space-x-3 text-gray-300">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="text-xl">
                    Data Last Update: {lastUpdateTime ? formatTime(lastUpdateTime) : "--:--"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="text-gray-400 hover:text-white hover:bg-purple-800/30 transition-colors duration-200"
                    aria-label="Refresh Data"
                  >
                    <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-8 w-full overflow-x-hidden">
          {/* Scorecards */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-8 w-full">
            {sortedDashboardData.slice(0, 6).map((item, index) => {
              const status = getStatusClass(item.pending)
              return (
                <div
                  key={index}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl transition-all duration-700 hover:scale-105 animate-in slide-in-from-bottom-4 fade-in",
                    "bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl",
                    "border shadow-2xl hover:shadow-purple-500/20",
                    status === "red"
                      ? "border-red-500/30 hover:border-red-400/50"
                      : "border-green-500/30 hover:border-green-400/50",
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: "600ms",
                    minHeight: "11rem",
                    maxHeight: "18rem"
                  }}
                >
                  <div
                    className={cn(
                      "absolute inset-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20 leading-6",
                      status === "red"
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : "bg-gradient-to-br from-green-500 to-green-600",
                    )}
                  />

                  <div
                    className={cn(
                      "absolute top-0 left-0 w-full h-2 opacity-60",
                      status === "red"
                        ? "bg-gradient-to-r from-transparent via-red-400 to-transparent"
                        : "bg-gradient-to-r from-transparent via-green-400 to-transparent",
                    )}
                    style={{ animation: "data-flow 4s ease-in-out infinite" }}
                  />

                  <div
                    className="relative z-10 px-8 py-8 space-y-4"
                    style={{ animation: "card-glow 4s ease-in-out infinite" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <MapPin className="w-7 h-7 text-gray-400" />
                        <span className="text-gray-300 uppercase tracking-wider text-2xl font-bold">{item.region}</span>
                      </div>
                      <div
                        className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center shadow-lg",
                          status === "red"
                            ? "bg-gradient-to-br from-red-500 to-red-600"
                            : "bg-gradient-to-br from-green-500 to-green-600",
                        )}
                      >
                        <Package className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div
                        className={cn(
                          "tracking-tight font-extrabold",
                          status === "red" ? "text-red-400" : "text-green-400",
                        )}
                        style={{ fontSize: "3rem" }}
                      >
                        {item.pending.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-lg uppercase tracking-[0.15em] font-medium">
                        PENDING ORDERS
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Chart */}
          <div className="md:col-span-4 w-full">
            <div className="relative h-full bg-gradient-to-br from-gray-900/60 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl overflow-hidden min-h-[22rem] flex flex-col">
              <div
                className="absolute inset-0 rounded-2xl opacity-60"
                style={{
                  animation: "border-pulse 4s ease-in-out infinite alternate",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "xor",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  padding: "2px",
                }}
              />
              <div className="relative z-10 h-full flex flex-col">
                <div className="pb-4 border-b border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl text-white uppercase tracking-wider font-bold font-sans">
                      Ageing Bucket
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-[15rem]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Order Quantity",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="w-full h-full text-lg font-bold"
                  >
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={pieChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#aaa', fontSize: 16 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#aaa', fontSize: 14 }}
                          domain={[0, 'dataMax']}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="value"
                          fill="url(#barGradient)"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Data Table */}
        <div className="relative bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl overflow-x-auto w-full">
          <div
            className="absolute inset-0 rounded-2xl opacity-60"
            style={{
              animation: "border-pulse 4s ease-in-out infinite alternate",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "xor",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              padding: "2px",
            }}
          />
          <div className="relative z-10">
            <div className="pb-4 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white uppercase tracking-wider">MAIN DRIVERS</span>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-transparent">
                    <TableHead className="text-gray-300 font-bold text-xl uppercase tracking-wider py-4 text-center">
                      Region
                    </TableHead>
                    <TableHead className="text-cyan-400 font-extrabold text-xl uppercase tracking-wider py-4 text-center">
                      Top Contributor
                    </TableHead>
                    <TableHead className="text-gray-300 font-bold text-xl uppercase tracking-wider py-4 text-center px-10">
                      Order Qty
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDashboardData.map((item, index) => (
                    <TableRow
                      key={index}
                      className="border-gray-700/30 hover:bg-purple-500/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-extrabold text-white text-xl py-4 text-center shadow">{item.region}</TableCell>
                      <TableCell className="text-cyan-300 text-xl font-bold py-4 whitespace-normal px-20">
                        {item.topContributor}
                      </TableCell>
                      <TableCell className="text-white text-xl font-semibold py-4">{item.orderQty.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 px-4 w-full">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse shadow-lg" />
            <span className="text-lg font-semibold uppercase tracking-wider">
              SOC8_Outbound_SOCPacked_Generated_Report - {formatDate(currentTime)}
            </span>
          </div>
          <div className="text-lg font-semibold lowercase tracking-wider">AUTO-REFRESH: ON DATA CHANGE</div>
        </div>
      </div>
    </div>
  )
}
