FROM node:10.22.0

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

ADD src /app/src
ADD public /app/public

CMD ["npm", "start"]
