const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const config = require('../config')[process.env.NODE_ENV || 'development'];

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  passport.use(new GoogleStrategy({
    clientID: config.oauth.google.clientId,
    clientSecret: config.oauth.google.clientSecret,
    callbackURL: config.oauth.google.callbackURL,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({
        where: { googleId: profile.id }
      });

      if (user) {
        // User exists, update last active and return
        await user.update({ lastActive: new Date() });
        return done(null, user);
      }

      // Check if user exists with the same email
      user = await User.findOne({
        where: { email: profile.emails[0].value }
      });

      if (user) {
        // Link Google account to existing user
        await user.update({
          googleId: profile.id,
          provider: 'google',
          isEmailVerified: true,
          lastActive: new Date()
        });
        return done(null, user);
      }

      // Create new user
      const nameParts = profile.displayName.split(' ');
      user = await User.create({
        googleId: profile.id,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || 'Google',
        username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value,
        provider: 'google',
        isEmailVerified: true,
        isActive: true,
        lastActive: new Date()
      });

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
}

// Facebook OAuth Strategy
if (config.oauth.facebook.appId && config.oauth.facebook.appSecret) {
  passport.use(new FacebookStrategy({
    clientID: config.oauth.facebook.appId,
    clientSecret: config.oauth.facebook.appSecret,
    callbackURL: config.oauth.facebook.callbackURL,
    profileFields: ['id', 'displayName', 'email', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Facebook ID
      let user = await User.findOne({
        where: { facebookId: profile.id }
      });

      if (user) {
        // User exists, update last active and return
        await user.update({ lastActive: new Date() });
        return done(null, user);
      }

      // Check if user exists with the same email
      if (profile.emails && profile.emails[0]) {
        user = await User.findOne({
          where: { email: profile.emails[0].value }
        });

        if (user) {
          // Link Facebook account to existing user
          await user.update({
            facebookId: profile.id,
            provider: 'facebook',
            isEmailVerified: true,
            lastActive: new Date()
          });
          return done(null, user);
        }
      }

      // Create new user
      const nameParts = profile.displayName.split(' ');
      user = await User.create({
        facebookId: profile.id,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || 'Facebook',
        username: (profile.emails?.[0]?.value || `facebook_${profile.id}`).split('@')[0] + '_' + Date.now(),
        email: profile.emails?.[0]?.value || `facebook_${profile.id}@sciconnect.local`,
        avatar: profile.photos?.[0]?.value,
        provider: 'facebook',
        isEmailVerified: profile.emails?.[0]?.value ? true : false,
        isActive: true,
        lastActive: new Date()
      });

      return done(null, user);
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      return done(error, null);
    }
  }));
}

module.exports = passport; 