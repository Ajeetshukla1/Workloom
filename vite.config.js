import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Determine the base URL dynamically based on GitHub Actions environment
const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: repoName,
})
