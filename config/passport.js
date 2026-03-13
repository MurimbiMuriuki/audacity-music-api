const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const authServices = require("../api/v1/services/auth.services");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || "/api/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const provider = "google";
          const providerId = profile.id;
          const email =
            profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const photo =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null;

          if (!email) {
            return done(null, false, { message: "Google account has no email" });
          }

          let user = await authServices.getUserByProviderId(
            provider,
            providerId
          );
          if (!user) {
            user = await authServices.getUserByEmail(email);
          }

          if (user) {
            const updatePayload = {};
            if (!user.provider) updatePayload.provider = provider;
            if (!user.provider_id) updatePayload.provider_id = providerId;
            if (photo && !user.profileImage) updatePayload.profileImage = photo;

            if (Object.keys(updatePayload).length > 0) {
              await authServices.updateUser(updatePayload, user.id);
            }

            return done(null, {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            });
          }

          const displayName =
            profile.displayName || (email ? email.split("@")[0] : "User");
          const randomPassword = bcrypt.hashSync(
            `${providerId}-${Date.now()}-${Math.random()}`,
            8
          );

          const newUser = await authServices.register({
            name: displayName,
            email,
            phone: "",
            password: randomPassword,
            provider,
            provider_id: providerId,
            role: "user",
            status: 1,
            profileImage: photo,
          });

          return done(null, {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = passport;
