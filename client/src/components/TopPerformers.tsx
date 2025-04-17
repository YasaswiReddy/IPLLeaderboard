import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import type { TopPerformer } from '@/lib/types';

export default function TopPerformers() {
  const { data, isLoading, error } = useQuery<TopPerformer[]>({
    queryKey: ['/api/top-performers'],
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Top Performers This Week</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Top Performers This Week</h3>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-red-500">Error loading top performers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">Top Performers This Week</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.player.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary">
                {item.player.imageUrl ? (
                  <img 
                    src={item.player.imageUrl} 
                    alt={item.player.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-500">
                      {item.player.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold">{item.player.name}</h4>
                <p className="text-sm text-gray-600">{item.player.team?.name}</p>
                <div className="flex items-center mt-1">
                  <div 
                    className={`text-xs px-2 py-0.5 rounded-full
                      ${item.player.role?.name === "Batsman" ? "bg-green-100 text-green-800" : 
                        item.player.role?.name === "Bowler" ? "bg-blue-100 text-blue-800" :
                        item.player.role?.name === "All-rounder" ? "bg-purple-100 text-purple-800" :
                        "bg-orange-100 text-orange-800"}
                    `}
                  >
                    {item.player.role?.name}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">POINTS</p>
                  <p className="font-bold text-primary">{item.performance.fantasyPoints}</p>
                </div>
                
                {item.player.role?.name === "Bowler" ? (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">WICKETS</p>
                      <p className="font-bold">{item.performance.wickets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ECON</p>
                      <p className="font-bold">{item.player.economy?.toFixed(1) || "-"}</p>
                    </div>
                  </>
                ) : item.player.role?.name === "All-rounder" ? (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">RUNS</p>
                      <p className="font-bold">{item.performance.runs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">WICKETS</p>
                      <p className="font-bold">{item.performance.wickets}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">RUNS</p>
                      <p className="font-bold">{item.performance.runs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">SR</p>
                      <p className="font-bold">{item.player.strikeRate?.toFixed(1) || "-"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-3 text-center border-t">
              <Link href={`/players/${item.player.id}`}>
                <a className="text-primary text-sm font-medium hover:text-primary-800">
                  View Full Stats
                </a>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
