FROM node:16

WORKDIR /code
ADD api_build.tar.gz .

WORKDIR /code/packages/api

CMD ["node", "dist/main"]