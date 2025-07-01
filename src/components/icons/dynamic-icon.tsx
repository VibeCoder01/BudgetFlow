"use client";

import React from 'react';
import * as Icons from 'lucide-react';
import { DEFAULT_CATEGORY_ICON } from '@/lib/constants';
import { cn } from '@/lib/utils';

type DynamicIconProps = {
  name: string;
  className?: string;
  size?: number;
};

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, size }) => {
  const IconComponent = (Icons as any)[name] || (Icons as any)[DEFAULT_CATEGORY_ICON];

  if (!IconComponent) {
    // Fallback if even default is not found (should not happen with lucide-react)
    console.warn(`Icon "${name}" not found, and default icon "${DEFAULT_CATEGORY_ICON}" also not found.`);
    return <Icons.HelpCircle className={className} size={size || 20} />;
  }
  
  // If size is provided, it takes precedence. Otherwise, the size is controlled by the className (e.g., h-9 w-9).
  return <IconComponent className={cn(className)} size={size} />;
};

export default DynamicIcon;
