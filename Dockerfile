FROM node:16.15.0
# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV development

EXPOSE 3333

CMD ["node", "server.js"]
