FROM node:13

ENV HOST=localhost
ENV PORT=8080
ENV MONGO_URI_POLICIES=mongodb://10.110.31.229:27017/policies
ENV DITTO_URI_THINGS=http://research.adabyron.uma.es:8054/api/2/things/
ENV DITTO_USERNAME=ditto
ENV DITTO_PASSWORD=ditto

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE $PORT
CMD [ "npm", "start" ]