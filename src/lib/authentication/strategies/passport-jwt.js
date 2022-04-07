import passportJWT from 'passport-jwt';
import {UnauthenticatedError} from '../../errors/index.js';
import MESSAGES from '../../../utils/messages.js';
import {HEADERS} from "../../../utils/constants.js";

import HttpRequest from '../../../utils/HttpRequest.js';

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const tokenExtractor = function (req) {

    let token = null;
    let tokenArray = []

    if (req) {
        token = req.get(HEADERS.ACCESS_TOKEN);

        tokenArray = token.split(" ");
    }
    
    return tokenArray[1];
};

const opts = {
    jwtFromRequest: tokenExtractor, 
    secretOrKey: "wftd3hg5$g67h*fd5h6fbvcy6rtg5wftd3hg5$g67h*fd5xxx",
    passReqToCallback: true
};

const passportJwtStrategy = new JwtStrategy(opts, async (req, jwtPayload, done) => {
    try {

        let user = {}

        
        // fetch user data from auth service
        let accessToken = req.get(HEADERS.ACCESS_TOKEN);

        
        let headers = {}
        headers[HEADERS.ACCESS_TOKEN] = accessToken

        let httpRequest = new HttpRequest(
            process.env.MODULE_END_POINT_AUTH,
            `/api/users/${jwtPayload.userId}/authUser`,
            "GET",
            {},
            headers
        );

        let result = await httpRequest.send();
        user = result.data.data;

        if (!user) {
            return done(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID), null);
        } else if (user.enabled === false) {
            return done(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED), null);
        } else {
            return done(null, user);
        }
    } catch (err) {
        return done(err, null);
    }
});

export default passportJwtStrategy;
