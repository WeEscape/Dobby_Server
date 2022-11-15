export type RepeatCycle = '1D' | '1W' | '1M';

export class Task {
  task_id: string;
  user_id: string;
  category_id: string;
  task_title: string;
  repeat_cycle: RepeatCycle | null;
  memo: string;
  notice_available: number;
  end_repeat_at: Date | null;
  excute_at: Date;
  start_repeat_task_id: string | null;
  created_at: Date;
  updated_at: Date;
}
