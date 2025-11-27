# Use the official Node.js image as a base
FROM node:22

# Set the working directory
WORKDIR /app

# Copy the package files first (for caching purposes)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .
RUN npm run build

# Build the application for production
# RUN npm run build

# # Set the environment variable for the PORT
# ENV PORT=8080
# Expose the port Vite will use to serve the app
EXPOSE 4173


# Use Vite's built-in preview server to serve the production build
CMD ["npm", "strat"]
