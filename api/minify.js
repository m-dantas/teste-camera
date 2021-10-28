import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';

// const imagemin = require('imagemin')
// const imageminPngquant = require('imagemin-pngquant')



module.exports = {
    buffer: async () => {
        return await imagemin.buffer(imgBuffer, {
            plugins: [imageminPngquant({ quality: 50 })],
        });
    },
    teste: () => {
        console.log('aaaaaaaa')
    }
}  