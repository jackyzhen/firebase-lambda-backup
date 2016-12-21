"use strict";

const https = require('https');
const AWS = require('aws-sdk');

AWS.config.region = process.env['S3_REGION'];
const s3 = new AWS.S3();

const s3Bucket = process.env['S3_BUCKET'];
const firebaseDatabaseUrl = process.env['FIREBASE_URL']
const encryptedFirebaseToken = process.env['FIREBASE_TOKEN'];
let decryptedFirebaseToken;

function fetchFromFirebase() {
  const options = {
    host: firebaseDatabaseUrl,
    path: '/.json?auth=' + decryptedFirebaseToken,
  };
  return new Promise(function(resolve, reject) {
    var req = https.get(options, function(res) {

        var bodyChunks = '';
        res.on('data', function(chunk) {
          bodyChunks += chunk;
        }).on('end', function() {
          return resolve(bodyChunks);
        });
      });

      req.on('error', function(e) {
        return reject(e);
      });
  });
}

function putObjectToS3(data){
    const s3 = new AWS.S3();
        const params = {
            Bucket : s3Bucket,
            Key : '' + Date.now() + '.json',
            Body : data,
            ContentType: 'application/json',
        };
        s3.putObject(params, function(err, data) {
          if (err) console.log(err, err.stack);
          else     console.log(data);
          console.log('Backup Done');
        });
}

exports.handler = function(event, context, callback) {

    console.log('Backup Starting');

    if (decryptedFirebaseToken) {
      fetchFromFirebase()
      .then(function(result) {
          putObjectToS3(result);
      });
    } else {
      const kms = new AWS.KMS();
      kms.decrypt({ CiphertextBlob: new Buffer(encryptedFirebaseToken, 'base64') }, (err, data) => {
          if (err) {
              console.log('Decrypt error:', err);
              return callback(err);
          }
          decryptedFirebaseToken = data.Plaintext.toString('ascii');
          fetchFromFirebase()
          .then(function(result) {
              putObjectToS3(result);
          });
      });
    }
};