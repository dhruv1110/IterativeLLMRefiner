# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the model files to the src directory
COPY models.json ./src/app/models.json
COPY models_info.json ./src/app/models_info.json

RUN npm run build
# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]