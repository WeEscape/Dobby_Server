import { Router } from 'express';
import { CreateCategoryDto } from '../dtos/categories/createCategory.dto';
import { UpdateCategoryDto } from '../dtos/categories/updateCategory.dto';
import { responseInterceptor } from '../middlewares/response.interceptor';
import { validateBody } from '../middlewares/validateBody.pipe';
import { CategoriesService } from '../services/categories.service';

export const categoriesRouter = (categoriesService: CategoriesService) => {
  const router = Router();

  /** 카테고리 생성 */
  router.post('/', validateBody(CreateCategoryDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;

      const result = await categoriesService.createCategory(user_id, req.body);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 카테고리 목록 조회 */
  router.get('/group/:group_id', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const group_id = req.params.group_id;

      const result = await categoriesService.getCategories(user_id, group_id);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 카테고리 조회 */
  router.get('/:category_id', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const category_id = req.params.category_id;

      const result = await categoriesService.getCategory(user_id, category_id);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 카테고리 수정 */
  router.put('/:category_id', validateBody(UpdateCategoryDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const category_id = req.params.category_id;

      const result = await categoriesService.updateCategory(user_id, category_id, req.body.category_title);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 카테고리 삭제 */
  router.delete('/:category_id', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const category_id = req.params.category_id;

      await categoriesService.deleteCategory(user_id, category_id);

      return res.status(200).json(responseInterceptor(req));
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
