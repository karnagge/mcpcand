# 🤖 Configuração do Claude Desktop para MCP DivulgaCandContas

## 📋 Configuração via Docker (Recomendado)

### 1. Localize o arquivo de configuração do Claude Desktop:

**🐧 Linux:**
```bash
~/.config/claude-desktop/claude_desktop_config.json
```

**🍎 macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**🪟 Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

### 2. Adicione a configuração:

Se o arquivo **não existir**, crie-o com o conteúdo:
```json
{
  "mcpServers": {
    "divulgacandcontas": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "karnagge/mcp-divulgacandcontas:latest"
      ]
    }
  }
}
```

Se o arquivo **já existir**, adicione o servidor na seção `mcpServers`:
```json
{
  "mcpServers": {
    "divulgacandcontas": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "karnagge/mcp-divulgacandcontas:latest"
      ]
    },
    "outros_servidores": {
      "...": "..."
    }
  }
}
```

### 3. Reinicie o Claude Desktop

Feche completamente o Claude Desktop e abra novamente para que a configuração seja carregada.

### 4. Teste a configuração

No Claude Desktop, você deve ver as seguintes ferramentas disponíveis:
- 🗳️ **listar_candidatos_municipio** - Lista candidatos por município
- 👤 **consultar_candidato** - Consulta dados de candidato específico  
- 📅 **listar_anos_eleitorais** - Lista anos eleitorais disponíveis
- 🏛️ **listar_eleicoes_ordinarias** - Lista eleições ordinárias
- 📊 **listar_eleicoes_suplementares** - Lista eleições suplementares
- 🎯 **listar_cargos_municipio** - Lista cargos por município
- 💰 **consultar_prestador_contas** - Consulta prestação de contas

### 5. Exemplo de uso

Teste com uma pergunta como:
> "Liste os candidatos de Brasília para a eleição de 2024"

O Claude deve usar automaticamente a ferramenta `listar_candidatos_municipio`.

## 🔧 Configuração Alternativa (Node.js Local)

Se preferir usar sem Docker:

```json
{
  "mcpServers": {
    "divulgacandcontas": {
      "command": "node",
      "args": ["/caminho/completo/para/mcpcand/build/index.js"]
    }
  }
}
```

⚠️ **Nota:** Para usar localmente, você precisa ter o projeto clonado e compilado.

## 🐛 Troubleshooting

### Problema: Docker não encontrado
- Certifique-se que Docker está instalado e em execução
- Teste: `docker run hello-world`

### Problema: Imagem não encontrada
- Baixe manualmente: `docker pull karnagge/mcp-divulgacandcontas:latest`

### Problema: Ferramentas não aparecem no Claude
- Verifique se o arquivo JSON está válido
- Reinicie o Claude Desktop completamente
- Verifique logs do Claude (se disponíveis)

### Problema: Erro de permissão
```bash
# No Linux, adicione seu usuário ao grupo docker:
sudo usermod -aG docker $USER
# Faça logout e login novamente
```
