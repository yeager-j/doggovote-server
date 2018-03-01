import jwt from 'express-jwt';
import jwts from 'jwks-rsa';
import firebaseAdmin from 'firebase-admin';

import config from '../config';
import dogs from '../dogs.json';

export default (app) => {
    const jwtCheck = jwt({
        secret: jwts.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
        }),
        audience: config.AUTH0_API_AUDIENCE,
        issuer: `https://${config.AUTH0_DOMAIN}/`,
        algorithm: 'RS256'
    });

    const serviceAccount = require(config.FIREBASE_KEY);
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        databaseURL: config.FIREBASE_DB
    });

    app.get('/auth/firebase', jwtCheck, (req, res) => {
        const uid = req.user.sub;

        firebaseAdmin.auth().createCustomToken(uid)
            .then(token => {
                res.json({ firebaseToken: token });
            })
            .catch(err => {
                res.status(500).send({
                    message: 'Something went wrong acquiring a Firebase token.',
                    error: err
                });
            });
    });


    const getDogsBasic = () => {
        return dogs.map(dog => {
            return {
                rank: dog.rank,
                breed: dog.breed,
                image: dog.image
            }
        });
    };

    app.get('/api/dogs', (req, res) => {
        res.send(getDogsBasic());
    });

    app.get('/api/dogs/:rank', jwtCheck, (req, res) => {
        const rank = req.params.rank * 1;
        const thisDog = dogs.find(dog => dog.rank === rank);
        res.send(thisDog);
    });
}