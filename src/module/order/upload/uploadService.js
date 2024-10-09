import getSignedUrlForUpload from '../../../utils/s3Utils.js';
class UploadService {
    async upload(path, fileType) {
            return await getSignedUrlForUpload({ path, fileType });
    }
}
export default UploadService;
