# Documentation for CSR Decoder
## Overview
This is a simple Express.js server application that serves to decode Certificate Signing Requests (CSR). The decoding happens in PEM format, where it returns the public key, key size, and the attributes of the CSR.

## Setup
You need to have Node.js and npm (Node package manager) installed to set up and run this project.

- Clone or download the project to your local machine.
- Install the dependencies by running the following command in your terminal: ```node npm install```
- The app requires an SSL certificate and key to create an HTTPS server. Place your server certificate (server.crt) and private key (key.pem) in the ./certstore/ directory.
- Create a .env file in the root directory of your project. Add environment-specific variables on new lines in the form of NAME=VALUE. For example, you can specify the port number here: PORT=8443. If the port is not provided, the server will listen on port 443 by default.

## Starting the Server
To start the server, navigate to the project directory in your terminal and type: ```node app.js```
The server will start, and you will see a console message like: HTTPS Server is listening on port 8443

## Endpoints

### GET '/'
Redirects to the '/decode_csr' endpoint.

### GET '/decode_csr'
Serves the 'decode_csr.html' webpage. You can use this webpage to send CSRs to the server.

### GET '/decode_csr/docs'
Serves the 'decode_csr_docs.html' webpage. This webpage contains the documentation for using this API.

### POST '/decode_csr'
This endpoint accepts a JSON body with a csr property that should contain a PEM-encoded CSR.

Example request body:

```json
{
  "csr": "-----BEGIN NEW CERTIFICATE REQUEST-----...-----END NEW CERTIFICATE REQUEST-----"
}
```

If the CSR is valid, this endpoint will return a JSON object containing the following properties:

- publicKey: PEM-encoded public key extracted from the CSR.
- keySize: Size of the public key in bits.
- attributes: List of attributes from the CSR's subject field. Each attribute is represented as an object with name and value properties.
- attributes_extended: List of extended attributes from the CSR. Each attribute is represented as an object with type and value properties.

If the CSR is not provided or is not valid, an error message will be returned.

## Dependencies
- express: Web server framework.
- node-forge: A native implementation of Transport Layer Security (TLS) in JavaScript. Used for CSR decoding.
- body-parser: Middleware for parsing incoming request bodies.
- dotenv: Module to load environment variables from a .env file.
- https: Module to create HTTPS server.
- fs: File System node module for reading SSL certificate and private key.

## Error Handling
The application includes basic error handling. If an error is thrown during the CSR decoding process, the error message will be sent in the response body under the error property with a status code of 500. If no CSR is provided, or the provided CSR is not in a valid PEM format, the corresponding error message will be sent with a status code of 400.