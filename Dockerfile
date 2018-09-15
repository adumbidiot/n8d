FROM hypriot/rpi-node:latest 

ADD ./package.json ./package.json
RUN npm install

ADD ./index.js ./index.js
ADD ./public ./public

RUN apt-get install curl
RUN curl https://sh.rustup.rs -sSf | sh -s -- --help

EXPOSE 8080 
#Set up for 8080 ==> 9010

CMD node index.js