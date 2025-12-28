FROM node:20-alpine
  WORKDIR /repo

  RUN corepack enable

  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
  COPY packages ./packages
  COPY apps/api ./apps/api

  RUN pnpm install --frozen-lockfile
  RUN pnpm --filter @ruoyi/contracts build
  RUN pnpm --filter @ruoyi/ui build
  
  RUN pnpm --filter @ruoyi/api build

  WORKDIR /repo/apps/api
  ENV NODE_ENV=production
  EXPOSE 3000
  CMD ["node", "dist/main"]