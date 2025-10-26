import appConfig from '../../config/app.config';

const configuration = appConfig();

export const fileDestination = (req, file, cb) => {
  cb(null, `${configuration.files.path}${configuration.files.uploadFolder}`);
};
