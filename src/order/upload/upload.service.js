import getSignedUrlForUpload from '../../utils/s3Utils.js';
class UploadService {
    async upload(path, fileType) {
        console.log("path---->",path);
        console.log("path--filetype-->",fileType);

            return await getSignedUrlForUpload({ path, fileType });
    }
}
export default UploadService;
