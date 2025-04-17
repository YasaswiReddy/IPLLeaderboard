import { Link } from 'wouter';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface MobileNavProps {
  onClose: () => void;
}

export default function MobileNav({ onClose }: MobileNavProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Implement search functionality here
  };

  return (
    <div className="md:hidden bg-white shadow-lg absolute top-16 right-0 w-64 z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Menu</h3>
          <X className="h-5 w-5 cursor-pointer" onClick={onClose} />
        </div>
        
        <div className="relative mb-4">
          <Input 
            type="text" 
            placeholder="Search players..."
            className="bg-gray-100 rounded-full px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={handleSearch}
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
        
        <nav className="flex flex-col space-y-3">
          <Link href="/">
            <a className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>Leaderboard</a>
          </Link>
          <Link href="/my-team">
            <a className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>My Team</a>
          </Link>
          <Link href="/players">
            <a className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>Players</a>
          </Link>
          <Link href="/matches">
            <a className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>Matches</a>
          </Link>
          <Link href="/rules">
            <a className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>Rules</a>
          </Link>
        </nav>
      </div>
    </div>
  );
}
