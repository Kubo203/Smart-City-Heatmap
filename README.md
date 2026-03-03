# Smart City Heatmap

<h2 align="center">Demo video</h2>
<table align="center">
  <tr>
    <td align="center">
      <a href="https://youtu.be/MFtIvfLTrg0">
        <img src="https://img.youtube.com/vi/MFtIvfLTrg0/maxresdefault.jpg" width="350" alt="Demo Video">
      </a>
    </td>
  </tr>
</table>

## About the project

Smart City Heatmap is a web application that uses interactive heatmaps to make it easier to **find a place to be**—whether you are looking for a spot to live, work, or visit—or to **find accommodation to buy or rent**. The heatmap visualizes data (e.g. livability, amenities, safety, or similar) so you can quickly see which areas match your needs.

## My contribution

My main role in this project was to build the **Login page** (frontend and backend) with **authentication** using **Supabase**. One of my classmates helped me with the auth integration.

## Deployment overview

- **Primary deployment (Docker)**: The CI `docker-build` job builds the app into a Docker image (Node build → Nginx serve) and pushes it to the GitLab Container Registry. This is the source of truth for running the app.
  - Run locally (example):
    ```bash
    docker run -p 8080:80 <registry-image>:latest
    ```
- **Convenience preview (GitLab Pages)**: The `pages` job builds the React app and publishes static files to GitLab Pages for an easy preview. If the Pages job fails, it’s not blocking and does not affect Docker deployment.
  - Pages is optional and may require the project to be public for external access. Note: GitLab Pages only publishes a static export—future changes in project complexity or use of server features may cause this preview to fail or not reflect the production app.
  - For a live preview, visit [this link](https://pages.kpi.fei.tuke.sk/smart-city-heatmap-8078a6/).
