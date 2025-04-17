import Header from '@/components/Header';
import StatsOverview from '@/components/StatsOverview';
import LeaderboardTable from '@/components/LeaderboardTable';
import TopPerformers from '@/components/TopPerformers';
import RecentMatches from '@/components/RecentMatches';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, List, LayoutGrid } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Fantasy Leaderboard</h2>
            <p className="text-gray-600 mt-1">IPL 2025 Championship - Week 6</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Select defaultValue="all">
              <SelectTrigger className="bg-white border border-gray-300 w-[140px] h-10">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="mi">Mumbai Indians</SelectItem>
                <SelectItem value="csk">Chennai Super Kings</SelectItem>
                <SelectItem value="rcb">Royal Challengers</SelectItem>
                <SelectItem value="dc">Delhi Capitals</SelectItem>
                <SelectItem value="rr">Rajasthan Royals</SelectItem>
                <SelectItem value="pk">Punjab Kings</SelectItem>
                <SelectItem value="kkr">Kolkata Knight Riders</SelectItem>
                <SelectItem value="srh">Sunrisers Hyderabad</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="h-10">
              <Filter className="h-4 w-4 mr-2" />
              <span>Filter</span>
            </Button>
            
            <div className="bg-white border border-gray-300 rounded-md flex h-10">
              <Button 
                className={`px-3 rounded-l-md ${viewMode === 'list' ? 'bg-primary text-white' : ''}`}
                variant={viewMode === 'list' ? "default" : "ghost"}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                className={`px-3 rounded-r-md ${viewMode === 'grid' ? 'bg-primary text-white' : ''}`}
                variant={viewMode === 'grid' ? "default" : "ghost"}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <StatsOverview />
        <LeaderboardTable />
        <TopPerformers />
        <RecentMatches />
      </main>
      
      <Footer />
    </div>
  );
}
