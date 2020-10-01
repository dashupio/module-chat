# use node
FROM node:alpine3.11

# Create app directory
WORKDIR /usr/src/module

# Copy directory
COPY . /usr/src/module
RUN rm -rf .cache

# Install dependencies
RUN npm i

# CMD
CMD ["node", "index"]