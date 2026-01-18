FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENV BACKEND_AUTH_URL=http://backend:8080

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
