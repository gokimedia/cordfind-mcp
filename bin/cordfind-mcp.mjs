#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

export const CORD_FIND_MCP_URL = process.env.CORDFIND_MCP_URL || 'https://cordfind.com/api/mcp';

const toolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

export function parseMcpResponse(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error('CordFind returned an empty MCP response.');
  }

  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed);
  }

  const messages = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter((line) => line && line !== '[DONE]')
    .map((line) => JSON.parse(line));

  if (!messages.length) {
    throw new Error('CordFind returned an unsupported MCP response.');
  }

  return messages.findLast((message) => message.result || message.error) ?? messages.at(-1);
}

export async function callRemoteTool(name, args, fetchImpl = fetch) {
  const response = await fetchImpl(CORD_FIND_MCP_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-06-18',
      'User-Agent': 'cordfind-mcp/1.1.0',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method: 'tools/call',
      params: { name, arguments: args },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const payload = parseMcpResponse(await response.text());

  if (!response.ok || payload.error) {
    const detail = payload.error?.message || `HTTP ${response.status}`;
    throw new Error(`CordFind MCP request failed: ${detail}`);
  }

  if (!payload.result?.content) {
    throw new Error('CordFind returned an invalid tool result.');
  }

  return payload.result;
}

function safeRemoteTool(name) {
  return async (args) => {
    try {
      return await callRemoteTool(name, args);
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `${error instanceof Error ? error.message : String(error)}\n\nTry the hosted server directly: https://cordfind.com/mcp`,
          },
        ],
      };
    }
  };
}

export function createServer() {
  const server = new McpServer(
    {
      name: 'cordfind-generator-compatibility',
      version: '1.1.0',
    },
    {
      instructions:
        'Use these read-only tools to search CordFind generator guidance, screen connector compatibility, and estimate extension-cord gauge. Treat all results as planning guidance and verify equipment labels and manufacturer instructions.',
    },
  );

  server.registerTool(
    'search_generator_guides',
    {
      title: 'Search CordFind Generator Guides',
      description:
        'Search CordFind for generator cords, plugs, sizing, transfer equipment, maintenance, and safety guidance. Results include direct CordFind source URLs.',
      inputSchema: z.object({
        query: z.string().min(2).max(100).describe('Generator topic or question'),
        limit: z.number().int().min(1).max(10).default(5).describe('Maximum results'),
      }),
      annotations: toolAnnotations,
    },
    safeRemoteTool('search_generator_guides'),
  );

  server.registerTool(
    'get_connector_compatibility',
    {
      title: 'Check Generator Connector Compatibility',
      description:
        'Screen a generator outlet, destination, and cord distance for direct compatibility, adapter needs, verification boundaries, or unsafe paths.',
      inputSchema: z.object({
        sourceConnectorId: z
          .enum(['520', '1450', 'l1430', 'l1420', 'l630', 'l530', 'cs50', 'tt30'])
          .describe('Generator receptacle family'),
        targetId: z.enum(['inlet', 'rv', 'appliance', 'distribution']).describe('Intended destination'),
        distanceFeet: z.union([z.literal(25), z.literal(50), z.literal(100)]).describe('Planned cord distance in feet'),
      }),
      annotations: toolAnnotations,
    },
    safeRemoteTool('get_connector_compatibility'),
  );

  server.registerTool(
    'calculate_generator_cord_size',
    {
      title: 'Calculate Generator Cord Size',
      description:
        'Compare common American Wire Gauge sizes using load current, voltage, one-way distance, and a voltage-drop planning limit.',
      inputSchema: z.object({
        amps: z.union([z.literal(15), z.literal(20), z.literal(30), z.literal(50)]).describe('Planned current in amperes'),
        volts: z.union([z.literal(120), z.literal(240)]).describe('Circuit voltage'),
        distanceFeet: z.number().min(10).max(200).describe('One-way cord distance in feet'),
        dropLimitPercent: z.union([z.literal(3), z.literal(5)]).default(3).describe('Planning voltage-drop limit'),
      }),
      annotations: toolAnnotations,
    },
    safeRemoteTool('calculate_generator_cord_size'),
  );

  return server;
}

const isDirectRun = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  void serveStdio(createServer);
  console.error('CordFind MCP server running on stdio');
}
