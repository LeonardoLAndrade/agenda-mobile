const pool = require("../database/database");
const { QueryTypes } = require("sequelize");

exports.buscarPorLogin = async (req, res) => {
  const login = decodeURIComponent(req.params.login);

  try {
    const rows = await pool.query(
      `SELECT 
         u.IDUSUARIO,
         u.LOGUSUARIO,
         p.IDPROFISSIO,
         pf.NOMEPESSOA,
         pf.CPFPESSOA
       FROM USUARIO u
       JOIN PROFISSIONAL p ON u.ID_PROFISSIO = p.IDPROFISSIO
       JOIN PESSOAFIS pf ON pf.IDPESSOAFIS = p.ID_PESSOAFIS
       WHERE u.LOGUSUARIO = :login`,
      {
        replacements: { login },
        type: QueryTypes.SELECT,
      }
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(rows[0]); // Agora rows[0] é válido
  } catch (err) {
    console.error("Erro ao buscar usuário por login:", err);
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
};
