FROM node:13

ENV HOST=localhost
ENV PORT=8080
ENV MONGO_URI_POLICIES=mongodb://10.101.230.90:27017/policies
ENV DITTO_URI_THINGS=http://research.adabyron.uma.es:8054
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