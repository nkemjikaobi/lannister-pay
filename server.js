const express = require('express');

const app = express();

//Init Middleware for accepting data from body
app.use(express.json({ extended: false }));

//Define Routes
app.use('/', require('./routes/fees'));


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
