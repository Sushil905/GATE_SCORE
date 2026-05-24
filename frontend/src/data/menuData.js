import { BookOpen, Bot, Brain, ClipboardList, Home, LayoutDashboard, LogIn, PieChart, Shield, UserPlus } from 'lucide-react';

export const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'login', label: 'Login', icon: LogIn, guest: true },
  { id: 'register', label: 'Register', icon: UserPlus, guest: true },
  { id: 'student-dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'mock-test', label: 'Mock Test', icon: ClipboardList },
  { id: 'ai-chatbot', label: 'AI Chatbot', icon: Bot },
  { id: 'study-plan', label: 'Study Plan', icon: Brain },
  { id: 'result-analysis', label: 'Result Analysis', icon: PieChart },
  { id: 'profile', label: 'Profile', icon: UserPlus },
  { id: 'admin-dashboard', label: 'Admin Dashboard', icon: Shield, admin: true }
];
