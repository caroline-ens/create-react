
export default function handler(req, res) {
  const cookie = process.env.PASSPORT_COOKIE;

  res.status(200).json({
    success: true,
    cookie
  });
}

