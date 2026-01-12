
import React from 'react';
import { 
  Github, Twitter, Linkedin, Instagram, Globe, Mail, 
  Cpu, Layers, Maximize, ExternalLink, Box, Link, User, LayoutGrid, Layout, AlignLeft
} from 'lucide-react';

export const getIcon = (name: string, size = 20) => {
  const map: any = { 
    github: Github, 
    twitter: Twitter, 
    linkedin: Linkedin, 
    instagram: Instagram, 
    globe: Globe, 
    mail: Mail, 
    cpu: Cpu, 
    layers: Layers, 
    maximize: Maximize, 
    box: Box,
    link: Link,
    user: User,
    'layout-grid': LayoutGrid,
    layout: Layout,
    'align-left': AlignLeft
  };
  const Icon = map[name.toLowerCase()] || ExternalLink;
  return <Icon size={size} />;
};
