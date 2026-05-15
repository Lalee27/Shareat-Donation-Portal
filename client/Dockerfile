FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Expose port
EXPOSE 5173

# Start development server with host flag to allow outside connections
CMD ["npm", "run", "dev", "--", "--host"]
