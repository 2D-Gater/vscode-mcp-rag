#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// 定义工具参数的模式
const SearchCodeSchema = z.object({
  query: z.string().describe('搜索查询字符串'),
  repository: z.string().optional().describe('指定仓库名称（可选）'),
  fileType: z.string().optional().describe('文件类型过滤（可选）'),
  limit: z.number().optional().default(10).describe('返回结果数量限制'),
});

const GetFileContentSchema = z.object({
  filePath: z.string().describe('文件路径'),
  repository: z.string().optional().describe('指定仓库名称（可选）'),
});

const GetRepositoryInfoSchema = z.object({
  repository: z.string().describe('仓库名称'),
});

const ListRepositoriesSchema = z.object({
  limit: z.number().optional().default(20).describe('返回结果数量限制'),
});

// 模拟的代码索引数据
const mockCodeIndex = {
  repositories: [
    {
      name: 'frontend-app',
      description: 'React前端应用',
      language: 'TypeScript',
      files: 150,
      lastUpdated: '2024-01-15',
    },
    {
      name: 'backend-api',
      description: 'Node.js后端API服务',
      language: 'JavaScript',
      files: 200,
      lastUpdated: '2024-01-14',
    },
    {
      name: 'data-processing',
      description: 'Python数据处理模块',
      language: 'Python',
      files: 80,
      lastUpdated: '2024-01-13',
    },
  ],
  codeSnippets: [
    {
      content: 'function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}',
      filePath: 'frontend-app/src/utils/calculations.ts',
      repository: 'frontend-app',
      language: 'typescript',
      lineNumber: 15,
    },
    {
      content: 'async function fetchUserData(userId) {\n  const response = await fetch(`/api/users/${userId}`);\n  return response.json();\n}',
      filePath: 'backend-api/src/controllers/userController.js',
      repository: 'backend-api',
      language: 'javascript',
      lineNumber: 42,
    },
    {
      content: 'def process_data(data):\n    """处理输入数据并返回清洗后的结果"""\n    cleaned_data = [item.strip() for item in data if item]\n    return cleaned_data',
      filePath: 'data-processing/src/processors/data_cleaner.py',
      repository: 'data-processing',
      language: 'python',
      lineNumber: 8,
    },
  ],
};

class CodeIndexingServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'vsc-mcp-dummy',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_code',
            description: '在代码库中搜索代码片段',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '搜索查询字符串',
                },
                repository: {
                  type: 'string',
                  description: '指定仓库名称（可选）',
                },
                fileType: {
                  type: 'string',
                  description: '文件类型过滤（可选）',
                },
                limit: {
                  type: 'number',
                  description: '返回结果数量限制',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_file_content',
            description: '获取指定文件的内容',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: '文件路径',
                },
                repository: {
                  type: 'string',
                  description: '指定仓库名称（可选）',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'get_repository_info',
            description: '获取仓库信息',
            inputSchema: {
              type: 'object',
              properties: {
                repository: {
                  type: 'string',
                  description: '仓库名称',
                },
              },
              required: ['repository'],
            },
          },
          {
            name: 'list_repositories',
            description: '列出所有可用的仓库',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: '返回结果数量限制',
                  default: 20,
                },
              },
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_code':
            return await this.searchCode(args);
          case 'get_file_content':
            return await this.getFileContent(args);
          case 'get_repository_info':
            return await this.getRepositoryInfo(args);
          case 'list_repositories':
            return await this.listRepositories(args);
          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async searchCode(args: any) {
    const { query, repository, fileType, limit } = SearchCodeSchema.parse(args);
    
    // 模拟搜索逻辑
    let results = mockCodeIndex.codeSnippets.filter(snippet => {
      const matchesQuery = snippet.content.toLowerCase().includes(query.toLowerCase()) ||
                          snippet.filePath.toLowerCase().includes(query.toLowerCase());
      const matchesRepository = !repository || snippet.repository === repository;
      const matchesFileType = !fileType || snippet.language === fileType;
      
      return matchesQuery && matchesRepository && matchesFileType;
    });

    results = results.slice(0, limit);

    const resultText = results.length > 0 
      ? results.map(result => 
          `文件: ${result.filePath}\n仓库: ${result.repository}\n行号: ${result.lineNumber}\n语言: ${result.language}\n代码:\n\`\`\`${result.language}\n${result.content}\n\`\`\`\n`
        ).join('\n---\n\n')
      : `未找到匹配 "${query}" 的代码片段`;

    return {
      content: [
        {
          type: 'text',
          text: resultText,
        },
      ],
    };
  }

  private async getFileContent(args: any) {
    const { filePath, repository } = GetFileContentSchema.parse(args);
    
    // 模拟文件内容获取
    const mockFileContent = `// 这是文件 ${filePath} 的模拟内容
// 仓库: ${repository || '未指定'}
// 最后更新: 2024-01-15

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const Component: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="component">
      <h1>{title}</h1>
      {children}
    </div>
  );
};

export default Component;`;

    return {
      content: [
        {
          type: 'text',
          text: `文件路径: ${filePath}\n仓库: ${repository || '未指定'}\n\n内容:\n\`\`\`typescript\n${mockFileContent}\n\`\`\``,
        },
      ],
    };
  }

  private async getRepositoryInfo(args: any) {
    const { repository } = GetRepositoryInfoSchema.parse(args);
    
    const repoInfo = mockCodeIndex.repositories.find(repo => repo.name === repository);
    
    if (!repoInfo) {
      return {
        content: [
          {
            type: 'text',
            text: `未找到仓库: ${repository}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `仓库信息:
名称: ${repoInfo.name}
描述: ${repoInfo.description}
主要语言: ${repoInfo.language}
文件数量: ${repoInfo.files}
最后更新: ${repoInfo.lastUpdated}`,
        },
      ],
    };
  }

  private async listRepositories(args: any) {
    const { limit } = ListRepositoriesSchema.parse(args);
    
    const repositories = mockCodeIndex.repositories.slice(0, limit);
    
    const resultText = repositories.map(repo => 
      `- ${repo.name}: ${repo.description} (${repo.language}, ${repo.files} 文件)`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `可用仓库 (${repositories.length}/${mockCodeIndex.repositories.length}):\n\n${resultText}`,
        },
      ],
    };
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Dummy Server 已启动，等待连接...');
  }
}

// 启动服务器
const server = new CodeIndexingServer();
server.run().catch(console.error);

