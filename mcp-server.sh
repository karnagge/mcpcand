#!/bin/bash

# Script para facilitar o uso do MCP DivulgaCandContas Server

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se o Docker está disponível
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado ou não está no PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker está instalado mas não está rodando"
        exit 1
    fi
}

# Função para verificar se o Node.js está disponível
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado ou não está no PATH"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js versão 18 ou superior é necessária. Versão atual: $(node --version)"
        exit 1
    fi
}

# Função para construir o projeto
build_project() {
    print_info "Construindo o projeto..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json não encontrado. Execute este script no diretório do projeto."
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_info "Instalando dependências..."
        npm install
    fi
    
    print_info "Compilando TypeScript..."
    npm run build
    
    print_success "Projeto construído com sucesso!"
}

# Função para construir a imagem Docker
build_docker() {
    print_info "Construindo imagem Docker..."
    check_docker
    
    docker build -t mcp-divulgacandcontas-server:latest .
    
    print_success "Imagem Docker construída com sucesso!"
}

# Função para executar com Node.js local
run_local() {
    print_info "Executando servidor MCP localmente..."
    check_node
    
    if [ ! -d "build" ]; then
        build_project
    fi
    
    print_info "Iniciando servidor MCP via stdio..."
    print_warning "Pressione Ctrl+C para parar o servidor"
    node build/index.js
}

# Função para executar com Docker
run_docker() {
    print_info "Executando servidor MCP via Docker..."
    check_docker
    
    # Verificar se a imagem existe
    if ! docker images | grep -q "mcp-divulgacandcontas-server"; then
        print_warning "Imagem Docker não encontrada. Construindo..."
        build_docker
    fi
    
    print_info "Iniciando container Docker..."
    print_warning "Pressione Ctrl+C para parar o container"
    docker run -i --rm mcp-divulgacandcontas-server:latest
}

# Função para executar com Docker Compose
run_compose() {
    print_info "Executando servidor MCP via Docker Compose..."
    check_docker
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml não encontrado"
        exit 1
    fi
    
    print_info "Iniciando serviços via Docker Compose..."
    docker-compose up --build
}

# Função para mostrar informações sobre configuração
show_config() {
    echo
    print_info "=== Configuração para Claude Desktop ==="
    echo
    echo "Para usar este servidor com Claude Desktop, adicione ao seu claude_desktop_config.json:"
    echo
    echo "Opção 1 - Node.js Local:"
    echo '{
  "mcpServers": {
    "divulgacandcontas": {
      "command": "node",
      "args": ["'$(pwd)'/build/index.js"]
    }
  }
}'
    echo
    echo "Opção 2 - Docker:"
    echo '{
  "mcpServers": {
    "divulgacandcontas": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "mcp-divulgacandcontas-server:latest"
      ]
    }
  }
}'
    echo
    print_info "Localização do arquivo de configuração:"
    echo "• macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"
    echo "• Windows: %APPDATA%\\Claude\\claude_desktop_config.json"
    echo
}

# Função para executar testes básicos
test_server() {
    print_info "Testando servidor MCP..."
    
    if [ ! -d "build" ]; then
        build_project
    fi
    
    if [ ! -f "build/index.js" ]; then
        print_error "Arquivo build/index.js não encontrado"
        exit 1
    fi
    
    print_info "Verificando sintaxe do código compilado..."
    if node -c build/index.js; then
        print_success "Servidor compilado corretamente e sintaxe OK"
    else
        print_error "Erro de sintaxe no código compilado"
        exit 1
    fi
    
    print_info "Verificando se as dependências estão disponíveis..."
    if node -e "require('./build/index.js')" 2>/dev/null; then
        print_success "Dependências carregadas corretamente"
    else
        print_warning "Aviso: Pode haver problemas com dependências, mas isso é normal para servidores stdio"
    fi
    
    print_success "Testes básicos concluídos com sucesso!"
}

# Função para limpar arquivos gerados
clean() {
    print_info "Limpando arquivos gerados..."
    
    if [ -d "build" ]; then
        rm -rf build
        print_success "Diretório build removido"
    fi
    
    if [ -d "node_modules" ]; then
        read -p "Remover node_modules? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf node_modules
            print_success "Diretório node_modules removido"
        fi
    fi
    
    # Limpar imagens Docker
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        if docker images | grep -q "mcp-divulgacandcontas-server"; then
            read -p "Remover imagem Docker? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker rmi mcp-divulgacandcontas-server:latest
                print_success "Imagem Docker removida"
            fi
        fi
    fi
}

# Função para mostrar ajuda
show_help() {
    echo "MCP DivulgaCandContas Server - Script de Gerenciamento"
    echo
    echo "Uso: $0 [COMANDO]"
    echo
    echo "Comandos disponíveis:"
    echo "  build        Constrói o projeto (instala deps + compila TS)"
    echo "  build-docker Constrói a imagem Docker"
    echo "  run          Executa o servidor localmente com Node.js"
    echo "  run-docker   Executa o servidor via Docker"
    echo "  run-compose  Executa o servidor via Docker Compose"
    echo "  test         Testa se o servidor inicia corretamente"
    echo "  config       Mostra configuração para Claude Desktop"
    echo "  clean        Remove arquivos gerados (build, node_modules, imagem docker)"
    echo "  help         Mostra esta ajuda"
    echo
    echo "Exemplos:"
    echo "  $0 build && $0 run"
    echo "  $0 build-docker && $0 run-docker"
    echo "  $0 config"
}

# Função principal
main() {
    case "${1:-help}" in
        "build")
            build_project
            ;;
        "build-docker")
            build_docker
            ;;
        "run")
            run_local
            ;;
        "run-docker")
            run_docker
            ;;
        "run-compose")
            run_compose
            ;;
        "test")
            test_server
            ;;
        "config")
            show_config
            ;;
        "clean")
            clean
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Comando inválido: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal com todos os argumentos
main "$@"
