import { Router } from 'express';
import authentication from '../../middlewares/authentication.js';

import SseController from './sse.controller.js';

const sseController = new SseController();
const rootRouter = new Router();

rootRouter.get('/events', authentication(), sseController.onEvent);

rootRouter.post('/response/on_cancel', sseController.onCancel);
rootRouter.post('/response/on_confirm', sseController.onConfirm);
rootRouter.post('/response/on_init', sseController.onInit);
rootRouter.post('/response/on_search', sseController.onSearch);
rootRouter.post('/response/on_select', sseController.onQuote);
rootRouter.post('/response/on_status', sseController.onStatus);
rootRouter.post('/response/on_support', sseController.onSupport);
rootRouter.post('/response/on_track', sseController.onTrack);
rootRouter.post('/response/on_update', sseController.onUpdate);

export default rootRouter;
