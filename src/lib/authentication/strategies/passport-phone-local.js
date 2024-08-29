import passportLocal from 'passport-local';

const LocalStrategy = passportLocal.Strategy;

const passportPhoneLocalStrategy = new LocalStrategy(async (phone, password, done) => {
    try {

        return done(null, null);
    } catch (err) {
        console.error('Error', err);
        return done(err, false);
    }
});

export default passportPhoneLocalStrategy;
