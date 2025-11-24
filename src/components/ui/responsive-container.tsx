'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4k' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  center?: boolean
  fluid?: boolean
}

const maxWidthClasses = {
  sm: 'container-fluid-sm',
  md: 'container-fluid-md', 
  lg: 'container-fluid-lg',
  xl: 'container-fluid-xl',
  '2xl': 'container-fluid-2xl',
  '3xl': 'container-fluid-3xl',
  '4k': 'container-fluid-4k',
  full: 'w-full'
}

const paddingClasses = {
  none: '',
  sm: 'px-fluid-2',
  md: 'px-fluid-4',
  lg: 'px-fluid-6',
  xl: 'px-fluid-8'
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  center = true,
  fluid = false
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        // Base container class
        fluid ? 'w-full' : 'container-fluid',
        // Max width
        maxWidthClasses[maxWidth],
        // Padding
        paddingClasses[padding],
        // Centering
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
  auto: 'grid-responsive'
}

const gapClasses = {
  sm: 'gap-fluid-2',
  md: 'gap-fluid-4', 
  lg: 'gap-fluid-6',
  xl: 'gap-fluid-8'
}

export function ResponsiveGrid({
  children,
  className,
  columns = 'auto',
  gap = 'md',
  responsive = true
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid',
        responsive ? columnClasses[columns] : `grid-cols-${columns}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

export interface ResponsiveFlexProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  wrap?: boolean
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  responsive?: boolean
}

export function ResponsiveFlex({
  children,
  className,
  direction = 'row',
  wrap = false,
  gap = 'md',
  align = 'start',
  justify = 'start',
  responsive = true
}: ResponsiveFlexProps) {
  const directionClasses = {
    row: responsive ? 'flex-col sm:flex-row' : 'flex-row',
    column: 'flex-col',
    'row-reverse': responsive ? 'flex-col-reverse sm:flex-row-reverse' : 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        wrap && 'flex-wrap',
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  )
}

export interface ResponsiveStackProps {
  children: React.ReactNode
  className?: string
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export function ResponsiveStack({
  children,
  className,
  gap = 'md',
  align = 'start'
}: ResponsiveStackProps) {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  return (
    <div
      className={cn(
        'flex flex-col',
        gapClasses[gap],
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  )
}

export interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  align?: 'left' | 'center' | 'right' | 'justify'
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive'
}

const sizeClasses = {
  xs: 'text-fluid-xs',
  sm: 'text-fluid-sm',
  base: 'text-fluid-base',
  lg: 'text-fluid-lg',
  xl: 'text-fluid-xl',
  '2xl': 'text-fluid-2xl',
  '3xl': 'text-fluid-3xl',
  '4xl': 'text-fluid-4xl',
  '5xl': 'text-fluid-5xl'
}

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold'
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify'
}

const colorClasses = {
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  muted: 'text-muted-foreground',
  accent: 'text-accent-foreground',
  destructive: 'text-destructive-foreground'
}

export function ResponsiveText({
  children,
  className,
  size = 'base',
  weight = 'normal',
  align = 'left',
  color = 'primary'
}: ResponsiveTextProps) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        alignClasses[align],
        colorClasses[color],
        className
      )}
    >
      {children}
    </div>
  )
}
