import mockExperts from '../data/mockExperts.json';

export interface Expert {
  id: string;
  name: string;
  credentials: string;
  specialties: string[];
  language: string;
  rating: number;
  responseWindow: string;
}

export interface ConsultationRequest {
  name: string;
  concern: string;
  details: string;
  photoName: string | null;
  preferredTime: string;
}

export interface MatchResult {
  referenceId: string;
  expert: Expert;
  status: 'under review';
}

// Hardcoded demo user — no real authentication in this prototype.
export const demoUser = { name: 'Demo Guest' };

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function submitRequest(req: ConsultationRequest): Promise<MatchResult> {
  await wait(900); // simulate network + matching
  const experts = mockExperts as Expert[];
  const expert =
    experts.find((e) => e.specialties.includes(req.concern)) ?? experts[0];
  const referenceId = 'FAT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return { referenceId, expert, status: 'under review' };
}
