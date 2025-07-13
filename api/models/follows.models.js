const follows = [
  {
    id: 'f1',
    follower: 'u1',
    following: 'u2',
    created: new Date('2024-02-15T10:00Z'),
    isDeleted: false
  },
  {
    id: 'f2',
    follower: 'u1',
    following: 'u3',
    created: new Date('2024-03-05T14:30Z'),
    isDeleted: false
  },
  {
    id: 'f3',
    follower: 'u2',
    following: 'u1',
    created: new Date('2024-02-20T16:45Z'),
    isDeleted: false
  },
  {
    id: 'f4',
    follower: 'u3',
    following: 'u1',
    created: new Date('2024-03-10T09:15Z'),
    isDeleted: false
  },
  {
    id: 'f5',
    follower: 'u4',
    following: 'u1',
    created: new Date('2024-03-12T11:20Z'),
    isDeleted: false
  },
  {
    id: 'f6',
    follower: 'u5',
    following: 'u2',
    created: new Date('2024-03-14T13:45Z'),
    isDeleted: false
  }
];

module.exports = follows;
