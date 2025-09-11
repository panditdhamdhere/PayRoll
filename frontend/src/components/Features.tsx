import { motion } from 'framer-motion';

export function Features() {
  const features = [
    { title: 'Second-by-Second Streaming', description: 'Salaries stream continuously, enabling instant access to earned wages.', icon: '⏱️' },
    { title: 'Automatic Tax Withholding', description: 'Built-in tax calculation and withholding for worry-free compliance.', icon: '📊' },
    { title: 'DeFi Yield Generation', description: 'Idle funds generate yield through integrated DeFi strategies.', icon: '💰' },
    { title: 'DAO Integration', description: 'Governance token distribution and voting rights baked in.', icon: '🗳️' },
    { title: 'Multi-Token Support', description: 'Use stablecoins and ERC-20 tokens seamlessly.', icon: '🪙' },
    { title: 'Transparent & Auditable', description: 'On-chain records for complete transparency and audits.', icon: '🔍' },
  ];

  return (
    <section id="features" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Powerful Features</span>
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need for modern, compliant, and efficient payroll in Web3.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="group relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] hover:shadow-[0_28px_80px_-24px_rgba(0,0,0,0.35)] transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-pink-500/15 text-2xl">
                  <span>{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1.5 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
                </div>
              </div>
              <span className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
