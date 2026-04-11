export function errorHandler(err, req, res, next) {
   const status = err.status || 500;
  const errorCode = err.errorCode  || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Something went wrong.";
  
  res.status(status).json({ success: false, errorCode, message }); 
}