import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'
/** Hầu hết những thứ bên dưới đều có ở docs của multer, chỉ là anh tổ chức lại sao cho khoa học và gọn gàng nhất có thể
* https://www.npmjs.com/package/multer
*/
// Function Kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
  console.log('multer file: ', file)
  // đối với multer kt kiểu file thì sd mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  // Nếu như kiểu file hợp lệ
  return callback(null, true)
}

// Khởi tạo func upload được bọc bởi multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = { upload }