'use strict';

import { AuthRepository } from '../repositories/auth.repository';
import { Generator } from '../repositories/base/generator';
import { RdbmsConfig } from '../repositories/base/rdbms.repository';
import { CategoriesRepository } from '../repositories/categories.repository';
import { GroupsRepository } from '../repositories/groups.repository';
import { TasksRepository } from '../repositories/tasks.repository';
import { UsersRepository } from '../repositories/users.repository';
import { AuthService } from '../services/auth.service';
import { CategoriesService } from '../services/categories.service';
import { GroupsService } from '../services/groups.service';
import { SocialService } from '../services/social.service';
import { TasksService } from '../services/tasks.service';
import { UsersService } from '../services/users.service';

export class Container {
  protected generator: Generator;
  authRepository: AuthRepository;
  usersRepository: UsersRepository;
  groupsRepository: GroupsRepository;
  categoriesRepository: CategoriesRepository;
  tasksRepository: TasksRepository;
  socialService: SocialService;
  authService: AuthService;
  usersService: UsersService;
  groupsService: GroupsService;
  categoriesService: CategoriesService;
  tasksService: TasksService;

  constructor(private readonly rdbmsConfig: RdbmsConfig) {}

  getGenerator(): Generator {
    if (!this.generator) {
      this.generator = new Generator();
    }

    return this.generator;
  }

  getAuthRepository(): AuthRepository {
    if (!this.authRepository) {
      this.authRepository = new AuthRepository(this.rdbmsConfig, this.getGenerator());
    }

    return this.authRepository;
  }

  getUsersRepository(): UsersRepository {
    if (!this.usersRepository) {
      this.usersRepository = new UsersRepository(this.rdbmsConfig, this.getGenerator());
    }

    return this.usersRepository;
  }

  getGroupsRepository(): GroupsRepository {
    if (!this.groupsRepository) {
      this.groupsRepository = new GroupsRepository(this.rdbmsConfig, this.getGenerator());
    }

    return this.groupsRepository;
  }

  getCategoriesRepository(): CategoriesRepository {
    if (!this.categoriesRepository) {
      this.categoriesRepository = new CategoriesRepository(this.rdbmsConfig, this.getGenerator());
    }

    return this.categoriesRepository;
  }

  getTasksRepository(): TasksRepository {
    if (!this.tasksRepository) {
      this.tasksRepository = new TasksRepository(this.rdbmsConfig, this.getGenerator());
    }

    return this.tasksRepository;
  }

  getSocialService(): SocialService {
    if (!this.socialService) {
      this.socialService = new SocialService();
    }

    return this.socialService;
  }

  getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService(this.getAuthRepository(), this.getSocialService());
    }

    return this.authService;
  }

  getUsersService(): UsersService {
    if (!this.usersService) {
      this.usersService = new UsersService(this.getUsersRepository());
    }

    return this.usersService;
  }

  getGroupsService(): GroupsService {
    if (!this.groupsService) {
      this.groupsService = new GroupsService(this.getGroupsRepository());
    }

    return this.groupsService;
  }

  getCategoriesService(): CategoriesService {
    if (!this.categoriesService) {
      this.categoriesService = new CategoriesService(this.getCategoriesRepository(), this.getGroupsService());
    }

    return this.categoriesService;
  }

  getTasksService(): TasksService {
    if (!this.tasksService) {
      this.tasksService = new TasksService(
        this.getTasksRepository(),
        this.getGroupsService(),
        this.getCategoriesService(),
      );
    }

    return this.tasksService;
  }
}
