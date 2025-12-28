# 🎯 CARD DE REFERÊNCIA RÁPIDA - GIT & GITHUB

> Cole isso na parede do seu escritório! 📌

---

## ⏰ ROTINA DIÁRIA

### 🌅 ANTES DE COMEÇAR (TODO DIA!)
```bash
cd c:\xampp\htdocs\xack
git checkout dev
git pull origin dev
```
**OU**: Duplo clique em `backup-github.bat`

---

### 🌙 ANTES DE SAIR (FIM DO DIA!)
```bash
git status
git add .
git commit -m "feat: descrição do que fez"
git push origin dev
```
**OU**: Duplo clique em `backup-github.bat`

---

## 🛠️ COMANDOS MAIS USADOS

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| `git status` | Ver o que mudou | Sempre que estiver perdido |
| `git add .` | Preparar tudo para salvar | Antes de fazer commit |
| `git commit -m "..."` | Salvar ponto de restauração | Quando terminar uma tarefa |
| `git push origin dev` | Enviar para GitHub | Fim do dia / Backup |
| `git pull origin dev` | Baixar do GitHub | Início do dia |
| `git checkout dev` | Ir para branch dev | Sempre que for trabalhar |
| `git checkout main` | Voltar para versão estável | Se algo der muito errado |
| `git log` | Ver histórico | Curiosidade |

---

## 🆘 EMERGÊNCIAS

### "Fiz besteira, quero desfazer!"
```bash
git reset --hard HEAD
```
⚠️ **CUIDADO**: Apaga tudo que não foi commitado!

---

### "Erro ao fazer push"
```bash
git pull origin dev
git push origin dev
```

---

### "Perdi tudo!"
```bash
cd c:\xampp\htdocs
git clone https://github.com/dionebr/xack.git
cd xack
npm install
```
⚠️ Lembre-se de recriar os arquivos `.env`!

---

## 🔐 REGRAS DE OURO

1. ✅ SEMPRE trabalhe na branch `dev`
2. ✅ SEMPRE faça `pull` antes de começar
3. ✅ SEMPRE faça `push` antes de sair
4. ❌ NUNCA mexa na branch `main` direto
5. ❌ NUNCA commite arquivos `.env`

---

## 📚 ANALOGIAS PARA LEMBRAR

- **Git** = Máquina do tempo / Save do videogame
- **GitHub** = Nuvem / Backup online
- **Commit** = Ponto de salvamento / Checkpoint
- **Branch** = Universo paralelo
- **Push** = Upload / Enviar
- **Pull** = Download / Baixar

---

## 🎓 MENSAGENS DE COMMIT

```bash
# ✅ BOM
git commit -m "feat: adiciona botão de login"
git commit -m "fix: corrige erro no formulário"
git commit -m "docs: atualiza README"

# ❌ RUIM
git commit -m "mudanças"
git commit -m "update"
```

**Prefixos**:
- `feat:` = Nova funcionalidade
- `fix:` = Correção de bug
- `docs:` = Documentação
- `style:` = Visual (CSS)

---

## 📞 PRECISA DE AJUDA?

1. Rode `git status` para ver onde está
2. Se estiver confuso, volte para `main`:
   ```bash
   git checkout main
   ```
3. Seu código está seguro no GitHub! ✅

---

**🎉 Lembre-se: Git é seu amigo, não seu inimigo!**

Para guia completo, veja: `guia-git-github.md`
