"use client";

import React from 'react';
import * as Icons from 'lucide-react';
import { DEFAULT_CATEGORY_ICON } from '@/lib/constants';

type DynamicIconProps = {
  name: string;
  className?: string;
  size?: number;
};

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, size = 20 }) => {
  const IconComponent = (Icons as any)[name] || (Icons as any)[DEFAULT_CATEGORY_ICON];

  if (!IconComponent) {
    // Fallback if even default is not found (should not happen with lucide-react)
    console.warn(`Icon "${name}" not found, and default icon "${DEFAULT_CATEGORY_ICON}" also not found.`);
    return <Icons.HelpCircle className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default DynamicIcon;
