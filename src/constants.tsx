import { 
  Users, 
  Target, 
  Palette, 
  Globe, 
  Camera, 
  Layout, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Menu,
  X
} from 'lucide-react';

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Contestants', href: '/contestants' },
  { name: 'Courses', href: '/courses' },
  { name: 'Buy Points', href: '/points' },
];

export const SERVICES = [
  {
    id: 'social-media',
    title: 'Social Media Management',
    description: 'Full account management across Facebook, Instagram, and TikTok with strategic content creation.',
    features: ['Content Strategy', 'Audience Engagement', 'Growth Analytics']
  },
  {
    id: 'influencer',
    title: 'Influencer Marketing',
    description: 'Leverage MC JJ\'s massive audience and strategic brand collaborations for real impact.',
    features: ['Campaign Strategy', 'Brand Collaborations', 'Performance Reporting']
  },
  {
    id: 'competition',
    title: 'Competition Platform',
    description: 'A unique platform for musicians, artists, and models to gain visibility and win through fan votes.',
    features: ['Real-time Voting', 'Points System', 'Talent Discovery']
  }
];

export const PORTFOLIO = [
  {
    title: 'Lifestyle Brand Campaign',
    category: 'Influencer Marketing',
    image: 'https://picsum.photos/seed/agency1/800/600'
  },
  {
    title: 'Tech Startup Rebrand',
    category: 'Branding',
    image: 'https://picsum.photos/seed/agency2/800/600'
  },
  {
    title: 'E-commerce Platform',
    category: 'Web Design',
    image: 'https://picsum.photos/seed/agency3/800/600'
  },
  {
    title: 'Social Media Growth',
    category: 'Social Media',
    image: 'https://picsum.photos/seed/agency4/800/600'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Sarah Wanjiku',
    role: 'CEO, Fashion Hub',
    content: 'Ellevate Digital transformed our online presence. Our sales increased by 40% in just three months!',
    image: 'https://picsum.photos/seed/person1/100/100'
  },
  {
    name: 'David Maina',
    role: 'Founder, TechPulse',
    content: 'The influencer campaign led by MC JJ was a game changer. The engagement was beyond our expectations.',
    image: 'https://picsum.photos/seed/person2/100/100'
  }
];
