export const MOCK_TOPICS = [
  { id: 1, name: 'Machine Learning Algorithms', weight: 88, frequency: 12, course: 'CS201' },
  { id: 2, name: 'Data Structures (Trees)', weight: 75, frequency: 8, course: 'CS201' },
  { id: 3, name: 'Database Normalization', weight: 62, frequency: 5, course: 'CS201' },
];

export const MOCK_PREDICTIONS = [
  { id: 1, topic: 'Machine Learning Algorithms', course: 'CS201', probability: 92, trend: 'up' },
  { id: 2, topic: 'Data Structures (Trees)', course: 'CS201', probability: 85, trend: 'up' },
  { id: 3, topic: 'Thermodynamics', course: 'PHY101', probability: 78, trend: 'down' },
  { id: 4, topic: 'Database Normalization', course: 'CS201', probability: 62, trend: 'flat' },
  { id: 5, topic: 'Quantum Mechanics Basics', course: 'PHY101', probability: 45, trend: 'up' },
];

export const MOCK_RESOURCES = [
  {
    id: 1,
    title: 'CS201 Comprehensive Final Review',
    author: 'Alex Chen',
    rating: 4.9,
    reviews: 128,
    price: 15,
    aiScore: 96,
    tags: ['CS201', 'Algorithms', 'Notes'],
    verified: true
  },
  {
    id: 2,
    title: 'Thermodynamics Cheat Sheet (PHY101)',
    author: 'Sarah Johnson',
    rating: 4.7,
    reviews: 84,
    price: 5,
    aiScore: 88,
    tags: ['PHY101', 'Formulas'],
    verified: true
  },
  {
    id: 3,
    title: 'Calculus III Past Questions Solved',
    author: 'David Kim',
    rating: 4.8,
    reviews: 215,
    price: 20,
    aiScore: 99,
    tags: ['MTH301', 'Past Questions'],
    verified: true
  }
];
