import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Loader2, ArrowLeft, Award, TrendingUp, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Player, Performance } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PlayerDetailsResponse extends Player {
  performances: Performance[];
}

export default function PlayerDetails() {
  const { id } = useParams();
  const playerId = id ? parseInt(id) : 0;
  
  const { data, isLoading, error } = useQuery<PlayerDetailsResponse>({
    queryKey: [`/api/players/${playerId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-500">Error loading player details</p>
            <Link href="/" className="text-primary-600 hover:underline mt-4 inline-block">
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Performance data for chart
  const chartData = data.performances.map(perf => ({
    match: `Match ${perf.matchId}`,
    points: perf.fantasyPoints,
    runs: perf.runs,
    wickets: perf.wickets,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Leaderboard
          </Link>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary mr-0 md:mr-6 mb-4 md:mb-0">
                {data.imageUrl ? (
                  <img 
                    src={data.imageUrl} 
                    alt={data.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-500">{data.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">{data.name}</h1>
                  <div className="flex items-center">
                    {data.team?.logoUrl && (
                      <img 
                        src={data.team.logoUrl} 
                        alt={data.team.name} 
                        className="h-6 w-6 mr-2"
                      />
                    )}
                    <p className="text-gray-600">{data.team?.name}</p>
                    
                    <div 
                      className={`ml-4 text-xs px-2 py-0.5 rounded-full
                        ${data.role?.name === "Batsman" ? "bg-green-100 text-green-800" : 
                          data.role?.name === "Bowler" ? "bg-blue-100 text-blue-800" :
                          data.role?.name === "All-rounder" ? "bg-purple-100 text-purple-800" :
                          "bg-orange-100 text-orange-800"}
                      `}
                    >
                      {data.role?.name}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">MATCHES</p>
                    <p className="text-lg font-bold">{data.totalMatches}</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">RUNS</p>
                    <p className="text-lg font-bold">{data.totalRuns}</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">WICKETS</p>
                    <p className="text-lg font-bold">{data.totalWickets}</p>
                  </div>
                  
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <p className="text-xs text-primary-700">FANTASY PTS (AVG)</p>
                    <p className="text-lg font-bold text-primary">
                      {Math.round(data.performances.reduce((sum, perf) => sum + perf.fantasyPoints, 0) / 
                        (data.performances.length || 1))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
              <div className="border-b">
                <TabsList className="flex h-auto bg-transparent p-0">
                  <TabsTrigger 
                    value="overview" 
                    className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performances" 
                    className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
                  >
                    Performances
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stats" 
                    className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
                  >
                    Detailed Stats
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Award className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-semibold">Career Stats</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Batting Average</span>
                          <span className="font-semibold">{data.battingAvg?.toFixed(2) || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Strike Rate</span>
                          <span className="font-semibold">{data.strikeRate?.toFixed(2) || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bowling Average</span>
                          <span className="font-semibold">{data.bowlingAvg?.toFixed(2) || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Economy Rate</span>
                          <span className="font-semibold">{data.economy?.toFixed(2) || "-"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <TrendingUp className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-semibold">Form Summary</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last 3 Matches Avg</span>
                          <span className="font-semibold">
                            {data.performances.length ? 
                              Math.round(data.performances.slice(0, 3).reduce((sum, perf) => sum + perf.fantasyPoints, 0) / 
                              Math.min(data.performances.length, 3)) : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Highest Score</span>
                          <span className="font-semibold">
                            {data.performances.length ? 
                              Math.max(...data.performances.map(perf => perf.runs)) : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Best Bowling</span>
                          <span className="font-semibold">
                            {data.performances.length ? 
                              Math.max(...data.performances.map(perf => perf.wickets)) + "/" + 
                              Math.min(...data.performances.filter(perf => perf.wickets > 0).map(perf => perf.ballsBowled / 6)) : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Form Trend</span>
                          <span className="font-semibold text-green-600">Excellent</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <BarChart3 className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-semibold">Fantasy Value</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Points</span>
                          <span className="font-semibold">
                            {Math.round(data.performances.reduce((sum, perf) => sum + perf.fantasyPoints, 0) / 
                              (data.performances.length || 1))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Points Last Match</span>
                          <span className="font-semibold">
                            {data.performances[0]?.fantasyPoints || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Value for Money</span>
                          <span className="font-semibold text-green-600">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Selection %</span>
                          <span className="font-semibold">76.5%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="match" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="points" name="Fantasy Points" fill="#1e40af" />
                        <Bar yAxisId="right" dataKey="runs" name="Runs" fill="#82ca9d" />
                        <Bar yAxisId="right" dataKey="wickets" name="Wickets" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="performances" className="p-6">
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runs</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balls</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">4s</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">6s</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wickets</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fantasy Pts</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.performances.map((perf) => (
                        <tr key={perf.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">Match {perf.matchId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{perf.runs}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{perf.ballsFaced}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{perf.fours}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{perf.sixes}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {perf.ballsFaced > 0 ? ((perf.runs / perf.ballsFaced) * 100).toFixed(2) : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{perf.wickets}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary">{perf.fantasyPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="p-6">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Detailed statistics will be available after the next few matches.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
