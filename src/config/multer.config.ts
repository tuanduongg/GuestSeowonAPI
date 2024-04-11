/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

const date = new Date();
const currentDate = `${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}`;
export const multerConfigLocation = {
  dest: process.env.UPLOAD_LOCATION || './public',
};
export const multerConfig = {
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file?.mimetype?.match(/\/(jpg|jpeg|png|PNG|JEPG|JPG|PNG)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // Limit file size to 10MB
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = multerConfigLocation.dest;
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = `${currentDate}_${Math.round(Math.random() * 1e9)}`;
      const originalName = file.originalname.replace(/\s/g, ''); // Remove whitespace in original name if needed
      const fileName = `${uniqueSuffix}_${originalName}`;
      return callback(null, fileName);
    },
  }),
};
