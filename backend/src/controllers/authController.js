const bcrypt = require("bcrypt");
const status = require("http-status");
const { Usuario, Profissional, PessoaFisica } = require("../models");

exports.login = async (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res
      .status(status.BAD_REQUEST)
      .json({ message: "Login e senha são obrigatórios." });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { LOGUSUARIO: login },
      include: [
        {
          model: Profissional,
          as: "usuarioProfissional",
          where: { TIPOPROFI: 4 }, // garante que só profissional do tipo 4 acesse
          include: [
            {
              model: PessoaFisica,
              as: "pessoa",
              attributes: ["NOMEPESSOA", "CPFPESSOA"],
            },
          ],
        },
      ],
    });

    if (!usuario) {
      return res.status(status.UNAUTHORIZED).json({
        message: "Usuário ou senha inválidos, ou acesso não permitido.",
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.SENHAUSUA);

    if (!senhaCorreta) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "Senha incorreta." });
    }

    return res.status(status.OK).json({
      message: "Login bem-sucedido",
      usuario: {
        login: usuario.LOGUSUARIO,
        id_profissio: usuario.ID_PROFISSIO,
        cpf_profissio: usuario.usuarioProfissional.pessoa.CPFPESSOA,
        nome_profissio: usuario.usuarioProfissional.pessoa.NOMEPESSOA,
        tipo: usuario.usuarioProfissional.TIPOPROFI,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Erro interno no servidor." });
  }
};
