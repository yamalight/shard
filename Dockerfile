FROM node:6

# install LDAP lib for headers
RUN apt-get update && apt-get install libldap-dev

# create app dir
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy package.json and install deps
COPY package.json /usr/src/app/
RUN npm install

# copy files
COPY . /usr/src/app

# expose main port
EXPOSE 8080

CMD ["node", "index.js"]
