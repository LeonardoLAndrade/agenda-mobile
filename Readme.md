# 🗓️ Fasiclin - Sistema de Agenda de Profissionais

Sistema completo de agendamento de profissionais da saúde, desenvolvido como projeto acadêmico com **Node.js**, **React Native (Expo)** e **MySQL**.

## 🚀 Tecnologias

- **Backend:** Node.js, Express, Sequelize, MySQL
- **Frontend:** React Native (Expo + TypeScript), AsyncStorage, Axios
- **Banco de Dados:** MySQL
- **Ambiente de Deploy:** Ubuntu Server com Systemd

---

## 🧱 Estrutura de Diretórios

```
agenda-mobile/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── models/
│   │   └── routes/
│   └── index.js
│
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   └── (drawer)/
    ├── components/
    ├── src/
    │   ├── navigation/
    │   ├── services/
    │   └── utils/
    ├── app.json
    └── eas.json
```

---

## ⚙️ Instalação

### 🔧 Backend

1. Acesse a pasta:

   ```bash
   cd backend
   ```

2. Instale dependências:

   ```bash
   npm install
   ```

3. Configure o banco de dados no arquivo `src/config/config.js`

4. Execute localmente `backend/`:

   ```bash
   node index.js
   ```

5. Ou inicie com `systemd` em produção:

   ```bash
   sudo systemctl start backend_leonardolima.service
   ```

---

### 📱 Frontend (Expo)

1. Acesse a pasta do app:

   ```bash
   cd frontend
   ```

2. Instale dependências:

   ```bash
   npm install
   ```

3. Configure o IP da API no arquivo `src/services/api.ts`

4. Rode no Expo `frontend/`:

   ```bash
   npx expo start
   ```

---

## 🔐 Autenticação

- Utiliza `AsyncStorage` para persistência do login local
- Validação de sessão via backend na rota:

  ```
  GET /usuarios/login/:login
  ```

---

## ✨ Funcionalidades

- ✅ Login persistente com validação
- ✅ Cadastro, listagem, edição e exclusão de agendamentos
- ✅ Filtros de profissionais por especialidade no cadastro e edição de agendamento
- ✅ Associação a especialidade e procedimentos de forma dinâmica
- ✅ Agendamentos com seleção de profissional e horário
- ✅ Interface mobile responsiva com navegação via `expo-router`
- ✅ Compatível com APK de produção

---

## 📦 Geração de APK

Para gerar um APK de produção:

```bash
eas build --platform android
```

> ⚠️ Se estiver usando HTTP (sem HTTPS), adicione no `app.json`:

```json
"plugins": [
  [
    "expo-build-properties",
    {
      "android": {
        "usesCleartextTraffic": true
      }
    }
  ]
]
```

---

## 🧠 Considerações

- `runtimeVersion` deve ser uma string fixa, como `"1.1.1"`
- O backend deve escutar em `0.0.0.0` e estar acessível por IP fixo
- O serviço do backend pode ser persistido com `systemd` (ex: `backend_leonardolima.service`)

---

## 👨‍💻 Autor

[**Leonardo Lima Andrade**](https://github.com/LeonardoLAndrade)  
Projeto desenvolvido para fins acadêmicos  
Faculdade FASIPE Cuiabá - FASICLIN
