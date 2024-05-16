# Use the official Node.js 20 image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the NestJS application
RUN npm run build

# The application's port number
EXPOSE 1209

# Define the command to run your app using CMD which defines your runtime
CMD ["npm", "run", "start"]
