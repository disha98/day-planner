export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function generateId(): string {
  return crypto.randomUUID();
}
