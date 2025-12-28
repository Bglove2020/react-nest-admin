FROM node:20-alpine AS builder
  WORKDIR /repo

  RUN corepack enable

  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
  COPY packages ./packages
  COPY apps/web ./apps/web

  RUN pnpm install --frozen-lockfile
  RUN pnpm --filter @ruoyi/contracts build
  RUN pnpm --filter @ruoyi/ui build

  ARG VITE_API_BASE_URL=/api
  ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

  RUN pnpm --filter @ruoyi/web build

  FROM nginx:1.27-alpine
  COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
  COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html
  EXPOSE 80