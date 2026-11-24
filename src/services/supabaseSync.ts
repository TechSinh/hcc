import type { PersistedLearningState } from './learningStorage';

export interface SupabaseSyncConfig {
  url: string;
  anonKey: string;
  studentProfileId: string;
  enabled: boolean;
}

export interface SyncResult {
  ok: boolean;
  message: string;
  remoteState?: PersistedLearningState | null;
}

export function getSupabaseSyncConfig(): SupabaseSyncConfig {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  const url = (env.VITE_SUPABASE_URL ?? '').trim().replace(/\/+$/, '');
  const anonKey = (env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  const studentProfileId = (env.VITE_HCC_STUDENT_ID ?? 'pham-hoang-khanh-ngoc-l9').trim();

  return {
    url,
    anonKey,
    studentProfileId,
    enabled: Boolean(url && anonKey),
  };
}

export async function pushLearningStateToSupabase(
  state: PersistedLearningState
): Promise<SyncResult> {
  const cfg = getSupabaseSyncConfig();
  if (!cfg.enabled) {
    return {
      ok: false,
      message:
        'Chưa cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY. Dữ liệu đang lưu an toàn trên thiết bị.',
    };
  }

  try {
    const endpoint = `${cfg.url}/rest/v1/hcc_learning_progress?on_conflict=student_id`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify([
        {
          student_id: cfg.studentProfileId,
          payload: state,
          updated_at: state.updatedAt,
        },
      ]),
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Đồng bộ đám mây chưa thành công (mã ${response.status}). Dữ liệu cục bộ vẫn được giữ nguyên.`,
      };
    }

    return {
      ok: true,
      message: 'Đã đồng bộ tiến độ & sổ lỗi sai của Khánh Ngọc lên Supabase.',
    };
  } catch {
    return {
      ok: false,
      message: 'Không thể kết nối mạng tới Supabase lúc này. Dữ liệu cục bộ vẫn hoạt động bình thường.',
    };
  }
}

export async function pullLearningStateFromSupabase(): Promise<SyncResult> {
  const cfg = getSupabaseSyncConfig();
  if (!cfg.enabled) {
    return {
      ok: false,
      message: 'Chưa cấu hình biến môi trường Supabase.',
      remoteState: null,
    };
  }

  try {
    const endpoint = `${cfg.url}/rest/v1/hcc_learning_progress?student_id=eq.${encodeURIComponent(
      cfg.studentProfileId
    )}&select=payload,updated_at&limit=1`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Không tải được dữ liệu từ Supabase (mã ${response.status}).`,
        remoteState: null,
      };
    }

    const rows = (await response.json()) as Array<{ payload?: PersistedLearningState }>;
    const firstPayload = rows?.[0]?.payload ?? null;
    if (!firstPayload || typeof firstPayload !== 'object') {
      return {
        ok: true,
        message: 'Chưa có bản lưu đám mây trước đó cho hồ sơ này.',
        remoteState: null,
      };
    }

    return {
      ok: true,
      message: 'Đã tải dữ liệu mới nhất từ Supabase.',
      remoteState: firstPayload,
    };
  } catch {
    return {
      ok: false,
      message: 'Lỗi kết nối khi tải dữ liệu từ Supabase.',
      remoteState: null,
    };
  }
}