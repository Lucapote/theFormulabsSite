export default function handler(req, res) {
  res.status(200).json({
    status: "healthy",
    environment: process.env.VERCEL_ENV || "development",
    timestamp: new Date().toISOString()
  });
}
