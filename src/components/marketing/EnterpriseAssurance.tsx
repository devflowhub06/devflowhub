'use client'

import { BadgeCheck, Lock, ShieldCheck, UserCheck } from 'lucide-react'

const ENTERPRISE_PILLARS = [
  {
    title: 'Security by default',
    description:
      'Tenant isolation, encrypted data at rest and in transit, and zero data retention for AI prompts unless you opt in.',
    items: ['OWASP-reviewed architecture', 'Secrets vaulted with auto-rotation', 'Role-based access in every workspace'],
    icon: ShieldCheck,
  },
  {
    title: 'Enterprise controls',
    description:
      'Integrate with the tools your team already uses — from SSO to audit trails and usage governance.',
    items: [
      'SSO / SAML 2.0 support (Okta, Azure AD, Google Workspace)',
      'Granular workspace permissions & admin dashboards',
      'Audit logs exportable to SIEM tools',
    ],
    icon: UserCheck,
  },
  {
    title: 'Compliance roadmap',
    description:
      'Built with enterprise standards from day one. SOC 2 Type II in progress with independent auditors engaged.',
    items: ['Data residency controls (US & EU regions)', 'Dedicated VPC & on-prem options', 'Signed enterprise DPA'],
    icon: Lock,
  },
]

export default function EnterpriseAssurance() {
  return (
    <section className="relative isolate overflow-hidden bg-surface-900 py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.2),_transparent_60%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-200/80">
              <BadgeCheck className="h-4 w-4 text-blue-300" />
              Enterprise ready
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Trusted by teams that scale. Built for security, control, and compliance.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Everything you need to champion DevFlowHub inside your organisation — from security questionnaires to
              dedicated success engineers. We partner with you from sandbox to production rollout.
            </p>
          </div>
          <div className="mt-2 flex flex-col gap-2 text-sm text-slate-300 sm:mt-0">
            <span className="font-semibold text-white">Need enterprise pricing or a security questionnaire?</span>
            <a
              href="mailto:hello@devflowhub.com"
              className="text-sm font-semibold text-accent-warn transition hover:text-orange-400"
            >
              Contact our enterprise team →
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {ENTERPRISE_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="relative flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/30 p-6 shadow-xl shadow-black/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{pillar.description}</p>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

