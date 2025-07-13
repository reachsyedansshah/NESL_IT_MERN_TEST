let posts = Array.from({ length: 100 }, (_, i) => {
  const authors = ['u2', 'u3', 'u4', 'u5'];
  const topics = [
    'Just finished a great project!',
    'Learning new things every day.',
    'Excited to join this platform.',
    'Collaboration is the key to success.',
    'Working on a new feature.',
    'Had a productive meeting today.',
    'Exploring new technologies.',
    'Sharing some thoughts on teamwork.',
    'Designing a new UI component.',
    'Debugging is fun!',
    'Reading about AI advancements.',
    'Refactoring old code.',
    'Writing unit tests.',
    'Deploying to production!',
    'Pair programming session was awesome.',
    'Attending a tech conference.',
    'Trying out a new JavaScript library.',
    'Optimizing performance.',
    'Fixing bugs all day.',
    'Documenting the API.',
  ];
  const author = authors[i % authors.length];
  const topic = topics[i % topics.length];
  return {
    id: `p${i + 1}`,
    author,
    content: `${topic} [Post #${i + 1}]`,
    created: new Date(Date.now() - (100 - i) * 86400000), // spread over 100 days
    isDeleted: false,
    updatedAt: new Date(Date.now() - (100 - i) * 86400000)
  };
});

module.exports = posts;