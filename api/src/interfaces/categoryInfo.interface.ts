import { Category } from '../entities/category.entity';

export interface CategoryInfo extends Category {
  task_ids: string[];
}
