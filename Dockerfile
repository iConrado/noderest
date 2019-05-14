FROM node:10-alpine
RUN mkdir -p /home/node
WORKDIR /home/node
COPY package.json /home/node/package.json
RUN npm install
COPY ./index.js /home/node/index.js
EXPOSE 3000
CMD ["./start.sh"]