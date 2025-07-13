const bcrypt = require('bcryptjs');

// Hash passwords for security
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const users = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    password: hashPassword('password'),
    isActive: true,
    joined: new Date('2024-01-15T09:00:00Z'),
  },
  {
    id: 'u2',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'user',
    password: hashPassword('password'),
    isActive: true,
    joined: new Date('2024-02-02T12:30:00Z'),
  },
  {
    id: 'u3',
    name: 'Jim Doe',
    email: 'jim.doe@example.com',
    role: 'user',
    password: hashPassword('password'),
    isActive: true,
    joined: new Date('2024-03-01T15:45:00Z'),
  },
  {
    id: 'u4',
    name: 'Jill Doe',
    email: 'jill.doe@example.com',
    role: 'user',
    password: hashPassword('password'),
    isActive: true,
    joined: new Date('2024-03-10T08:20:00Z'),
  },
  {
    id: 'u5',
    name: 'Jack Doe',
    email: 'jack.doe@example.com',
    role: 'user',
    password: hashPassword('password'),
    isActive: true,
    joined: new Date('2024-03-15T14:10:00Z'),
  },
];

module.exports = users;
