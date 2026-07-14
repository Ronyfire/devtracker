let data = '';
process.stdin.on('data', d => data += d);
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(data); } catch { process.exit(0); }

  const ti = input.tool_input || {};
  const content = ti.content || ti.new_string || '';
  const jwtPattern = /eyJ[A-Za-z0-9_-]{10,}/;

  if (jwtPattern.test(content)) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: 'Blocked: the content being written looks like it contains a JWT or similar token (starts with "eyJ"). Remove the token before writing, or if this is intentional (e.g. an .example file with a placeholder), rephrase it so it does not look like a real token.'
      }
    }));
  }
});
