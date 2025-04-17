import { useState } from 'react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trophy, User, Menu } from 'lucide-react';
import MobileNav from './MobileNav';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Implement search functionality here
  };

  return (
    <header className="bg-cricket-gradient text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Trophy className="text-secondary-100 text-2xl" />
              <h1 className="text-xl md:text-2xl font-bold">IPL Fantasy 2025</h1>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-secondary-100 transition-colors">
              Leaderboard
            </Link>
            <Link href="/my-team" className="hover:text-secondary-100 transition-colors">
              My Team
            </Link>
            <Link href="/players" className="hover:text-secondary-100 transition-colors">
              Players
            </Link>
            <Link href="/matches" className="hover:text-secondary-100 transition-colors">
              Matches
            </Link>
            <Link href="/rules" className="hover:text-secondary-100 transition-colors">
              Rules
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block relative">
              <Input 
                type="text" 
                placeholder="Search players..."
                className="bg-primary-700/80 text-white rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-100 placeholder-gray-300 w-48"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Search className="absolute right-3 top-2 h-4 w-4 text-gray-300" />
            </div>
            <div className="rounded-full bg-primary-700/60 p-1.5 cursor-pointer">
              <User className="h-4 w-4" />
            </div>
            <Button 
              variant="ghost" 
              className="md:hidden p-1 text-white hover:bg-primary-700/60"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && <MobileNav onClose={() => setIsMenuOpen(false)} />}
    </header>
  );
}
