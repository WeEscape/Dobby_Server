import { CreateCategoryDto } from '../../../src/dtos/categories/createCategory.dto';

export const createCategoryData: { [key: string]: CreateCategoryDto } = {
  success: {
    group_id: 'GR333333333333',
    category_title: 'category1',
  },
  notfoundGroup: {
    group_id: 'GR444444444444',
    category_title: 'category1',
  },
  duplicateCategoryTitle: {
    group_id: 'GR333333333333',
    category_title: 'category1',
  },
};
