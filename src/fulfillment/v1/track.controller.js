import TrackService from './track.service.js';
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';

const trackService = new TrackService();

class TrackController {

    /**
    * track order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    track(req, res, next) {
        const { body: trackRequest } = req;

        if(trackRequest.context.bpp_id) {
            trackService.track(trackRequest).then(response => {
                res.json({ ...response });
            }).catch((err) => {
                next(err);
            });
        } else {
            throw new BadRequestParameterError("BPP Id is mandatory");
        }
    }

    /**
    * track multiple orders
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    trackMultipleOrder(req, res, next) {
        const { body: trackRequests } = req;

        if (trackRequests && trackRequests.length) {
            trackService.trackMultipleOrder(trackRequests).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();
    }

    /**
    * on track order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onTrack(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        
        if(messageId && messageId.length)
            trackService.onTrack(messageId).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });
        else
            throw new BadRequestParameterError("message Id is mandatory");
    }

    /**
    * on track multiple order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onTrackMultipleOrder(req, res, next) {
        const { query } = req;
        const { messageIds } = query;
        
        if(messageIds && messageIds.length && messageIds.trim().length) { 
            const messageIdArray = messageIds.split(",");
            
            trackService.onTrackMultipleOrder(messageIdArray).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });
            
        }
        else
            throw new BadRequestParameterError();
    }
}

export default TrackController;
