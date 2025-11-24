'use client'

import { useState } from 'react'
import { ArrowRight, Bot, Boxes, UploadCloud, Sparkles, Workflow } from 'lucide-react'
import Link from 'next/link'

type TourStep = {
  id: number
  title: string
  description: string
  bulletPoints: string[]
  icon: React.ComponentType<{ className?: string }>
  cta?: { label: string; href: string }
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Spin up a workspace in seconds',
    description: 'Start from templates or import an existing repo. DevFlowHub auto-configures tooling and syncs AI context instantly.',
    bulletPoints: [
      'Smart project scaffolds for React, Next.js, Express, Python and more',
      'Live dependency graph & environment setup checklist',
      'Workspace context indexed for AI before you type a prompt',
    ],
    icon: Boxes,
  },
  {
    id: 2,
    title: 'Pair-program with a project-aware AI',
    description: 'Write, refactor, and test with an assistant that understands your entire codebase, design system, and product briefs.',
    bulletPoints: [
      'Inline suggestions with source-of-truth citations',
      'Task board auto-populated by AI from product specs',
      'Preview diff, apply changes, or ask follow-up questions instantly',
    ],
    icon: Bot,
  },
  {
    id: 3,
    title: 'Ship with integrated deploy & QA',
    description: 'Preview, test, and deploy without leaving the workspace. Connect your infrastructure or use built-in DevFlowHub deployer.',
    bulletPoints: [
      'One-click Vercel/Fly deploys or bring-your-own cloud',
      'AI-generated Playwright & Jest suites run in the preview container',
      'Deployment guardrails, change summaries, and release notes generated for you',
    ],
    icon: UploadCloud,
    cta: { label: 'See the deployer', href: '/deployer' },
  },
]

export default function InteractiveProductTour() {
  const [activeId, setActiveId] = useState<number>(TOUR_STEPS[0].id)
  const activeStep = TOUR_STEPS.find((step) => step.id === activeId) ?? TOUR_STEPS[0]
  const ActiveIcon = activeStep.icon

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-bg-900 via-bg-900 to-surface-900 py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-x-0 -top-24 z-0">
        <div className="mx-auto h-48 w-48 rounded-full bg-accent-warn/10 blur-3xl md:h-64 md:w-64" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-16">
        <div className="w-full lg:w-80">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-200/80">
            <Workflow className="h-4 w-4 text-accent-warn" />
            Your end-to-end AI workflow
          </div>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Ship production software from idea to deploy in one surface.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            DevFlowHub compresses the entire lifecycle into a single AI-native workspace. Explore the three critical moments developers rave about.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            {TOUR_STEPS.map((step) => {
              const Icon = step.icon
              const isActive = step.id === activeId
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveId(step.id)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                    isActive
                      ? 'border-accent-warn/60 bg-accent-warn/10 text-white shadow-lg shadow-orange-500/20'
                      : 'border-white/5 bg-white/5 text-slate-300 hover:border-accent-warn/30 hover:bg-accent-warn/5'
                  }`}
                >
                  <span className="text-sm font-semibold">{step.id.toString().padStart(2, '0')}</span>
                  <Icon className="h-5 w-5 text-accent-warn" />
                  <span className="flex-1 text-sm font-semibold">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="w-full flex-1">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/40 p-6 shadow-2xl shadow-black/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" />
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-warn/15 text-accent-warn">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Step {activeStep.id.toString().padStart(2, '0')}
                  </p>
                  <h3 className="text-xl font-semibold text-white sm:text-2xl">{activeStep.title}</h3>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{activeStep.description}</p>

              <ul className="space-y-3 text-sm text-slate-200">
                {activeStep.bulletPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-1.5 w-4 flex-shrink-0 rounded-full bg-accent-warn/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {activeStep.cta ? (
                <Link
                  href={activeStep.cta.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-warn transition hover:text-orange-400"
                >
                  {activeStep.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <Sparkles className="h-4 w-4 text-accent-warn" />
                  <span>AI assistance is contextual, auditable, and secure at every step.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

