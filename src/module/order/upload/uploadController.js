import UploadService from './uploadService.js';

const uploadService = new UploadService();

class UploadController {
    /**
     * Handles file upload requests.
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback to handle errors.
     * @returns {Promise<void>} - A promise that resolves when the response is sent.
     */
    async upload(req, res, next) {
        try {
            // Log the order ID being uploaded
            console.log("Upload request for order ID:", req.params.orderId);

            // Call the upload service with the order ID and file type
            const result = await uploadService.upload(
                `${req.params.orderId}`,
                req.body.fileType
            );

            // Send the result back to the client
            res.json(result);
        } catch (e) {
            // Log the error before passing it to the next middleware
            console.error("Error during file upload:", e);
            next(e);
        }
    }
}

export default UploadController;
