// 邀请码验证工具

// 生成 OFFER2025 到 OFFER2050 的邀请码
function generateInviteCodes(): string[] {
  const codes: string[] = [];
  for (let year = 2025; year <= 2050; year++) {
    codes.push(`OFFER${year}`);
  }
  return codes;
}

export const INVITE_CODES = generateInviteCodes();

export function verifyInviteCode(code: string): boolean {
  return INVITE_CODES.includes(code.toUpperCase().trim());
}

export function isVerified(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('offerpilot_verified') === 'true';
}

export function markVerified(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('offerpilot_verified', 'true');
  localStorage.setItem('offerpilot_invite_code', code.toUpperCase().trim());
}