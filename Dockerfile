FROM node:lts-bullseye-slim
WORKDIR /app

COPY package*.json ./
RUN apt-get update && \ 
    apt-get install -y build-essential \
    wget \
    python3 \
    make \
    gcc \ 
    libc6-dev 
RUN npm install

COPY . .
EXPOSE 3300

CMD [ "node", "server.js" ]
