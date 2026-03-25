name : Security context
# Solely purpose
The purpose context is to remember what security to analyse 
## Basic Security to advanced security 
 Are all passwords hashed with bcrypt (no plain text, no MD5/SHA)?

 Is JWT implemented securely (expiry, strong secret, httpOnly cookie or secure storage)?

 Are all protected routes checking authentication middleware?

 Is role-based access enforced (admin routes blocked for regular users)?

 Is user input validated and sanitized on both frontend and backend?

 Are MongoDB queries safe from NoSQL injection ($gt, $ne, $regex attacks)?

 Is CORS restricted to known frontend origins only?

 Are rate limits applied to login, signup, OTP, and password reset?

 Are API error responses free of stack traces and internal paths?

 Are HTTP security headers configured (Helmet.js)?

 Is HTTPS enforced on all endpoints?

 Are file uploads restricted by type and size?

 Are secrets absent from codebase (no hardcoded keys, tokens, passwords)?

 Is npm audit clean of Critical and High vulnerabilities?

 Are sensitive fields excluded from API responses (password, tokens)?


### output 
Majorly file is for to only verify whether these security are applied or not you are secrity nerd rest you know what to do 