let data = '';
process.stdin.on('data', d => data += d);
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(data); } catch { process.exit(0); }

  const filePath = (input.tool_input && input.tool_input.file_path) || '';
  const base = filePath.replace(/\\/g, '/').split('/').pop() || '';
  const isEnvFile = /^\.env(\..+)?$/.test(base);
  const isExample = base === '.env.example';

  if (isEnvFile && !isExample) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Blocked: writing to "${base}" is not allowed (.env files may hold real secrets). Use .env.example for a committable template instead.`
      }
    }));
  }
});
