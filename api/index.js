const express = require('express')
const cors = require('cors')
const compression = require('compression')
const filter = (req, res) => {
    if(req.headers['x-no-compression']) {
        return false
    }
    return compression.filter(req, res)
}

// const imagemin = require('imagemin')
// const imageminMozjpeg  = require('imagemin-mozjpeg')
// const Compressor = require('compressorjs');
const sharp = require('sharp')
const app = express()

app.use(compression({ filter }))
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ limit: '1mb' }))

app.post('/comprimir', async function(req, res) {
    const { imageBase64, blob } = req.body
    const imgBuffer = Buffer.from(imageBase64.split(';base64,').pop(), 'base64');
    // console.log(req.body)
    const img = await sharp(imgBuffer)
        .jpeg({ quality: 50 })
        .toBuffer()
    // console.log(img.toString('base64'))

    res.json(`data:image/jpeg;base64,${img.toString('base64')}`)
});

app.get('/ip', (req, res) => {
    res.status(200).json(req.socket.remoteAddress)
})

app.get('/teste', async (req, res) => {
    const mkcert = require('mkcert'); 
    // create a certificate authority
    const ca = await mkcert.createCA({
        organization: 'Hello CA',
        countryCode: 'NP',
        state: 'Bagmati',
        locality: 'Kathmandu',
        validityDays: 365
    });
    
    // then create a tls certificate
    const cert = await mkcert.createCert({
        domains: ['127.0.0.1', 'localhost', '192.168.0.103'],
        validityDays: 365,
        caKey: ca.key,
        caCert: ca.cert
    });
    console.log(cert.key)
    console.log(cert.cert)
    res.json({
        key: cert.key,
        cert: cert.cert
    })
})

app.listen(443, () => {
    console.log('servidor online')
})

