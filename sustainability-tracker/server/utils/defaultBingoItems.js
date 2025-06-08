// Default Project Management + Sustainability Bingo Items
export const getProjectManagementSustainabilityBingoItems = () => {
  return [
    // Row 1: Planning & Documentation (Sustainable)
    { text: 'Create digital project charter (no printing)', position: 0, category: 'DIGITAL', points: 10 },
    { text: 'Schedule virtual standup meetings', position: 1, category: 'DIGITAL', points: 10 },
    { text: 'Use collaborative online tools instead of paper', position: 2, category: 'DIGITAL', points: 10 },
    { text: 'Set up paperless project documentation', position: 3, category: 'DIGITAL', points: 15 },

    // Row 2: Team Management (Green Practices)
    { text: 'Organize remote team building activity', position: 4, category: 'COMMUNITY', points: 15 },
    { text: 'Implement digital-only meeting notes', position: 5, category: 'DIGITAL', points: 10 },
    { text: 'Create reusable project templates', position: 6, category: 'WASTE', points: 20 },
    { text: 'Use energy-efficient devices for work', position: 7, category: 'ENERGY', points: 15 },

    // Row 3: Process Optimization (Efficiency)
    { text: 'Automate repetitive tasks to save resources', position: 8, category: 'ENERGY', points: 25 },
    { text: 'Conduct virtual code/design reviews', position: 9, category: 'DIGITAL', points: 15 },
    { text: 'Optimize workflows to reduce waste', position: 10, category: 'WASTE', points: 20 },
    { text: 'Use cloud storage instead of physical servers', position: 11, category: 'ENERGY', points: 20 },

    // Row 4: Delivery & Sustainability
    { text: 'Deploy using green hosting providers', position: 12, category: 'ENERGY', points: 25 },
    { text: 'Implement sustainable coding practices', position: 13, category: 'GENERAL', points: 30 },
    { text: 'Measure and reduce digital carbon footprint', position: 14, category: 'GENERAL', points: 30 },
    { text: 'Complete project with zero paper usage', position: 15, category: 'WASTE', points: 35 },
  ];
};

// Alternative set for variety
export const getAlternativeProjectBingoItems = () => {
  return [
    // Focus on different aspects of sustainable project management
    { text: 'Use renewable energy for development setup', position: 0, category: 'ENERGY', points: 20 },
    { text: 'Implement green CI/CD pipelines', position: 1, category: 'ENERGY', points: 25 },
    { text: 'Choose sustainable third-party services', position: 2, category: 'GENERAL', points: 20 },
    { text: 'Optimize database queries for efficiency', position: 3, category: 'ENERGY', points: 15 },

    { text: 'Conduct virtual client presentations', position: 4, category: 'DIGITAL', points: 10 },
    { text: 'Use digital signatures for contracts', position: 5, category: 'DIGITAL', points: 10 },
    { text: 'Implement paperless invoicing system', position: 6, category: 'DIGITAL', points: 15 },
    { text: 'Create digital project portfolio', position: 7, category: 'DIGITAL', points: 15 },

    { text: 'Optimize code for lower energy consumption', position: 8, category: 'ENERGY', points: 25 },
    { text: 'Use efficient algorithms and data structures', position: 9, category: 'ENERGY', points: 20 },
    { text: 'Implement lazy loading and caching', position: 10, category: 'ENERGY', points: 20 },
    { text: 'Minimize API calls and network requests', position: 11, category: 'ENERGY', points: 15 },

    { text: 'Choose eco-friendly project management tools', position: 12, category: 'GENERAL', points: 15 },
    { text: 'Track and report sustainability metrics', position: 13, category: 'GENERAL', points: 25 },
    { text: 'Educate team on sustainable practices', position: 14, category: 'COMMUNITY', points: 20 },
    { text: 'Achieve carbon-neutral project delivery', position: 15, category: 'GENERAL', points: 40 },
  ];
};