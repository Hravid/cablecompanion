# Cable Position Calculator

This project is a web application for calculating and visualizing cable positions in a bundle. It uses Node.js, Express, and Three.js for the backend and frontend.

## Features

- Calculate cable positions based on the number of holes and cables
- Visualize the cable positions in 3D using Three.js
- Update cable bundle settings dynamically

## Getting Started

### Prerequisites

- Node.js (version 14.x or later)
- Azure account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Hravid/cablecompanion.git
   cd cablecompanion
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## Deployment

### Deploying to Azure

To deploy this application to Azure, follow these steps:

1. Install the Azure CLI:

   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. Log in to your Azure account:

   ```bash
   az login
   ```

3. Create a resource group:

   ```bash
   az group create --name <your-resource-group> --location <your-location>
   ```

4. Create an App Service plan:

   ```bash
   az appservice plan create --name <your-app-service-plan> --resource-group <your-resource-group> --sku FREE
   ```

5. Deploy the application:

   ```bash
   npm run deploy
   ```

   The application will be deployed to Azure and available at `https://<your-app-name>.azurewebsites.net`.

### Setting up Azure Pipelines

To set up Azure Pipelines for CI/CD, follow these steps:

1. Create a new pipeline in your Azure DevOps project.
2. Select the repository containing your project.
3. Configure the pipeline using the `azure-pipelines.yml` file in the repository.
4. Save and run the pipeline.

The pipeline will build, test, and deploy the application to Azure.

## Configuration

The application can be configured using environment variables. The following environment variables are available:

- `PORT`: The port on which the server will run (default: 3000)

## License

This project is licensed under the MIT License.
