import React from 'react';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center space-x-2 hover:scale-105 transition-transform duration-200 cursor-pointer ${className}`} aria-label="DevFlowHub homepage">
      <div className="w-10 h-10 relative group flex-shrink-0">
        <img 
          src="/devflowhub-original-logo.png" 
          alt="DevFlowHub" 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <span className="logo-text text-base sm:text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent select-none" style={{fontFamily:'Inter,Segoe UI,sans-serif'}}>DevFlowHub</span>
    </a>
  );
} 