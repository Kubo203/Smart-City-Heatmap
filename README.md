# Smart City Heatmap


## Deployment overview

- **Primary deployment (Docker)**: The CI `docker-build` job builds the app into a Docker image (Node build → Nginx serve) and pushes it to the GitLab Container Registry. This is the source of truth for running the app.
  - Run locally (example):
    ```bash
    docker run -p 8080:80 <registry-image>:latest
    ```
- **Convenience preview (GitLab Pages)**: The `pages` job builds the React app and publishes static files to GitLab Pages for an easy preview. If the Pages job fails, it’s not blocking and does not affect Docker deployment.
  - Pages is optional and may require the project to be public for external access. Note: GitLab Pages only publishes a static export—future changes in project complexity or use of server features may cause this preview to fail or not reflect the production app.
  - For a live preview, visit [this link](https://pages.kpi.fei.tuke.sk/smart-city-heatmap-8078a6/).
