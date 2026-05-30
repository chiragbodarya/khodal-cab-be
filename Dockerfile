# Use official Node.js 22 (LTS) lightweight image
FROM node:22-alpine

# Create app directory in the container
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (production & development)
RUN npm install

# Copy application source code
COPY . .

# Generate Prisma client based on schema
RUN npx prisma generate

# Expose port 9000 (app port)
EXPOSE 9000

# Command to run the application
CMD ["npm", "start"]
