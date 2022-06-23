const {TwitterApi} = require('twitter-api-v2');

const client = new TwitterApi({
    appKey: 'UmlZRHZlgV1OnjSWnldRbEYgP',
    appSecret: 'OZ0VyPCeQ6jnzU9W1UYv5DmisXbTFwE2R9itcFG2OPEiE6miRe',
    accessToken: '1521806226883067910-u9L0sIKp9vrAsuCAyyf84Eju0ksz7F',
    accessSecret: 'jNV0Jf3NtKKGrgKYkoUiQpVGUpc0PkXoeFFfxfRJRwu9B'
});


const rwClient = client.readWrite;

module.exports = rwClient;