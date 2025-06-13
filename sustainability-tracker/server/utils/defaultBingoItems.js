// Default Project Management + Sustainability Bingo Items
export const getProjectManagementSustainabilityBingoItems = () => {
  return [
    // Row 1: Planning & Documentation (Sustainable)
    { text: 'Create digital project charter (no printing)', category: 'DIGITAL', points: 10 },
    { text: 'Schedule virtual standup meetings', category: 'DIGITAL', points: 10 },
    { text: 'Use collaborative online tools instead of paper', category: 'DIGITAL', points: 10 },
    { text: 'Set up paperless project documentation', category: 'DIGITAL', points: 15 },

    // Row 2: Team Management (Green Practices)
    { text: 'Organize remote team building activity', category: 'COMMUNITY', points: 15 },
    { text: 'Implement digital-only meeting notes', category: 'DIGITAL', points: 10 },
    { text: 'Create reusable project templates', category: 'WASTE', points: 20 },
    { text: 'Use energy-efficient devices for work', category: 'ENERGY', points: 15 },

    // Row 3: Process Optimization (Efficiency)
    { text: 'Automate repetitive tasks to save resources', category: 'ENERGY', points: 25 },
    { text: 'Conduct virtual code/design reviews', category: 'DIGITAL', points: 15 },
    { text: 'Optimize workflows to reduce waste', category: 'WASTE', points: 20 },
    { text: 'Use cloud storage instead of physical servers', category: 'ENERGY', points: 20 },

    // Row 4: Delivery & Sustainability
    { text: 'Deploy using green hosting providers', category: 'ENERGY', points: 25 },
    { text: 'Implement sustainable coding practices', category: 'GENERAL', points: 30 },
    { text: 'Measure and reduce digital carbon footprint', category: 'GENERAL', points: 30 },
    { text: 'Complete project with zero paper usage', category: 'WASTE', points: 35 },
  ];
};

// Alternative set for variety
export const getAlternativeProjectBingoItems = () => {
  return [
    // Focus on different aspects of sustainable project management
    { text: 'Use renewable energy for development setup', category: 'ENERGY', points: 20 },
    { text: 'Implement green CI/CD pipelines', category: 'ENERGY', points: 25 },
    { text: 'Choose sustainable third-party services', category: 'GENERAL', points: 20 },
    { text: 'Optimize database queries for efficiency', category: 'ENERGY', points: 15 },

    { text: 'Conduct virtual client presentations', category: 'DIGITAL', points: 10 },
    { text: 'Use digital signatures for contracts', category: 'DIGITAL', points: 10 },
    { text: 'Implement paperless invoicing system', category: 'DIGITAL', points: 15 },
    { text: 'Create digital project portfolio', category: 'DIGITAL', points: 15 },

    { text: 'Optimize code for lower energy consumption', category: 'ENERGY', points: 25 },
    { text: 'Use efficient algorithms and data structures', category: 'ENERGY', points: 20 },
    { text: 'Implement lazy loading and caching', category: 'ENERGY', points: 20 },
    { text: 'Minimize API calls and network requests', category: 'ENERGY', points: 15 },

    { text: 'Choose eco-friendly project management tools', category: 'GENERAL', points: 15 },
    { text: 'Track and report sustainability metrics', category: 'GENERAL', points: 25 },
    { text: 'Educate team on sustainable practices', category: 'COMMUNITY', points: 20 },
    { text: 'Achieve carbon-neutral project delivery', category: 'GENERAL', points: 40 },
  ];
};