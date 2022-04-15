# nsfwjs-server
Detect NSFW content server-side
This project is an api server which can identify unseemly images.
## Acceptable image formate:
- `jpeg`
- `png`
- `webp`
- `avif`
- `tiff`
- `svg`

## Installation
nsfwjs-server requires [Node.js](https://nodejs.org/) v12+ to run.
Install the dependencies and start the server.

```sh
cd nsfwjs-server
npm i
npm run start
```

## Usage
```sh
#use POST as input
curl --location --request POST '<your-server-ip>:3300/' --form '=@"/path/to/example.jpg"'

#use image url as input
curl --location --request GET '<your-server-ip>:3300/?url=<image-url>'
```

## Tech
nsfwjs-server uses a number of open source projects to work properly:

- [nsfwjs] - NSFW detection on the client-side via TensorFlow.js
- [sharp] - High performance Node.js image processing
- [node-fetch] - A light-weight module that brings the Fetch API to Node.js 
- [jpeg-js] - A pure javascript JPEG encoder and decoder for node.js
- [tfjs-node] - A WebGL accelerated JavaScript library for training and deploying ML models. 
- [node.js] - Evented I/O for the backend
- [Express] - Fast node.js network app framework

## License
MIT

[nsfwjs]: https://github.com/infinitered/nsfwjs
[sharp]: https://github.com/lovell/sharp
[node-fetch]: https://github.com/node-fetch/node-fetch
[jpeg-js]: https://github.com/jpeg-js/jpeg-js
[tfjs-node]: https://github.com/tensorflow/tfjs
[express]: <http://expressjs.com>
[node.js]: <http://nodejs.org>
