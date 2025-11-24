'use client'

import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Developer',
    company: 'TechCorp',
    avatar: 'SC',
    content: 'DevFlowHub transformed our development workflow. We ship features 3x faster with AI assistance.',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    role: 'CTO',
    company: 'StartupXYZ',
    avatar: 'MJ',
    content: 'The unified AI workspaces eliminated our tool switching nightmare. Context flows seamlessly.',
    rating: 5
  },
  {
    name: 'Elena Rodriguez',
    role: 'Lead Engineer',
    company: 'InnovateLab',
    avatar: 'ER',
    content: 'Finally, an AI platform that understands our entire project context. Game changer.',
    rating: 5
  }
]

export default function Testimonials() {
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

        <div className="grid md:grid-cols-3 gap-8">
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
              
              <blockquote className="text-slate-300 leading-relaxed">
                <Quote className="w-6 h-6 text-cyan-400 mb-2" />
                {testimonial.content}
              </blockquote>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-white">Google</div>
            <div className="text-2xl font-bold text-white">Microsoft</div>
            <div className="text-2xl font-bold text-white">Amazon</div>
            <div className="text-2xl font-bold text-white">Netflix</div>
            <div className="text-2xl font-bold text-white">Spotify</div>
          </div>
        </div>
      </div>
    </section>
  )
}
