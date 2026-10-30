export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Use POST para enviar uma redação.' })
  if (!process.env.OPENAI_API_KEY) return response.status(503).json({ error: 'A correção por IA ainda não foi configurada no servidor.' })

  const { theme = '', essay = '', track = '' } = request.body || {}
  if (typeof essay !== 'string' || essay.trim().length < 80) return response.status(400).json({ error: 'Envie uma redação com pelo menos 80 caracteres.' })
  if (essay.length > 20000) return response.status(400).json({ error: 'Para esta primeira versão, envie até 20.000 caracteres.' })

  const instructions = `Você é uma revisora pedagógica. Avalie uma redação de estudante sem fingir ser corretora oficial. Use a matriz da Redação do Enem 2026 como referência: C1 escrita formal; C2 tema e texto dissertativo-argumentativo; C3 seleção e organização de argumentos; C4 coesão; C5 intervenção respeitando direitos humanos. Produza uma estimativa por competência de 0 a 200, uma soma estimada de 0 a 1000, dois pontos fortes, até três prioridades práticas de revisão e uma observação cuidadosa caso falte tema ou o texto seja insuficiente. Não reescreva a redação inteira, não invente citações, não humilhe e deixe explícito que a análise é pedagógica, não oficial.`
  const prompt = `Área de estudo: ${track}\nTema informado: ${theme || 'não informado'}\n\nRedação:\n${essay}`

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-5.5', instructions, input: prompt, store: false }),
    })
    const payload = await aiResponse.json()
    if (!aiResponse.ok) return response.status(aiResponse.status).json({ error: 'A IA não respondeu agora. Tente novamente em instantes.' })
    const feedback = payload.output_text || 'A correção foi concluída, mas o texto de retorno não pôde ser lido.'
    return response.status(200).json({ feedback })
  } catch {
    return response.status(500).json({ error: 'Não foi possível falar com o serviço de correção.' })
  }
}
