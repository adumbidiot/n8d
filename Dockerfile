FROM hypriot/rpi-node:latest 

ADD ./package.json ./package.json
RUN npm install

EXPOSE 8080 
#Set up for 8080 ==> 9010

CMD node index.js