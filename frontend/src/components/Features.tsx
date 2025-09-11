export function Features() {
  const features = [
    {
      title: "Second-by-Second Streaming",
      description: "Salaries stream continuously, providing real-time access to earned wages with no waiting periods.",
      icon: "⏱️"
    },
    {
      title: "Automatic Tax Withholding",
      description: "Built-in tax calculation and withholding ensures compliance with local tax regulations.",
      icon: "📊"
    },
    {
      title: "DeFi Yield Generation",
      description: "Unstreamed funds automatically generate yield through integrated DeFi protocols.",
      icon: "💰"
    },
    {
      title: "DAO Integration",
      description: "Seamless integration with DAOs for governance token distribution and voting rights.",
      icon: "🗳️"
    },
    {
      title: "Multi-Token Support",
      description: "Support for various ERC-20 tokens including stablecoins and governance tokens.",
      icon: "🪙"
    },
    {
      title: "Transparent & Auditable",
      description: "All transactions are recorded on-chain, providing complete transparency and auditability.",
      icon: "🔍"
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for modern, compliant, and efficient payroll management in Web3
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
