import React from 'react';

type Props = { size?: number; className?: string };

const DevFlowHubLogo = ({ size = 32, className = "" }: Props) => {
  const pixel = Math.max(24, size);
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative" style={{ width: pixel, height: pixel }}>
        <img
          src="/devflowhub-original-logo.png"
          alt="DevFlowHub logo"
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">DevFlowHub</span>
    </div>
  );
};

export default DevFlowHubLogo;