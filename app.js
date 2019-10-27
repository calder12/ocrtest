const express = require('express')
const app = express()
const fs = require('fs')
const multer = require('multer')
const jimp = require('jimp')
const { TesseractWorker } = require('tesseract.js')
const worker = new TesseractWorker()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage: storage }).single('avatar')

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/upload', (req, res) => {
  upload(req, res, err => {
  jimp.read(`./uploads/${req.file.originalname}`)
    .then(image =>{
      image
        .greyscale()
        .invert()
        .write(`./uploads/inverted-${req.file.originalname}`), imgCallback(`${req.file.originalname}`)
    })
  })
})

function imgCallback(name) {
  console.log(`./uploads/inverted-${name}`)
  fs.readFile(
    `./uploads/inverted-${name}`,
    (err, data) => {
      if (err) return console.log(err)
      worker
        .recognize(data, 'eng', { tessjs_create_tsv: '1' })
        .progress(progress => {
          console.log(progress)
          // res.redirect('/download')
        })
        .then(result => {
          fs.writeFile(`${__dirname}/temp.txt`, result.text, err => {
            if (err) return console.log(err)
            console.log('done')
          })
        })
        .finally(() => worker.terminate())
    }
  )
}

app.get('/download', (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`
})

const PORT = 4000 || process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
