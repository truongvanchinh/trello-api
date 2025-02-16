FROM node:20.16.0

EXPOSE 8017

WORKDIR /backend/app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

CMD ["yarn", "dev", "--host", "0.0.0.0"]