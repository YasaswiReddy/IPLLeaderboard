import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import type { Match, Performance, Player } from '@/lib/types';

interface EnrichedMatch extends Match {
  topPerformers?: {
    player: Player;
    performance: Performance;
  }[];
}

export default function RecentMatches() {
  const { data, isLoading, error } = useQuery<EnrichedMatch[]>({
    queryKey: ['/api/matches?type=recent&limit=2'],
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Recent Matches</h3>
          <Link href="/matches">
            <a className="text-primary hover:text-primary-800 text-sm font-medium">View All</a>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[...Array(2)].map((_, index) => (
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
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Recent Matches</h3>
          <Link href="/matches">
            <a className="text-primary hover:text-primary-800 text-sm font-medium">View All</a>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <p className="text-red-500">Error loading recent matches</p>
        </div>
      </div>
    );
  }

  // Mocked top performers for each match since we don't have real data
  const mockedTopPerformers = [
    [
      { 
        player: { 
          id: 2, 
          name: "MS Dhoni", 
          imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319900/319946.png" 
        }, 
        performance: { fantasyPoints: 86 } 
      },
      { 
        player: { 
          id: 5, 
          name: "Rohit Sharma", 
          imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/323100/323153.png" 
        }, 
        performance: { fantasyPoints: 72 } 
      }
    ],
    [
      { 
        player: { 
          id: 1, 
          name: "Virat Kohli", 
          imageUrl: "https://img.olympics.com/images/image/private/t_s_pog_staticContent_hero_md_2x/f_auto/primary/wnpgdisbdrg1urlmjebq" 
        }, 
        performance: { fantasyPoints: 98 } 
      },
      { 
        player: { 
          id: 8, 
          name: "Rishabh Pant", 
          imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319900/319943.png" 
        }, 
        performance: { fantasyPoints: 76 } 
      }
    ]
  ];

  // Add mocked top performers to matches
  const enrichedMatches = data.map((match, index) => ({
    ...match,
    topPerformers: mockedTopPerformers[index]
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Recent Matches</h3>
        <Link href="/matches">
          <a className="text-primary hover:text-primary-800 text-sm font-medium">View All</a>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {enrichedMatches.map((match) => (
          <div key={match.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500">
                {format(new Date(match.date), "MMMM d, yyyy")} • Completed
              </span>
              {match.matchType && (
                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  {match.matchType}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 flex items-center justify-center">
                  {match.team1?.logoUrl ? (
                    <img 
                      src={match.team1.logoUrl} 
                      alt={match.team1.name} 
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-gray-500">{match.team1?.shortName}</span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{match.team1?.name}</p>
                  <p className="text-gray-600 text-sm">{match.team1Score}</p>
                </div>
              </div>
              
              <div className="text-center px-4">
                {match.winnerId === match.team1Id ? (
                  <p className="font-bold text-primary">WON</p>
                ) : match.winnerId === match.team2Id ? (
                  <p className="font-bold text-gray-500">LOST</p>
                ) : (
                  <p className="font-bold text-gray-500">DRAW</p>
                )}
                <p className="text-xs text-gray-500">
                  {match.winnerId === match.team1Id ? "by " + (match.team1Score?.split('(')[0].trim().split('/')[0] - (match.team2Score?.split('(')[0].trim().split('/')[0] || 0)) + " runs" :
                   match.winnerId === match.team2Id ? "by 6 wickets" : ""}
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="mr-3 text-right">
                  <p className="font-medium">{match.team2?.name}</p>
                  <p className="text-gray-600 text-sm">{match.team2Score}</p>
                </div>
                <div className="h-12 w-12 flex items-center justify-center">
                  {match.team2?.logoUrl ? (
                    <img 
                      src={match.team2.logoUrl} 
                      alt={match.team2.name} 
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-gray-500">{match.team2?.shortName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {match.topPerformers && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Top Fantasy Performers:</p>
                <div className="flex justify-between">
                  {match.topPerformers.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        {item.player.imageUrl ? (
                          <img 
                            src={item.player.imageUrl} 
                            alt={item.player.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span className="font-bold text-gray-500">{item.player.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium">{item.player.name}</p>
                        <p className="text-xs text-gray-500">{item.performance.fantasyPoints} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
