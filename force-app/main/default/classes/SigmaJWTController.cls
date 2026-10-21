public with sharing class SigmaJWTController {
    @AuraEnabled(cacheable=false)
    public static String getSignedJWT() {
        // Get the current Salesforce users email
        String userEmail = UserInfo.getUserEmail();
        
        // Replace these with your actual Sigma credentials
        String clientId = '';  // Your Sigma client ID, can be put in a Named Credential in Salesforce
        String secret = '';  // Your Sigma secret key, can be put in a Named Credential in Salesforce
        
        // Generate timestamps
        Long now = DateTime.now().getTime() / 1000;
        Long exp = now + 3600;  // 1 hour session
        String jti = generateUUID();  // Generate a fresh nonce
        
        // Create JWT header
        Map<String, Object> header = new Map<String, Object>{
            'alg' => 'HS256',
            'typ' => 'JWT',
            'kid' => clientId
        };
        
        // Create JWT payload.  For cases where the users accessing Sigma are Internal users,
        // omit the Teams, Account Type and User Attributes claims.  
        Map<String, Object> payload = new Map<String, Object>{
            'sub' => userEmail,
            'iss' => clientId,
            'iat' => now,
            'exp' => exp,
            'jti' => jti,
            'session_length' => 3600
        };
        
        // Encode and sign the token
        Blob headerBlob = Blob.valueOf(JSON.serialize(header));
        Blob payloadBlob = Blob.valueOf(JSON.serialize(payload));
        
        String encodedHeader = base64UrlEncodeBlob(headerBlob);
        String encodedPayload = base64UrlEncodeBlob(payloadBlob);
        String tokenToSign = encodedHeader + '.' + encodedPayload;
        
        // Generate the signature
        Blob signature = Crypto.generateMac(
            'HmacSHA256',
        Blob.valueOf(tokenToSign),
        Blob.valueOf(secret)
            );
        
        // Encode the signature
        String encodedSignature = base64UrlEncodeBlob(signature);
        return tokenToSign + '.' + encodedSignature;
    }
    
    // Base64 URL encode a String
    public static String base64UrlEncode(String input) {
        String b64 = EncodingUtil.base64Encode(Blob.valueOf(input));
        b64 = b64.replace('+', '-').replace('/', '_').replace('=', '');
        return b64;
    }
    
    // Base64 URL encode a Blob
    public static String base64UrlEncodeBlob(Blob input) {
        String b64 = EncodingUtil.base64Encode(input);
        b64 = b64.replace('+', '-').replace('/', '_').replace('=', '');
        return b64;
    }
    
    // Generate a random string of specified length
    public static String generateRandomString(Integer len) {
        final String chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        String randStr = '';
        while (randStr.length() < len) {
            Integer idx = Math.mod(Math.abs(Crypto.getRandomInteger()), chars.length());
            randStr += chars.substring(idx, idx + 1);
        }
        return randStr;
    }
    
    // Generate a UUID-like string
    public static String generateUUID() {
        return generateRandomString(8) + '-' +
            generateRandomString(4) + '-' +
            generateRandomString(4) + '-' +
            generateRandomString(4) + '-' +
            generateRandomString(12);
    }
}