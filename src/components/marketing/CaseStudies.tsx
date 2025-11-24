'use client'

import { Star, Quote, ArrowRight } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Developer',
    company: 'TechCorp',
    avatar: 'SC',
    content: 'DevFlowHub transformed our development workflow. We ship features 3x faster with AI assistance that actually understands our codebase.',
    rating: 5,
    metric: '3x faster development'
  },
  {
    name: 'Marcus Johnson',
    role: 'CTO',
    company: 'StartupXYZ',
    avatar: 'MJ',
    content: 'The unified AI workspaces eliminated our tool switching nightmare. Context flows seamlessly between all our development tools.',
    rating: 5,
    metric: '50% less context switching'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Lead Engineer',
    company: 'InnovateLab',
    avatar: 'ER',
    content: 'Finally, an AI platform that understands our entire project context. The memory system is a game changer for complex applications.',
    rating: 5,
    metric: '90% better AI accuracy'
  }
]

const companies = [
  { name: 'Google', logo: 'G' },
  { name: 'Microsoft', logo: 'M' },
  { name: 'Amazon', logo: 'A' },
  { name: 'Netflix', logo: 'N' },
  { name: 'Spotify', logo: 'S' },
  { name: 'OpenAI', logo: 'O' }
]

export default function CaseStudies() {
  return (
    <section className="py-24 relative">
      <div className="max-w-10xl mx-auto px-6 md:px-10 2xl:px-16">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,3vw,4rem)] font-bold text-white mb-6 text-balance">
            Trusted by Developers Worldwide
          </h2>
          <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-slate-300 max-w-4xl mx-auto text-balance">
            Join thousands of developers who've accelerated their workflow with DevFlowHub's AI Development OS.
          </p>
        </div>

        {/* Hero Testimonial */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="glass-panel p-12 text-center">
            <Quote className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
            <blockquote className="text-2xl font-medium text-white mb-8 leading-relaxed">
              "DevFlowHub is the first AI development platform that actually gets it. The unified workspaces and project memory have revolutionized how we build software."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                SC
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Sarah Chen</div>
                <div className="text-slate-400">Senior Developer at TechCorp</div>
              </div>
            </div>
            <div className="flex items-center justify-center mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-panel p-8 hover:border-white/30 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-slate-400 text-sm">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-slate-300 leading-relaxed mb-4">
                {testimonial.content}
              </blockquote>

              <div className="text-cyan-400 font-semibold text-sm">
                {testimonial.metric}
              </div>
            </div>
          ))}
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-slate-400 mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center space-x-3 hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {company.logo}
                </div>
                <span className="text-xl font-bold text-white">{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-300 hover:scale-105 mx-auto">
            <span>Start Your Success Story</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
