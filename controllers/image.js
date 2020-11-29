const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: '1434605cbc474fa9ac94736e7dc25b4b'
});

const handleImage=(req, res,db) => {
    const { id } = req.body;
    db('users').where('id', '=', id).increment('entries', 1)
        .returning('entries')
        .then(entries => res.json(entries[0]))
        .catch(err => res.status(400).json('cant get entries...'))
}

const handleImageApi=(req, res,db) => {
    //FACE_DETECT_MODEL: '53e1df302c079b3db8a0a36033ed2d15'
    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data=>{
        res.json(data);
    })
    .catch(err=>res.status(400).json('unable to work with API'))
}

module.exports={
    handleImage,
    handleImageApi
}