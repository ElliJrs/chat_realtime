const Pusher = require("pusher");

// Configurações Pusher via variáveis de ambiente
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Array simples para armazenar mensagens em memória
let messages = []; // Cada item: {name, text, time}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { name, text } = req.body;
      if (!text) return res.status(400).json({ error: 'Mensagem vazia' });

      const payload = { name: name || 'Anon', text, time: Date.now() };

      // Adiciona ao histórico
      messages.push(payload);
      // Limita para 100 mensagens para não crescer demais
      if (messages.length > 100) messages.shift();

      // Dispara evento Pusher no canal correto
      await pusher.trigger('chat-realtime', 'message', payload);

      res.status(200).json({ ok:true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  } else if (req.method === 'GET') {
    // Retorna histórico para o cliente
    res.status(200).json(messages);
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
