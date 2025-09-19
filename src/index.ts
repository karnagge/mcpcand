#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  type CallToolRequest,
  type ListToolsRequest 
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from "axios";

// Base da API DivulgaCandContas
const API_BASE = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1";

// Configuração do cliente HTTP
const httpClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'User-Agent': 'MCP-DivulgaCandContas-Server/1.0.0'
  }
});

// Schemas para validação de parâmetros das tools
const CandidatosParaMunicipioSchema = z.object({
  ano: z.number().int().min(2000).max(new Date().getFullYear()),
  municipio: z.number().int(),
  eleicao: z.number().int(),
  cargo: z.number().int()
});

const ConsultaCandidatoSchema = z.object({
  ano: z.number().int().min(2000).max(new Date().getFullYear()),
  municipio: z.number().int(),
  eleicao: z.number().int(),
  candidato: z.number().int()
});

const CargosMunicipioSchema = z.object({
  eleicao: z.number().int(),
  municipio: z.number().int()
});

const EleicoesSuplementaresEstadoSchema = z.object({
  ano: z.number().int().min(2000).max(new Date().getFullYear()),
  uf: z.string().length(2)
});

const ConsultaPrestadorSchema = z.object({
  eleicao: z.number().int(),
  ano: z.number().int().min(2000).max(new Date().getFullYear()),
  municipio: z.number().int(),
  cargo: z.number().int(),
  candidato: z.number().int()
});

// Criar instância do servidor MCP
const server = new Server(
  {
    name: "mcp-divulgacandcontas-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Função auxiliar para tratar erros da API
async function handleApiRequest(request: () => Promise<any>): Promise<any> {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Dados não encontrados para os parâmetros informados");
      }
      throw new Error(`Erro na API: ${error.response?.status} - ${error.response?.statusText}`);
    }
    throw new Error(`Erro inesperado: ${error}`);
  }
}

// Implementação do handler para listar tools
server.setRequestHandler(ListToolsRequestSchema, async (request: ListToolsRequest) => {
  return {
    tools: [
      {
        name: "listar_candidatos_municipio",
        description: "Lista todos os candidatos para eleições em um município específico",
        inputSchema: {
          type: "object",
          properties: {
            ano: {
              type: "number",
              description: "Ano da eleição (ex: 2020)",
              minimum: 2000,
              maximum: new Date().getFullYear()
            },
            municipio: {
              type: "number", 
              description: "Código do município (ex: 35157 para São Paulo)"
            },
            eleicao: {
              type: "number",
              description: "Código da eleição (ex: 2030402020 para eleições municipais de 2020)"
            },
            cargo: {
              type: "number",
              description: "Código do cargo"
            }
          },
          required: ["ano", "municipio", "eleicao", "cargo"]
        }
      },
      {
        name: "consultar_candidato",
        description: "Consulta informações detalhadas sobre um candidato específico",
        inputSchema: {
          type: "object",
          properties: {
            ano: {
              type: "number",
              description: "Ano da eleição (ex: 2020)",
              minimum: 2000,
              maximum: new Date().getFullYear()
            },
            municipio: {
              type: "number",
              description: "Código do município (ex: 35157 para São Paulo)"
            },
            eleicao: {
              type: "number", 
              description: "Código da eleição (ex: 2030402020 para eleições municipais de 2020)"
            },
            candidato: {
              type: "number",
              description: "Código do candidato"
            }
          },
          required: ["ano", "municipio", "eleicao", "candidato"]
        }
      },
      {
        name: "listar_anos_eleitorais",
        description: "Lista todos os anos eleitorais disponíveis no sistema",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "listar_cargos_municipio",
        description: "Lista os cargos em disputa em um município específico",
        inputSchema: {
          type: "object",
          properties: {
            eleicao: {
              type: "number",
              description: "Código da eleição"
            },
            municipio: {
              type: "number",
              description: "Código do município"
            }
          },
          required: ["eleicao", "municipio"]
        }
      },
      {
        name: "listar_eleicoes_ordinarias",
        description: "Lista todas as eleições ordinárias disponíveis para consulta",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "listar_eleicoes_suplementares",
        description: "Lista eleições suplementares em um estado e ano específicos",
        inputSchema: {
          type: "object",
          properties: {
            ano: {
              type: "number",
              description: "Ano da eleição (ex: 2020)",
              minimum: 2000,
              maximum: new Date().getFullYear()
            },
            uf: {
              type: "string",
              description: "Sigla da unidade federativa (ex: SP, RJ)",
              pattern: "^[A-Z]{2}$"
            }
          },
          required: ["ano", "uf"]
        }
      },
      {
        name: "consultar_prestador_contas",
        description: "Consulta informações sobre prestação de contas de um candidato",
        inputSchema: {
          type: "object",
          properties: {
            eleicao: {
              type: "number",
              description: "Código da eleição"
            },
            ano: {
              type: "number",
              description: "Ano da eleição (ex: 2020)",
              minimum: 2000,
              maximum: new Date().getFullYear()
            },
            municipio: {
              type: "number",
              description: "Código do município"
            },
            cargo: {
              type: "number", 
              description: "Código do cargo"
            },
            candidato: {
              type: "number",
              description: "Código do candidato"
            }
          },
          required: ["eleicao", "ano", "municipio", "cargo", "candidato"]
        }
      }
    ]
  };
});

