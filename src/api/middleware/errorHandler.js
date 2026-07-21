/**
 * Express error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Anthropic API errors
  if (err.status === 401) {
    return res.status(401).json({
      error: 'Unauthorized - check your API key',
      details: err.message,
    });
  }

  if (err.status === 429) {
    return res.status(429).json({
      error: 'Rate limited - please try again later',
      details: err.message,
    });
  }

  if (err.status === 500) {
    return res.status(500).json({
      error: 'API error',
      details: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}
