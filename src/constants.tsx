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
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Services', href: '#services' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Contact', href: '#contact' },
];

export const SERVICES = [
  {
    id: 'social-media',
    title: 'Social Media Management',
    description: 'Full account management across Facebook, Instagram, and TikTok with strategic content creation.',
    icon: Users,
    features: ['Content Strategy', 'Audience Engagement', 'Growth Analytics']
  },
  {
    id: 'influencer',
    title: 'Influencer Marketing',
    description: 'Leverage MC JJ\'s massive audience and strategic brand collaborations for real impact.',
    icon: Target,
    features: ['Campaign Strategy', 'Brand Collaborations', 'Performance Reporting']
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Crafting unique brand identities that resonate with your target audience.',
    icon: Palette,
    features: ['Logo Design', 'Brand Strategy', 'Visual Identity']
  },
  {
    id: 'web-design',
    title: 'Web Design',
    description: 'Modern, mobile-friendly websites and e-commerce solutions built for conversion.',
    icon: Globe,
    features: ['UI/UX Design', 'E-commerce', 'Landing Pages']
  },
  {
    id: 'videography',
    title: 'Videography & Photography',
    description: 'High-quality visual content that tells your brand story effectively.',
    icon: Camera,
    features: ['Product Shoots', 'Promotional Videos', 'Event Coverage']
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    description: 'Eye-catching creatives for all your digital and print marketing needs.',
    icon: Layout,
    features: ['Social Media Ads', 'Posters & Flyers', 'Marketing Materials']
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
