const express = require('express')
const multer = require('multer')
const jpeg = require('jpeg-js')
const sharp = require('sharp')

const tf = require('@tensorflow/tfjs-node')
tf.enableProdMode()
const nsfw = require('nsfwjs')
const fetch = (...args) =>
    import('node-fetch').then(({
        default: fetch
    }) => fetch(...args));

const app = express()
app.set('x-powered-by', false)
const upload = multer({
    limits: {
        fileSize: 26214400
    },
    fileFilter(req, file, cb) {
        if (
            file.mimetype !== 'image/png' &&
            file.mimetype !== 'image/jpg' &&
            file.mimetype !== 'image/jpeg' &&
            file.mimetype !== 'image/webp' &&
            file.mimetype !== 'image/avif' &&
            file.mimetype !== 'image/tiff' &&
            file.mimetype !== 'svg+xml'
        ) {
            req.fileValidationError = 'Not acceptable file formate'
            cb(null, false);
        } else {
            cb(null, true);
        }
    }
}).single('')

let _model

const convert = async (img) => {
    // Decoded image in UInt8 Byte array
    const image = await jpeg.decode(img, true)

    const numChannels = 3
    const numPixels = image.width * image.height
    const values = new Int32Array(numPixels * numChannels)

    for (let i = 0; i < numPixels; i++)
        for (let c = 0; c < numChannels; ++c)
            values[i * numChannels + c] = image.data[i * 4 + c]

    return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
}

app.get('/', async (req, res) => {
    const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    const url = req.query.url;

    if (url != undefined || url != null)
        var regex = new RegExp(expression);
    else
        res.status(400).json({
            error: 'Usage: ?url=<your url>'
        })
    if (url.match(regex)) {
        try {
            const response = await fetch('https://' + url)
            const buffer = Buffer.from(await response.arrayBuffer())
            const data = await sharp(buffer)
                .jpeg({
                    mozjpeg: true
                })
                .toBuffer()
            const image = await convert(data)
            const predictions = await _model.classify(image)
            image.dispose()
            res.json(predictions)
        } catch (error) {
            if (error.name === 'FetchError')
                res.status(400).json({
                    error: 'Cannot fetch image from URL'
                })
            else if (error.name === 'AbortError')
                res.status(400).json({
                    error: 'Fetch is aborted'
                })
            else
                res.status(500).json({
                    error: error.toString()
                })
        }
    } else {
        res.status(400).json({
            error: 'Request is not a valid URLs'
        })
    }
})

app.post('/', (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            res.status(400).json({
                error: 'Bad Request'
            })
            next(err)
        }
        next()
    })
}, async (req, res) => {
    if (req.fileValidationError)
        res.status(415).json({
            error: 'Not acceptable format'
        })
    else if (!req.file)
        res.status(400).json({
            error: 'Missing image multipart/form-data'
        })
    else {
        try {
            const data = await sharp(req.file.buffer)
                .jpeg({
                    mozjpeg: true
                })
                .toBuffer()
            const image = await convert(data)
            const predictions = await _model.classify(image)
            image.dispose()
            res.json(predictions)
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }
})

const load_model = async () => {
    _model = await nsfw.load()
}

// Keep the model in memory, make sure it's loaded only once
load_model().then(() => app.listen(3300))