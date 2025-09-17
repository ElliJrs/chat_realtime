// api/message.js
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,      // definir no Vercel
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { name, text } = req.body;
    if (!text) return res.status(400).json({ error: 'Mensagem vazia' });

    const payload = { name: name || 'Anon', text, time: Date.now() };

    // Dispara evento para o canal público "public-chat"
    await pusher.trigger('chat-realtime', 'message', payload);

    // Opcional: aqui você pode gravar em DB (Supabase/Postgres)
    // Ex: await insertIntoDB(payload);

    res.status(200).json({ ok:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};
