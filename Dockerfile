# Use the latest Alpine Linux base image
FROM alpine:latest

# Set the working directory to /app
WORKDIR /app

# Install Node.js and npm using the package manager 'apk'
RUN apk add --update nodejs npm

# Copy the contents of the /dist folder from the host to the /app folder in the container
COPY /dist /app
COPY .env.template /app/.env
COPY package.json /app/package.json

# Install the Node.js application dependencies
RUN npm install

# Expose the port your Node.js application listens on (if applicable)
# Replace 3000 with the actual port number if needed
EXPOSE 3000

# Start the Node.js application
CMD ["node", "index.js"]
