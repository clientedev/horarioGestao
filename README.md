# Horário de Trabalho & Presença em Tempo Real — Grupo de Gestão

Sistema completo e moderno para controle visual e gestão de escalas semanais de colaboradores, cálculo de jornada em tempo real, visualização em cards, tabela semanal e linha do tempo.

---

## 🚀 Funcionalidades

- 🟢 **Status em Tempo Real**: Identifica automaticamente se cada colaborador está trabalhando, fora do expediente ou de folga no momento exato.
- ⏱️ **Progresso do Turno & Horas Restantes**: Exibe a porcentagem cumprida da jornada e quanto tempo falta para o término do expediente.
- 📋 **Colar Imagem Direto (Ctrl+V)**: Permite colar fotos da área de transferência com compressão automática, além de upload de arquivos ou inserção de link (URL).
- 🔍 **Pesquisa Instantânea**: Digite o nome ou pressione `/` para encontrar qualquer colaborador imediatamente.
- 👁️ **3 Modos de Visualização**:
  - **Cards Visuais**: Perfeito para o dia a dia, com fotos, badges coloridos e mini-escala da semana.
  - **Tabela Semanal Completa**: Grade completa de Segunda a Sábado com destaque na coluna do dia atual.
  - **Linha do Tempo (Timeline)**: Gráfico horário (06:00 às 23:00) com cursor em tempo real indicando a hora atual.
- ⚡ **Simulador de Horários**: Permite simular qualquer dia da semana e horário para planejar escalas futuras.
- ☀️ **Modo Claro Otimizado**: Design limpo, de alto contraste e agradável aos olhos (com suporte a Modo Escuro).
- 💾 **Persistência Local (LocalStorage)**: Todas as edições e novos colaboradores ficam salvos no navegador.

---

## 👥 Colaboradores Integrados (Base Oficial 09/09/2026)

- Adeniuso (CFP 108)
- Leandro (CFP 103)
- Ana Paula Baum (CFP 108)
- Ana Paula Guerreiro (CFP 108 / 103)
- Edilson (CFP 103)
- Edson (CFP 103)
- Eduardo (CFP 103 / 108)
- Eliane (CFP 103)
- Jefferson (CFP 103)
- João Manoel (CFP 108)
- Laercio (CFP 108)
- Lidiane (CFP 108 / 103)
- Marcos (CFP 108)
- Mauro (CFP 108)
- Mayra (CFP 108)
- Silvia (CFP 103)

---

## 📦 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/clientedev/horarioGestao.git

# Acesse a pasta
cd horarioGestao

# Inicie o servidor
node server.js
```

Abra no navegador em: `http://localhost:3333`

---

## ☁️ Deploy no Vercel

O projeto foi 100% preparado para publicação no **Vercel**:
1. Conecte sua conta do GitHub ao [Vercel](https://vercel.com).
2. Importe o repositório `clientedev/horarioGestao`.
3. O Vercel detectará automaticamente o `vercel.json` e o `index.html`. Clique em **Deploy**.
