import { Trophy, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <Trophy className="mr-2 text-[#f59e0b]" />
              IPL Fantasy 2025
            </h4>
            <p className="text-gray-400 text-sm">The ultimate fantasy cricket experience for the IPL 2025 season. Compete with friends and cricket fans around the world.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/"><a className="hover:text-white">Leaderboard</a></Link></li>
              <li><Link href="/players"><a className="hover:text-white">Player Stats</a></Link></li>
              <li><Link href="/matches"><a className="hover:text-white">Match Schedule</a></Link></li>
              <li><Link href="/rules"><a className="hover:text-white">Fantasy Rules</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Help & Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/how-to-play"><a className="hover:text-white">How to Play</a></Link></li>
              <li><Link href="/faq"><a className="hover:text-white">FAQs</a></Link></li>
              <li><Link href="/contact"><a className="hover:text-white">Contact Us</a></Link></li>
              <li><Link href="/terms"><a className="hover:text-white">Terms of Service</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-gray-400">Subscribe to our newsletter</p>
            <div className="mt-2 flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-700 rounded-l px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary border-0"
              />
              <Button className="bg-primary text-white rounded-r">Subscribe</Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© 2025 IPL Fantasy. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy"><a className="text-sm text-gray-400 hover:text-white">Privacy Policy</a></Link>
            <Link href="/terms"><a className="text-sm text-gray-400 hover:text-white">Terms of Service</a></Link>
            <Link href="/cookies"><a className="text-sm text-gray-400 hover:text-white">Cookie Policy</a></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
