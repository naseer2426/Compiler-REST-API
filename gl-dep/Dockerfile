# Use an official Python runtime as a parent image
FROM ubuntu

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

EXPOSE 80

RUN apt update
RUN apt install -y apt-utils
RUN apt install -y curl
RUN apt --assume-yes install nodejs
RUN apt --assume-yes install npm
RUN apt --assume-yes install python3.6
RUN apt --assume-yes install python3-pip
RUN apt --assume-yes install build-essential
RUN apt --assume-yes install manpages-dev
RUN gcc --version
RUN g++ --version
RUN apt --assume-yes install openjdk-8-jdk
RUN java -version
RUN javac -version