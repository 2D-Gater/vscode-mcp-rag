#!/usr/bin/env node

/**
 * MCP Dummy Server 测试脚本
 * 用于验证 MCP 服务器是否正常工作
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 开始测试 MCP Dummy Server...\n');

// 测试 MCP 协议消息
const testMessages = [
  {
    name: '初始化请求',
    message: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    }
  },
  {
    name: '列出工具请求',
    message: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }
  },
  {
    name: '搜索代码请求',
    message: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'search_code',
        arguments: {
          query: 'function',
          limit: 5
        }
      }
    }
  }
];

// 启动 MCP 服务器进程
const serverProcess = spawn('node', ['dist/index.js'], {
  cwd: projectRoot,
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 0;
let responses = [];

// 处理服务器输出
serverProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      responses.push(response);
      console.log(`✅ 收到响应 (ID: ${response.id}):`, JSON.stringify(response, null, 2));
    } catch (error) {
      console.log('📝 服务器输出:', line);
    }
  }
});

serverProcess.stderr.on('data', (data) => {
  console.log('📝 服务器日志:', data.toString());
});

serverProcess.on('error', (error) => {
  console.error('❌ 服务器启动失败:', error.message);
  process.exit(1);
});

// 等待服务器启动
setTimeout(() => {
  console.log('📤 发送测试消息...\n');
  
  // 发送测试消息
  testMessages.forEach((test, index) => {
    setTimeout(() => {
      console.log(`📤 发送: ${test.name}`);
      serverProcess.stdin.write(JSON.stringify(test.message) + '\n');
    }, index * 1000);
  });
  
  // 等待响应后关闭
  setTimeout(() => {
    console.log('\n🏁 测试完成，关闭服务器...');
    serverProcess.kill();
    
    // 验证响应
    console.log('\n📊 测试结果:');
    console.log(`- 发送消息数: ${testMessages.length}`);
    console.log(`- 收到响应数: ${responses.length}`);
    
    if (responses.length >= testMessages.length) {
      console.log('✅ 所有测试通过！');
    } else {
      console.log('⚠️  部分测试可能失败，请检查服务器日志');
    }
    
    process.exit(0);
  }, testMessages.length * 1000 + 2000);
  
}, 2000);

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 测试被中断');
  serverProcess.kill();
  process.exit(0);
});

