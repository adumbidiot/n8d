FROM hypriot/rpi-node:latest 

ADD ./package.json ./package.json
RUN npm install

ADD ./index.js ./index.js
ADD ./public ./public

EXPOSE 8080 
#Set up for 8080 ==> 9010

CMD node index.js