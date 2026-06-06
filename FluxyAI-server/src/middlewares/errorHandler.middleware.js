const errorHandler = (err, req, res, next) => {
  console.error("Error encountered:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: err.error || [],
  });
};

export default errorHandler;
