import { CreateCategoryDto } from '../../../src/dtos/categories/createCategory.dto';

export const createCategoryData: { [key: string]: CreateCategoryDto } = {
  success: {
    group_id: 'GR2020202020202020',
    category_title: 'category1',
  },
  notfoundGroup: {
    group_id: 'GR6666666666666666',
    category_title: 'category1',
  },
  duplicateCategoryTitle: {
    group_id: 'GR2020202020202020',
    category_title: 'category1',
  },
};
