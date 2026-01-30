import multer from 'multer'

const storage = multer.memoryStorage()

export const uploadPhotos = multer({ storage }).array('photos', 3)
