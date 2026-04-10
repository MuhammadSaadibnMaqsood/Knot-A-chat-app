export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if ((!username, !email, !password))
    res.status(401).send({ mesage: "crediantial are required" });

  
};
export const login = async (req, res) => {};
export const logout = async (req, res) => {};
