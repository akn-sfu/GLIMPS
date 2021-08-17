# Deployments

Deployments run completely inside Docker. To manually deploy:

1. Install Docker
2. `git pull` the repository
3. Create a `.env` file containing the following (`[]` not included):

```
DOMAIN=[the domain]
DB_USERNAME=[any username]
DB_PASSWORD=[pick something secure!]
JWT_SIGNING_KEY=[pick something secure!]
GITLAB_BASE_URL=[URL of the target GitLab instance]
```

4. Run `docker-compose -f docker-compose.yml -f docker-compose.deploy.yml build`
5. Run `docker-compose -f docker-compose.yml -f docker-compose.deploy.yml up --force-recreate -d`
6. Wait a few seconds and then run the database migrations: `docker exec -it glimps_api npx typeorm migration:run`
7. You're done!