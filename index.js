require('dotenv').config({path: __dirname + '/.env'})
const express = require('express');
const forge = require('node-forge');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const app = express();

// middleware for parsing bodies from URL
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Default route. Redirects to decode_csr route.
 * 
 * @name GET/
 * @function
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.get('/', (req, res) => {
    res.writeHead(301, { Location: "https://localhost:8443/decode_csr" });
    res.end();
});

/**
 * Route to serve decode_csr page.
 * 
 * @name GET/decode_csr
 * @function
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.get('/decode_csr', (req, res) => {
    //serve webpage
    res.sendFile('decode_csr.html', { root: __dirname })
});

/**
 * Route to serve decode_csr documentation page.
 * 
 * @name GET/decode_csr/docs
 * @function
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.get('/decode_csr/docs', (req, res) => {
    res.sendFile('decode_csr_docs.html', { root: __dirname })
});

/**
 * Post route for decoding CSR.
 * 
 * @name POST/decode_csr
 * @function
 * @param {object} req - Express request object. Should contain CSR in body.
 * @param {object} res - Express response object
 */
app.post('/decode_csr', (req, res) => {
    try {
        const csr = req.body.csr;
        
        if (!csr) {
            res.status(400).send({ error: 'No CSR provided in request body.' });
            return;
        }

        if (!(csr.includes('-----BEGIN NEW CERTIFICATE REQUEST-----') && csr.includes('-----END NEW CERTIFICATE REQUEST-----'))) {
            res.status(400).send({ error: 'The CSR provided is not a valid PEM format.' });
            return;
        }

        // Decode the CSR from PEM format
        const csrForge = forge.pki.certificationRequestFromPem(csr);
        
        // Construct response
        const response = {
            publicKey: forge.pki.publicKeyToPem(csrForge.publicKey),
            keySize: csrForge.publicKey.n.bitLength(), // public key size
            attributes: csrForge.subject.attributes.map(attr => ({
                name: attr.name,
                value: attr.value
            })),
            attributes_extended: csrForge.attributes.map(attr => ({
                type: attr.type,
                value: attr.value
            }))
        };
        
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({ error: `Failed to decode CSR: ${error.message}` });
    }
});

const httpsOptions = {
    key: fs.readFileSync('./certstore/key.pem', 'utf-8'),
    cert: fs.readFileSync('./certstore/server.crt', 'utf-8')
};

/**
 * HTTPS Server
 * 
 * @type {https.Server}
 */
const server = https.createServer(httpsOptions, app);

/**
 * Server port. Defaults to 443.
 * 
 * @type {number}
 */
const port = process.env.PORT || 443;

/**
 * Starts the server on the defined port.
 */
server.listen(port, () => console.log(`HTTPS Server is listening on port ${port}`));
