FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy all backend files
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]
