import  UploadService  from './upload.service.js';

const uploadService = new UploadService();

class UploadController {
    async upload(req, res, next) {
        try {

            console.log("req.params.type------>",req.params.orderId)
            const result = await uploadService.upload(
                `${req.params.orderId}`,
                req.body.fileType
            );
            res.json(result);
        } catch (e) {
            next(e);
        }
    }
}

export default UploadController;
