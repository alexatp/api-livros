function validate(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const mensagens = resultado.error.issues.map((issue) => issue.message);
      return res.status(400).json({ errors: mensagens });
    }

    req.body = resultado.data;
    next();
  };
}

export default validate;