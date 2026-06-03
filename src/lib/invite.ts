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

// 检查是否已验证（同时检查 localStorage 和 Cookie）
export function isVerified(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 检查 Cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'offerpilot_verified' && value === 'true') {
      return true;
    }
  }
  
  // 检查 localStorage（向后兼容）
  return localStorage.getItem('offerpilot_verified') === 'true';
}

export function markVerified(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('offerpilot_verified', 'true');
  localStorage.setItem('offerpilot_invite_code', code.toUpperCase().trim());
}