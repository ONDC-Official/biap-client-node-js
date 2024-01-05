import { Router } from 'express';
import authentication from '../../middlewares/authentication.js';

import SseController from './sse.controller.js';

const sseController = new SseController();
const rootRouter = new Router();

rootRouter.get('/events/v2', authentication(), sseController.onEvent);

rootRouter.post('/response/v2/on_cancel', sseController.onCancel);
rootRouter.post('/response/v2/on_confirm', sseController.onConfirm);
rootRouter.post('/response/v2/on_init', sseController.onInit);
rootRouter.post('/response/v2/on_search', sseController.onSearch);
rootRouter.post('/response/v2/on_select', sseController.onQuote);
rootRouter.post('/response/v2/on_status', sseController.onStatus);
rootRouter.post('/response/v2/on_support', sseController.onSupport);
rootRouter.post('/response/v2/on_track', sseController.onTrack);
rootRouter.post('/response/v2/on_update', sseController.onUpdate);

export default rootRouter;
