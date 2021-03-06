// function requireHTTPS(req, res, next) {
//     // The 'x-forwarded-proto' check is for Heroku
//     if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
//         return res.redirect('https://' + req.get('host') + req.url);
//     }
//     next();
// }

// const express = require('express');
// const app = express();
// app.use(requireHTTPS);
// app.use(express.static('./dist/adam-web'));
// app.get('/*', function (req, res) {
//     res.sendFile(index.html, { root: 'dist/adam-web' }
//     );
// });




const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.static('./dist/adam-web'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', { root: 'dist/adam-web/' })
);


let port = process.env.PORT || 8080
app.listen(port);
console.log('ANGULAR server running on port: ', port);