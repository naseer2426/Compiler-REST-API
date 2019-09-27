FROM naseer2426/gl-dep

WORKDIR /app

COPY . /app

EXPOSE 80

RUN npm init -y
RUN npm install --save child_process express multer unzipper cors
RUN apt-get --assume-yes install valgrind

CMD ["node","app.js"]