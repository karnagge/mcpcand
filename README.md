# MCP DivulgaCandContas Server

Um servidor MCP (Model Context Protocol) que implementa todos os serviços da API DivulgaCandContas do TSE (Tribunal Superior Eleitoral), permitindo consultas sobre candidaturas e prestação de contas eleitorais.

## Funcionalidades

Este servidor implementa as seguintes ferramentas (tools) baseadas na API oficial do TSE:

### 🏛️ Candidaturas
- **listar_candidatos_municipio**: Lista todos os candidatos em um município específico
- **consultar_candidato**: Consulta informações detalhadas de um candidato

### 🗳️ Eleições 
- **listar_anos_eleitorais**: Lista anos eleitorais disponíveis
- **listar_eleicoes_ordinarias**: Lista eleições ordinárias disponíveis
- **listar_eleicoes_suplementares**: Lista eleições suplementares por estado/ano
- **listar_cargos_municipio**: Lista cargos em disputa em um município

### 💰 Prestação de Contas
- **consultar_prestador_contas**: Consulta informações de prestação de contas de candidatos

## Instalação e Uso

### Script de Gerenciamento (Recomendado)

Este projeto inclui um script de gerenciamento que facilita todas as operações:

```bash
# Tornar o script executável (apenas uma vez)
chmod +x mcp-server.sh

# Ver todas as opções disponíveis
./mcp-server.sh help

# Construir o projeto
./mcp-server.sh build

# Executar localmente
./mcp-server.sh run

# Construir e executar com Docker
./mcp-server.sh build-docker
./mcp-server.sh run-docker

# Executar testes
./mcp-server.sh test

# Ver configuração para Claude Desktop
./mcp-server.sh config

# Limpar arquivos gerados
./mcp-server.sh clean
```

## 📦 Imagem Docker

A imagem Docker está disponível no Docker Hub:

**🔗 Docker Hub:** [`karnagge/mcp-divulgacandcontas`](https://hub.docker.com/r/karnagge/mcp-divulgacandcontas)

**📋 Tags disponíveis:**
- `latest` - Versão mais recente
- `v1.0.0` - Versão estável 1.0.0

**💾 Tamanho:** ~227MB (otimizada com Alpine Linux)

**🔧 Uso rápido:**
```bash
docker run -it --rm karnagge/mcp-divulgacandcontas:latest
```

### Via Docker

#### Opção 1: Usar imagem pré-construída (Recomendado)
```bash
# Baixar e executar diretamente do Docker Hub
docker run -it --rm karnagge/mcp-divulgacandcontas:latest

# Ou executar como daemon
docker run -d --name mcp-server -p 3000:3000 karnagge/mcp-divulgacandcontas:latest
```

#### Opção 2: Build local
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/karnagge/mcpcand.git
   cd mcpcand
   ```

2. **Build da imagem:**
   ```bash
   docker build -t mcp-divulgacandcontas .
   ```

3. **Execute o container:**
   ```bash
   docker run -p 3000:3000 mcp-divulgacandcontas
   ```

### Instalação Local

1. **Instalar dependências:**
```bash
npm install
# OU usando o script
./mcp-server.sh build
```

2. **Compilar TypeScript:**
```bash
npm run build
```

3. **Executar servidor:**
```bash
npm start
# OU usando o script
./mcp-server.sh run
```

### Modo Desenvolvimento

```bash
npm run dev
# OU usando o script para desenvolvimento contínuo
npm run watch  # Em um terminal
./mcp-server.sh run  # Em outro terminal
```

## Configuração com Claude Desktop

Para usar este servidor com Claude Desktop, adicione a seguinte configuração ao seu `claude_desktop_config.json`:

### Usando Docker
```json
{
  "mcpServers": {
    "divulgacandcontas": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "mcp-divulgacandcontas-server:latest"
      ]
    }
  }
}
```

### Usando Node.js Local
```json
{
  "mcpServers": {
    "divulgacandcontas": {
      "command": "node",
      "args": ["/caminho/absoluto/para/build/index.js"]
    }
  }
}
```

### Usando NPX (se publicado)
```json
{
  "mcpServers": {
    "divulgacandcontas": {
      "command": "npx",
      "args": ["-y", "mcp-divulgacandcontas-server"]
    }
  }
}
```

## Uso das Ferramentas

### Exemplo: Listar candidatos de São Paulo em 2020

```typescript
// Parâmetros necessários
{
  "ano": 2020,
  "municipio": 35157,  // Código de São Paulo
  "eleicao": 2030402020,  // Eleições municipais 2020
  "cargo": 11  // Prefeito
}
```

### Exemplo: Consultar informações de um candidato

```typescript
{
  "ano": 2020,
  "municipio": 35157,
  "eleicao": 2030402020, 
  "candidato": 123456  // Código do candidato
}
```

### Exemplo: Listar eleições suplementares em São Paulo

```typescript
{
  "ano": 2020,
  "uf": "SP"
}
```

## API Base

Este servidor consulta a API oficial do TSE:
- **Base URL**: `https://divulgacandcontas.tse.jus.br/divulga/rest/v1`
- **Documentação**: [Swagger da API](https://raw.githubusercontent.com/augusto-herrmann/divulgacandcontas-doc/refs/heads/main/divulgacandcontas-swagger.yaml)

## Estrutura do Projeto

```
mcp-divulgacandcontas-server/
├── src/
│   └── index.ts          # Servidor MCP principal
├── build/                # Código compilado (gerado)
├── Dockerfile           # Configuração Docker
├── docker-compose.yml   # Configuração Docker Compose
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração TypeScript
└── README.md           # Esta documentação
```

## Desenvolvimento

### Scripts Disponíveis

- `npm run build` - Compila TypeScript
- `npm run start` - Executa servidor compilado
- `npm run dev` - Compila e executa em modo desenvolvimento
- `npm run watch` - Monitora mudanças e recompila automaticamente
- `npm run clean` - Remove arquivos compilados

### Dependências Principais

- **@modelcontextprotocol/sdk**: SDK oficial do MCP
- **zod**: Validação de schemas
- **axios**: Cliente HTTP para chamadas à API do TSE

## Segurança e Limitações

- ✅ Dados públicos oficiais do TSE
- ✅ Timeout configurado (30s) para requisições
- ✅ Validação rigorosa de parâmetros com Zod
- ✅ Tratamento de erros da API
- ⚠️ Sujeito a limitações de rate limit da API do TSE
- ⚠️ Dados disponíveis conforme cronograma do TSE

## Códigos Úteis

### Códigos de Eleição Comuns
- `2030402020`: Eleições Municipais 2020
- `2030402024`: Eleições Municipais 2024
- `2030602022`: Eleições Gerais 2022

### Códigos de Cargo Comuns
- `11`: Prefeito
- `13`: Vice-prefeito  
- `51`: Vereador
- `1`: Presidente
- `3`: Governador
- `5`: Senador
- `6`: Deputado Federal
- `7`: Deputado Estadual

### Estados (UF)
Use a sigla de 2 letras: `SP`, `RJ`, `MG`, `RS`, etc.

## Suporte

Este servidor implementa todos os endpoints documentados na API DivulgaCandContas do TSE. Para problemas ou dúvidas:

1. Verifique se os parâmetros estão corretos (ano, códigos de município, etc.)
2. Consulte a documentação oficial da API do TSE
3. Verifique se o serviço do TSE está disponível

## Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Nota**: Este é um projeto independente que utiliza a API pública do TSE. Não possui afiliação oficial com o Tribunal Superior Eleitoral.
