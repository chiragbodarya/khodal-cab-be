const formatAdminResponse = (admin) => {
  const formatted = { ...admin };
  delete formatted.password;
  return formatted;
};

const me = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      admin: formatAdminResponse(req.admin)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  me
};
