import { Group } from '../entities/group.entity';

export interface GroupInfo extends Group {
  user_ids: string[];
}
