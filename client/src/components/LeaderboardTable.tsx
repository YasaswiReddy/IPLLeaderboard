import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Loader2, ArrowUp, ArrowDown, Minus, MoreVertical } from 'lucide-react';
import type { FantasyTeam } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface LeaderboardTableProps {
  currentUserId?: number;
}

export default function LeaderboardTable({ currentUserId = 7 }: LeaderboardTableProps) {
  const [activeTab, setActiveTab] = useState('overall');
  const [teamFilter, setTeamFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery<FantasyTeam[]>({
    queryKey: ['/api/leaderboard'],
  });

  // Filter by tab
  let filteredData = data || [];
  
  // Filter by team
  if (teamFilter !== 'all') {
    // This would filter by team in a real implementation
    // For now, we'll just return the same data
  }
  
  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Find the current user's rank
  const currentUserIndex = filteredData.findIndex(team => team.userId === currentUserId);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow mb-6 p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <p className="text-red-500">Error loading leaderboard</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <Tabs defaultValue="overall" onValueChange={setActiveTab}>
        <div className="border-b">
          <TabsList className="flex h-auto bg-transparent p-0">
            <TabsTrigger 
              value="overall" 
              className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
            >
              Overall
            </TabsTrigger>
            <TabsTrigger 
              value="weekly" 
              className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
            >
              This Week
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
            >
              Friends
            </TabsTrigger>
            <TabsTrigger 
              value="league" 
              className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
            >
              My League
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Table Content for all tabs */}
        <TabsContent value="overall" className="m-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Team Name</th>
                  <th className="px-6 py-3">Manager</th>
                  <th className="px-6 py-3">This Week</th>
                  <th className="px-6 py-3">Total Points</th>
                  <th className="px-6 py-3">Trend</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((team) => {
                  const isCurrentUser = team.userId === currentUserId;
                  const rankDiff = team.previousRank && team.rank 
                    ? team.previousRank - team.rank
                    : 0;
                  
                  return (
                    <tr 
                      key={team.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${isCurrentUser ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className={`h-8 w-8 rounded-full text-white flex items-center justify-center font-bold
                              ${team.rank === 1 ? 'bg-primary' : 
                                team.rank === 2 ? 'bg-[#b91c1c]' : 
                                team.rank === 3 ? 'bg-[#f59e0b]' : 'bg-gray-500'}`}
                          >
                            {team.rank}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                            {team.user?.name.charAt(0)}
                          </div>
                          <span className={`ml-3 font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                            {team.name}
                          </span>
                          {isCurrentUser && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-primary">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{team.user?.name}</td>
                      <td className="px-6 py-4">
                        <span className={team.weeklyPoints >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {team.weeklyPoints >= 0 ? `+${team.weeklyPoints}` : team.weeklyPoints}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{team.totalPoints.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {rankDiff > 0 ? (
                            <div className="flex items-center text-green-600">
                              <ArrowUp className="h-4 w-4 mr-1" />
                              <span>{Math.abs(rankDiff)}</span>
                            </div>
                          ) : rankDiff < 0 ? (
                            <div className="flex items-center text-red-600">
                              <ArrowDown className="h-4 w-4 mr-1" />
                              <span>{Math.abs(rankDiff)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <Minus className="h-4 w-4 mr-1" />
                              <span>0</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Team</DropdownMenuItem>
                            <DropdownMenuItem>Compare with My Team</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}

                {currentUserRank && currentUserRank > itemsPerPage && !paginatedData.some(team => team.userId === currentUserId) && (
                  <tr className="bg-blue-50">
                    <td colSpan={7} className="px-6 py-3 text-center">
                      <span className="text-primary font-medium">Your rank: {currentUserRank}</span>
                      <Button 
                        variant="link" 
                        className="text-primary ml-2"
                        onClick={() => setCurrentPage(Math.ceil(currentUserRank / itemsPerPage))}
                      >
                        Jump to your position
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="flex items-center text-sm text-gray-500">
              Showing <span className="font-medium mx-1">{startIndex + 1}</span> to <span className="font-medium mx-1">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-medium mx-1">{totalItems}</span> entries
            </div>
            
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show first page, last page, current page, and pages around current
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3 && i === 0) {
                    pageNum = 1;
                  } else if (currentPage > 3 && i === 1) {
                    return (
                      <Button 
                        key="ellipsis1" 
                        variant="outline" 
                        size="sm" 
                        disabled
                      >
                        ...
                      </Button>
                    );
                  } else if (currentPage > 3 && i < 4) {
                    pageNum = currentPage + i - 2;
                  } else if (i === 4) {
                    pageNum = totalPages;
                  }
                }
                
                return (
                  <Button 
                    key={pageNum} 
                    variant={currentPage === pageNum ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="m-0">
          <div className="p-8 text-center text-gray-500">
            Weekly leaderboard will update after the next match.
          </div>
        </TabsContent>
        
        <TabsContent value="friends" className="m-0">
          <div className="p-8 text-center text-gray-500">
            Connect with friends to see how you compare.
          </div>
        </TabsContent>
        
        <TabsContent value="league" className="m-0">
          <div className="p-8 text-center text-gray-500">
            Join or create a league to compete with friends.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