// Implementação do handler para chamar tools
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "listar_candidatos_municipio": {
        const params = CandidatosParaMunicipioSchema.parse(args);
        const data = await handleApiRequest(() => 
          httpClient.get(`/candidatura/listar/${params.ano}/${params.municipio}/${params.eleicao}/${params.cargo}/candidatos`)
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Candidatos encontrados: ${data.candidatos?.length || 0}\n\n` +
                    JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case "consultar_candidato": {
        const params = ConsultaCandidatoSchema.parse(args);
        const data = await handleApiRequest(() => 
          httpClient.get(`/candidatura/buscar/${params.ano}/${params.municipio}/${params.eleicao}/candidato/${params.candidato}`)
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Informações do candidato:\n\n` +
                    `Nome: ${data.nomeCompleto || data.nomeUrna || 'N/A'}\n` +
                    `Número: ${data.numero || 'N/A'}\n` +
                    `Partido: ${data.partido?.nome || 'N/A'} (${data.partido?.sigla || 'N/A'})\n` +
                    `Cargo: ${data.cargo?.nome || 'N/A'}\n` +
                    `Situação: ${data.descricaoSituacao || 'N/A'}\n\n` +
                    `Detalhes completos:\n${JSON.stringify(data, null, 2)}`
            }
          ]
        };
      }

      case "listar_anos_eleitorais": {
        const data = await handleApiRequest(() => 
          httpClient.get("/eleicao/anos-eleitorais")
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Anos eleitorais disponíveis: ${data.join(", ")}`
            }
          ]
        };
      }

      case "listar_cargos_municipio": {
        const params = CargosMunicipioSchema.parse(args);
        const data = await handleApiRequest(() => 
          httpClient.get(`/eleicao/listar/municipios/${params.eleicao}/${params.municipio}/cargos`)
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Cargos em disputa no município:\n\n` +
                    `Município: ${data.unidadeEleitoralDTO?.nome || 'N/A'}\n` +
                    `UF: ${data.unidadeEleitoralDTO?.sigla || 'N/A'}\n` +
                    `Cargos disponíveis: ${data.cargos?.length || 0}\n\n` +
                    JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case "listar_eleicoes_ordinarias": {
        const data = await handleApiRequest(() => 
          httpClient.get("/eleicao/ordinarias")
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Eleições ordinárias disponíveis: ${data.length}\n\n` +
                    JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case "listar_eleicoes_suplementares": {
        const params = EleicoesSuplementaresEstadoSchema.parse(args);
        const data = await handleApiRequest(() => 
          httpClient.get(`/eleicao/suplementares/${params.ano}/${params.uf}`)
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Eleições suplementares em ${params.uf} (${params.ano}): ${data.length}\n\n` +
                    JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case "consultar_prestador_contas": {
        const params = ConsultaPrestadorSchema.parse(args);
        const data = await handleApiRequest(() => 
          httpClient.get(`/prestador/consulta/${params.eleicao}/${params.ano}/${params.municipio}/${params.cargo}/90/90/${params.candidato}`)
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Informações de prestação de contas:\n\n` +
                    `Candidato: ${data.nomeCompleto || 'N/A'}\n` +
                    `Partido: ${data.nomePartido || 'N/A'} (${data.siglaPartido || 'N/A'})\n` +
                    `CNPJ: ${data.cnpj || 'N/A'}\n` +
                    `Total Recebido: R$ ${data.dadosConsolidados?.totalRecebido || 0}\n` +
                    `Total Despesas: R$ ${data.despesas?.totalDespesasPagas || 0}\n\n` +
                    `Detalhes completos:\n${JSON.stringify(data, null, 2)}`
            }
          ]
        };
      }

      default:
        throw new Error(`Tool desconhecida: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Parâmetros inválidos: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
});

// Função principal para executar o servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Servidor MCP DivulgaCandContas executando via stdio");
}

// Executar o servidor se for o módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Erro fatal no servidor:", error);
    process.exit(1);
  });
}
