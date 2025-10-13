# Use Node.js 20 LTS as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY . .

# Build the application based on the environment
ARG BUILD_ENV=prod
RUN if [ "$BUILD_ENV" = "prod" ]; then \
      npm run build:prod; \
    elif [ "$BUILD_ENV" = "qa" ]; then \
      npm run build:qa; \
    elif [ "$BUILD_ENV" = "dev" ]; then \
      npm run build:dev; \
    else \
      npm run build:local; \
    fi

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["node", "/app/build/server.js"]
