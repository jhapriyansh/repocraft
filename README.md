# RepoCraft
RepoCraft is an innovative tool that transforms GitHub repositories into high-quality documentation, portfolio entries, resume bullets, and LinkedIn posts. This project aims to simplify the process of showcasing projects and skills, providing a seamless experience for developers to highlight their work. Deployed on [vercel](https://repocraft-phi.vercel.app/)

## Features
* Generate documentation for GitHub repositories
* Create portfolio entries and resume bullets from repository data
* Produce LinkedIn post content based on repository information
* API endpoints for repository details, usage, and authentication
* Support for multiple repositories and users

## Tech Stack
* Frontend: React, Next, React Markdown
* Backend: Next, Next Auth, Mongoose, Groq SDK
* Dependencies: Axios, Date-FNS

## Installation
1. Clone the repository: `git clone https://github.com/jhapriyansh/repocraft`
2. Install dependencies: `npm install`
3. Set up environment variables (see below)

## Usage
1. Start the development server: `npm run dev`
2. Access the application at [http://localhost:3000](http://localhost:3000)

## Configuration
The following environment variables can be configured:
* `DATABASE_URL`: MongoDB connection string
* `GITHUB_TOKEN`: GitHub API token
* `NEXT_AUTH_SECRET`: Next Auth secret key

## API Endpoints
The following API endpoints are available:
* `GET /api/repos`: Retrieve a list of repositories
* `GET /api/repos/[name]`: Retrieve details for a specific repository
* `POST /api/repos/[name]/update-readme`: Update the README for a repository
* `GET /api/usage`: Retrieve usage data
* `POST /api/auth/[...nextauth]`: Authentication endpoint
* `GET /api/generate/readme`: Generate README content
* `GET /api/generate/portfolio`: Generate portfolio content
* `GET /api/generate/resume`: Generate resume content
* `GET /api/generate/linkedin`: Generate LinkedIn post content

## Contributing
Contributions are welcome! Please submit a pull request with your changes and a brief description of the updates.

## License
RepoCraft is licensed under the [MIT License](https://github.com/jhapriyansh/repocraft/blob/main/LICENSE).
