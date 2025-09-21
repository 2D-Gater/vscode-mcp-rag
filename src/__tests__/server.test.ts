import { describe, it, expect, beforeEach } from '@jest/globals';

// 模拟测试数据
const mockCodeIndex = {
  repositories: [
    {
      name: 'test-repo',
      description: '测试仓库',
      language: 'TypeScript',
      files: 10,
      lastUpdated: '2024-01-15',
    },
  ],
  codeSnippets: [
    {
      content: 'function test() { return "hello"; }',
      filePath: 'test-repo/src/test.ts',
      repository: 'test-repo',
      language: 'typescript',
      lineNumber: 1,
    },
  ],
};

describe('MCP Dummy Server', () => {
  beforeEach(() => {
    // 测试前的设置
  });

  describe('代码搜索功能', () => {
    it('应该能够搜索代码片段', () => {
      const query = 'test';
      const results = mockCodeIndex.codeSnippets.filter(snippet => 
        snippet.content.toLowerCase().includes(query.toLowerCase())
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('test');
    });

    it('应该能够按仓库过滤搜索结果', () => {
      const query = 'test';
      const repository = 'test-repo';
      const results = mockCodeIndex.codeSnippets.filter(snippet => {
        const matchesQuery = snippet.content.toLowerCase().includes(query.toLowerCase());
        const matchesRepository = snippet.repository === repository;
        return matchesQuery && matchesRepository;
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].repository).toBe('test-repo');
    });
  });

  describe('仓库信息功能', () => {
    it('应该能够获取仓库信息', () => {
      const repositoryName = 'test-repo';
      const repoInfo = mockCodeIndex.repositories.find(repo => repo.name === repositoryName);
      
      expect(repoInfo).toBeDefined();
      expect(repoInfo?.name).toBe('test-repo');
      expect(repoInfo?.description).toBe('测试仓库');
    });

    it('应该能够列出所有仓库', () => {
      const repositories = mockCodeIndex.repositories;
      
      expect(repositories).toHaveLength(1);
      expect(repositories[0].name).toBe('test-repo');
    });
  });

  describe('文件内容功能', () => {
    it('应该能够模拟文件内容获取', () => {
      const filePath = 'test-repo/src/test.ts';
      const repository = 'test-repo';
      
      // 模拟文件内容
      const mockContent = `// 文件: ${filePath}\n// 仓库: ${repository}\n\nfunction test() { return "hello"; }`;
      
      expect(mockContent).toContain(filePath);
      expect(mockContent).toContain(repository);
    });
  });
});

