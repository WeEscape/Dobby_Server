#! /bin/bash

read -p "environment(prod/dev): " environment

if [ ${environment} != "prod" ] && [ ${environment} != 'dev' ] ; then
  echo "environment: please enter only prod/dev"
  exit
fi

read -p "build(y/n): " build


if [ ${build} == "y" ] ; then
  docker-compose -f docker-compose.yml -f docker-compose.${environment}.yml up -d --build && docker volume prune -f && docker image prune -f
elif [ ${build} == "n" ] ; then
  docker-compose -f docker-compose.yml -f docker-compose.${environment}.yml up -d && docker volume prune -f
else
  echo "build: please enter only y/n"
  exit
fi