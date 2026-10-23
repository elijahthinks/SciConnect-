const crypto = require('crypto');
const User = require('../models/User');

// SciConnect runs without accounts: every visitor acts as this shared user.
const GUEST = {
  username: 'guest',
  email: 'guest@sciconnect.local',
  firstName: 'Guest',
  lastName: 'Researcher',
  name: 'Guest Researcher',
  bio: 'Exploring SciConnect.',
};

let guestId = null;

async function getGuestUser() {
  if (guestId) {
    const user = await User.findByPk(guestId);
    if (user) return user;
  }

  const [user] = await User.findOrCreate({
    where: { email: GUEST.email },
    defaults: {
      ...GUEST,
      // Unusable random password: nobody signs in as the guest.
      password: crypto.randomBytes(32).toString('hex'),
      isEmailVerified: true,
    },
  });
  guestId = user.id;
  return user;
}

module.exports = { getGuestUser };
