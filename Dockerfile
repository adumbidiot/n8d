FROM resin/rpi-raspbian:latest 

#Update empty source lists
RUN apt-get update

#Install apt-utils
RUN apt-get install apt-utils -y


#Install Node
RUN apt-get install node -y 


#Create App dir
RUN mkdir /app


#Add package.json and Install Packages to Prevent Redownloads
ADD ./package.json ./app/package.json
RUN cd app && /usr/local/bin/npm install


#Add everything else
ADD ./public ./app/public


RUN apt-get install curl -y

RUN curl https://sh.rustup.rs -sSf > ./rust-init.sh
RUN chmod +x ./rust-init.sh
RUN ./rust-init.sh -y

#Set up for 8080 ==> 9010
EXPOSE 8080 


CMD cd app && /usr/local/bin/node index.js