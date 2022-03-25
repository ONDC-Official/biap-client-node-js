import passportLocal from 'passport-local';

const LocalStrategy = passportLocal.Strategy;

const passportUsernameLocalStrategy = new LocalStrategy(async (username, password, done) => {
    try {

        return done(null, null);
    } catch (err) {
        return done(null, false);
    }
});

export default passportUsernameLocalStrategy;
