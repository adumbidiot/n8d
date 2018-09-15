FROM hypriot/rpi-node:latest 

RUN mkdir /app

ADD ./package.json ./app/package.json
RUN cd app && npm install

ADD ./index.js ./app/index.js
ADD ./public ./app/public

RUN apt-get install curl
RUN curl https://sh.rustup.rs -sSf | sh -y

EXPOSE 8080 
#Set up for 8080 ==> 9010

CMD cd app && node index.js