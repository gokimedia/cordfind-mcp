import test from 'node:test';
import assert from 'node:assert/strict';
import { callRemoteTool, createServer, parseMcpResponse } from '../bin/cordfind-mcp.mjs';

test('parses a JSON MCP response', () => {
  const payload = parseMcpResponse('{"jsonrpc":"2.0","id":1,"result":{"content":[]}}');
  assert.deepEqual(payload.result, { content: [] });
});

test('parses an event-stream MCP response', () => {
  const payload = parseMcpResponse('event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"ok"}]}}\n\n');
  assert.equal(payload.result.content[0].text, 'ok');
});

test('forwards a tool call with MCP headers', async () => {
  let captured;
  const result = await callRemoteTool('search_generator_guides', { query: 'transfer switch', limit: 1 }, async (url, init) => {
    captured = { url, init };
    return new Response(
      'event: message\ndata: {"jsonrpc":"2.0","id":"test","result":{"content":[{"type":"text","text":"result"}]}}\n\n',
      { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
    );
  });

  assert.equal(captured.url, 'https://cordfind.com/api/mcp');
  assert.equal(captured.init.headers['MCP-Protocol-Version'], '2025-06-18');
  assert.equal(JSON.parse(captured.init.body).params.name, 'search_generator_guides');
  assert.equal(result.content[0].text, 'result');
});

test('creates the stdio MCP server', () => {
  assert.ok(createServer());
});
