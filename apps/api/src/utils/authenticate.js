
export const authenticate = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "A valid access token is required"
    });
  }
};
