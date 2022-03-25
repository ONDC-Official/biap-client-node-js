import passport from 'passport';
import { passportJwtStrategy } from '../lib/authentication/index.js';
import { UnauthenticatedError } from '../lib/errors/index.js';
import MESSAGES from '../utils/messages.js';

passport.use(passportJwtStrategy);

const authentication = (options) => (req, res, next) => {
    passport.authenticate('jwt', {
        session: false
    }, (err, user) => {

        console.log(err, user);
        let bearerTokenString = req.get('access-token');

        if (bearerTokenString !== null && typeof bearerTokenString !== 'undefined') 
        {
            let tokenArray = bearerTokenString.split(' ');
            res.setHeader('currentUserAccessToken', tokenArray[1].toString());
        } 
        else 
        {
            const { baseUrl, path, query, headers } = req;
            const fullUrl = `${baseUrl}${path}`;
          // console.log(`[SPIRIT][AUTH_MIDDLEWARE] Bearer token not found in request header for request with URL: `, fullUrl, ` and request headers `, headers, ` query `, query);
        }


        if (user) {
            req.user = user;
            next();
        } else if (err) {
            next(err);
        } else {
            next(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID));
        }
    })(req, res, next);
};

export default authentication;