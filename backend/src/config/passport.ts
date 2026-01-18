import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { env } from './env';
import prisma from './database';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              firstName: profile.displayName?.split(' ')[0] || email.split('@')[0],
              lastName: profile.displayName?.split(' ').slice(1).join(' '),
              displayName: profile.displayName || email.split('@')[0],
              avatar: profile.photos?.[0]?.value,
              authProvider: 'GOOGLE',
              providerId: profile.id,
              isVerified: true,
            },
          });
        } else if (user.authProvider !== 'GOOGLE') {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: 'GOOGLE',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value || user.avatar,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in GitHub profile'), undefined);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              firstName: profile.displayName?.split(' ')[0] || profile.username || email.split('@')[0],
              lastName: profile.displayName?.split(' ').slice(1).join(' '),
              displayName: profile.displayName || profile.username || email.split('@')[0],
              avatar: profile.photos?.[0]?.value,
              authProvider: 'GITHUB',
              providerId: profile.id,
              isVerified: true,
            },
          });
        } else if (user.authProvider !== 'GITHUB') {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: 'GITHUB',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value || user.avatar,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
