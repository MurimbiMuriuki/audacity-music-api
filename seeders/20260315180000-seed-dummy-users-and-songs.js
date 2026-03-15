'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const now = new Date();
    const audioUrl = '/uploads/audios/1773581732704-798826978.mp3';
    const coverUrl = '/uploads/covers/1773583715127-228008878.png';

    const artists = [
      { name: 'John Carter', email: 'john@example.com', artistName: 'DJ Carter', phone: '9876543210' },
      { name: 'Sarah Wilson', email: 'sarah@example.com', artistName: 'Sarah W', phone: '9876543211' },
      { name: 'Mike Ross', email: 'mike@example.com', artistName: 'Mike Beats', phone: '9876543212' },
      { name: 'Emily Chen', email: 'emily@example.com', artistName: 'Em.C', phone: '9876543213' },
      { name: 'Alex Turner', email: 'alex@example.com', artistName: null, phone: '9876543214' },
    ];

    await queryInterface.bulkInsert(
      'users',
      artists.map((a) => ({
        name: a.name,
        email: a.email,
        password: hashedPassword,
        phone: a.phone,
        role: 'user',
        artistName: a.artistName,
        profileImage: null,
        isActive: true,
        status: 1,
        createdAt: now,
        updatedAt: now,
      }))
    );

    const [users] = await queryInterface.sequelize.query(
      `SELECT id, name FROM users WHERE email IN (${artists.map((a) => `'${a.email}'`).join(',')})`
    );

    const id = (name) => users.find((u) => u.name === name).id;

    const songs = [
      // DJ Carter (10 songs)
      { userId: id('John Carter'), title: 'Midnight Vibes', duration: 210.5, streamCount: 1500 },
      { userId: id('John Carter'), title: 'Electric Dreams', duration: 185.3, streamCount: 3200 },
      { userId: id('John Carter'), title: 'Neon Lights', duration: 240.0, streamCount: 800 },
      { userId: id('John Carter'), title: 'Bass Drop', duration: 198.2, streamCount: 4100 },
      { userId: id('John Carter'), title: 'After Hours', duration: 225.7, streamCount: 2700 },
      { userId: id('John Carter'), title: 'Club Anthem', duration: 192.0, streamCount: 5600 },
      { userId: id('John Carter'), title: 'Frequency', duration: 214.8, streamCount: 1200 },
      { userId: id('John Carter'), title: 'Pulse', duration: 178.4, streamCount: 3400 },
      { userId: id('John Carter'), title: 'Rave Culture', duration: 260.1, streamCount: 6200 },
      { userId: id('John Carter'), title: 'Deep State', duration: 233.9, streamCount: 890 },

      // Sarah W (10 songs)
      { userId: id('Sarah Wilson'), title: 'Ocean Waves', duration: 195.7, streamCount: 4500 },
      { userId: id('Sarah Wilson'), title: 'Sunset Boulevard', duration: 220.1, streamCount: 2100 },
      { userId: id('Sarah Wilson'), title: 'Golden Hour', duration: 204.3, streamCount: 7800 },
      { userId: id('Sarah Wilson'), title: 'Wildflower', duration: 188.6, streamCount: 3600 },
      { userId: id('Sarah Wilson'), title: 'Starlight', duration: 231.0, streamCount: 5200 },
      { userId: id('Sarah Wilson'), title: 'Dreamer', duration: 172.4, streamCount: 1900 },
      { userId: id('Sarah Wilson'), title: 'Echoes', duration: 248.7, streamCount: 4100 },
      { userId: id('Sarah Wilson'), title: 'Horizon', duration: 199.2, streamCount: 2800 },
      { userId: id('Sarah Wilson'), title: 'Lullaby', duration: 165.8, streamCount: 6500 },
      { userId: id('Sarah Wilson'), title: 'Velvet Sky', duration: 217.5, streamCount: 3300 },

      // Mike Beats (10 songs)
      { userId: id('Mike Ross'), title: 'City Lights', duration: 178.9, streamCount: 950 },
      { userId: id('Mike Ross'), title: 'Rainy Days', duration: 260.4, streamCount: 1800 },
      { userId: id('Mike Ross'), title: 'Morning Coffee', duration: 145.0, streamCount: 5000 },
      { userId: id('Mike Ross'), title: 'Street Flow', duration: 202.6, streamCount: 4200 },
      { userId: id('Mike Ross'), title: 'Concrete Jungle', duration: 189.3, streamCount: 3100 },
      { userId: id('Mike Ross'), title: 'Night Drive', duration: 234.1, streamCount: 7200 },
      { userId: id('Mike Ross'), title: 'Skyline', duration: 210.0, streamCount: 2600 },
      { userId: id('Mike Ross'), title: 'Underground', duration: 196.7, streamCount: 1400 },
      { userId: id('Mike Ross'), title: 'Beat Machine', duration: 174.5, streamCount: 8100 },
      { userId: id('Mike Ross'), title: 'Trap House', duration: 222.8, streamCount: 3700 },

      // Em.C (10 songs)
      { userId: id('Emily Chen'), title: 'Cherry Blossom', duration: 187.2, streamCount: 9200 },
      { userId: id('Emily Chen'), title: 'Paper Crane', duration: 205.9, streamCount: 6700 },
      { userId: id('Emily Chen'), title: 'Silk Road', duration: 241.3, streamCount: 4400 },
      { userId: id('Emily Chen'), title: 'Lantern', duration: 168.0, streamCount: 3800 },
      { userId: id('Emily Chen'), title: 'Jade', duration: 229.4, streamCount: 2200 },
      { userId: id('Emily Chen'), title: 'Moonrise', duration: 194.6, streamCount: 5100 },
      { userId: id('Emily Chen'), title: 'Waterfall', duration: 256.2, streamCount: 1600 },
      { userId: id('Emily Chen'), title: 'Bamboo', duration: 183.7, streamCount: 7400 },
      { userId: id('Emily Chen'), title: 'Firefly', duration: 211.1, streamCount: 2900 },
      { userId: id('Emily Chen'), title: 'Temple Bells', duration: 198.5, streamCount: 4800 },

      // Alex Turner (10 songs)
      { userId: id('Alex Turner'), title: 'Broken Glass', duration: 215.6, streamCount: 3500 },
      { userId: id('Alex Turner'), title: 'Rust & Dust', duration: 192.3, streamCount: 1100 },
      { userId: id('Alex Turner'), title: 'Analog', duration: 244.8, streamCount: 5800 },
      { userId: id('Alex Turner'), title: 'Vinyl Days', duration: 176.1, streamCount: 2400 },
      { userId: id('Alex Turner'), title: 'Garage Band', duration: 201.4, streamCount: 4600 },
      { userId: id('Alex Turner'), title: 'Reverb', duration: 238.0, streamCount: 7100 },
      { userId: id('Alex Turner'), title: 'Fuzz Tone', duration: 169.9, streamCount: 3200 },
      { userId: id('Alex Turner'), title: 'Amplifier', duration: 224.3, streamCount: 1700 },
      { userId: id('Alex Turner'), title: 'Feedback Loop', duration: 253.6, streamCount: 6300 },
      { userId: id('Alex Turner'), title: 'Static', duration: 185.0, streamCount: 900 },
    ];

    await queryInterface.bulkInsert(
      'Songs',
      songs.map((s) => ({
        userId: s.userId,
        title: s.title,
        coverUrl,
        audioUrl,
        duration: s.duration,
        streamCount: s.streamCount,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  async down(queryInterface) {
    const emails = [
      'john@example.com',
      'sarah@example.com',
      'mike@example.com',
      'emily@example.com',
      'alex@example.com',
    ];

    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email IN (${emails.map((e) => `'${e}'`).join(',')})`
    );
    const userIds = users.map((u) => u.id);

    if (userIds.length) {
      await queryInterface.bulkDelete('Songs', { userId: userIds });
    }
    await queryInterface.bulkDelete('users', { email: emails });
  },
};
