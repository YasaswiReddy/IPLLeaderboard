import { useQuery } from '@tanstack/react-query';
import { Loader2, CalendarDays, Crown, Zap } from 'lucide-react';
import type { StatsOverview as StatsOverviewType } from '@/lib/types';
import { format } from 'date-fns';

export default function StatsOverview() {
  const { data, isLoading, error } = useQuery<StatsOverviewType>({
    queryKey: ['/api/stats-overview'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-5 flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <p className="text-red-500">Error loading stats overview</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-5 flex items-center">
        <div className="rounded-full bg-blue-100 p-3 mr-4">
          <CalendarDays className="text-primary text-xl" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Next Match</p>
          {data.nextMatch ? (
            <>
              <p className="font-semibold">{data.nextMatch.team1?.shortName} vs {data.nextMatch.team2?.shortName}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(data.nextMatch.date), "MMM d, h:mm a")} IST
              </p>
            </>
          ) : (
            <p className="font-semibold">No upcoming matches</p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5 flex items-center">
        <div className="rounded-full bg-green-100 p-3 mr-4">
          <Crown className="text-green-600 text-xl" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Leader</p>
          {data.currentLeader ? (
            <>
              <p className="font-semibold">{data.currentLeader.name}</p>
              <p className="text-xs text-gray-500">{data.currentLeader.points.toLocaleString()} points</p>
            </>
          ) : (
            <p className="font-semibold">No data available</p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5 flex items-center">
        <div className="rounded-full bg-purple-100 p-3 mr-4">
          <Zap className="text-purple-600 text-xl" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Top Scorer This Week</p>
          {data.topScorer ? (
            <>
              <p className="font-semibold">{data.topScorer.name}</p>
              <p className="text-xs text-gray-500">{data.topScorer.points} points</p>
            </>
          ) : (
            <p className="font-semibold">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
