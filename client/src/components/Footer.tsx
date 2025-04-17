import { Trophy, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <Trophy className="mr-2 text-secondary-100" />
              IPL Fantasy 2025
            </h4>
            <p className="text-secondary-100 text-sm">The ultimate fantasy cricket experience for the IPL 2025 season. Compete with friends and cricket fans around the world.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-secondary-100">
              <li><Link href="/" className="hover:text-white">Leaderboard</Link></li>
              <li><Link href="/players" className="hover:text-white">Player Stats</Link></li>
              <li><Link href="/matches" className="hover:text-white">Match Schedule</Link></li>
              <li><Link href="/rules" className="hover:text-white">Fantasy Rules</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Help & Support</h4>
            <ul className="space-y-2 text-sm text-secondary-100">
              <li><Link href="/how-to-play" className="hover:text-white">How to Play</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-secondary-100 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-100 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-100 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-100 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-secondary-100">Subscribe to our newsletter</p>
            <div className="mt-2 flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-primary-700/60 rounded-l px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-secondary-100 border-0"
              />
              <Button className="bg-white text-primary-600 hover:bg-secondary-100 rounded-r font-medium">Subscribe</Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-700/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-secondary-100">© 2025 IPL Fantasy. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-secondary-100 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-secondary-100 hover:text-white">Terms of Service</Link>
            <Link href="/cookies" className="text-sm text-secondary-100 hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
